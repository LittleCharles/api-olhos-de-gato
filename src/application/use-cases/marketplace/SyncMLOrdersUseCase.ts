import { inject, injectable } from "tsyringe";
import type { IMarketplaceAccountRepository } from "../../../domain/repositories/IMarketplaceAccountRepository.js";
import type { IMarketplaceListingRepository } from "../../../domain/repositories/IMarketplaceListingRepository.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import type { IMarketplaceProvider } from "../../interfaces/IMarketplaceProvider.js";
import { PrismaClient } from "@prisma/client";

interface SyncOrdersResult {
  processed: number;
  skipped: number;
  stockUpdated: number;
  errors: string[];
}

@injectable()
export class SyncMLOrdersUseCase {
  private prisma = new PrismaClient();

  constructor(
    @inject("MarketplaceAccountRepository")
    private accountRepository: IMarketplaceAccountRepository,
    @inject("MarketplaceListingRepository")
    private listingRepository: IMarketplaceListingRepository,
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) {}

  async execute(
    provider: IMarketplaceProvider,
    accountId: string,
  ): Promise<SyncOrdersResult> {
    const account = await this.accountRepository.findById(accountId);
    if (!account || !account.accessToken || !account.sellerId) {
      return { processed: 0, skipped: 0, stockUpdated: 0, errors: [] };
    }

    const result: SyncOrdersResult = {
      processed: 0,
      skipped: 0,
      stockUpdated: 0,
      errors: [],
    };

    try {
      // Fetch orders from last 24 hours
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const orders = await provider.getOrders(account.accessToken, account.sellerId, since);

      // Get all active listings for this account to map externalId → productId
      const listings = await this.listingRepository.findActiveByAccountId(accountId);
      const externalIdToProductId = new Map<string, string>();
      for (const listing of listings) {
        if (listing.externalId) {
          externalIdToProductId.set(listing.externalId, listing.productId);
        }
      }

      for (const order of orders) {
        // Only process paid/confirmed orders
        if (order.status !== "paid" && order.status !== "confirmed") {
          continue;
        }

        // Check if already processed (by externalOrderId in orders table)
        const existing = await this.prisma.order.findFirst({
          where: { externalOrderId: order.externalId },
        });

        if (existing) {
          result.skipped++;
          continue;
        }

        // Decrement stock for each item
        for (const item of order.items) {
          try {
            // Find product by externalProductId (ML item ID) → listing → productId
            const productId = externalIdToProductId.get(item.externalProductId);
            if (productId) {
              await this.productRepository.updateStock(productId, -item.quantity);
              result.stockUpdated++;
            }
          } catch (error) {
            const msg = error instanceof Error ? error.message : "Erro desconhecido";
            result.errors.push(`Item ${item.externalProductId}: ${msg}`);
          }
        }

        // Mark order as processed by creating a minimal record
        try {
          await this.prisma.order.create({
            data: {
              customerId: await this.getOrCreateMLCustomerId(),
              status: "CONFIRMED",
              paymentStatus: "PAID",
              paymentMethod: "PIX", // ML handles payment
              subtotal: order.total,
              total: order.total,
              source: "MARKETPLACE",
              externalOrderId: order.externalId,
              notes: `Pedido Mercado Livre #${order.externalId} - Comprador: ${order.buyerName}`,
              items: {
                create: order.items.map((item) => {
                  const productId = externalIdToProductId.get(item.externalProductId);
                  return {
                    productId: productId || "unknown",
                    productName: `ML Item ${item.externalProductId}`,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    total: item.unitPrice * item.quantity,
                  };
                }),
              },
            },
          });
        } catch {
          // If order creation fails (e.g. missing product), still count as processed
          // Stock was already decremented above
        }

        result.processed++;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      result.errors.push(`Sync geral: ${msg}`);
    }

    return result;
  }

  private async getOrCreateMLCustomerId(): Promise<string> {
    // Find or create a placeholder User + Customer for ML orders
    const mlEmail = "marketplace@olhosdegato.com.br";

    let user = await this.prisma.user.findUnique({
      where: { email: mlEmail },
      include: { customer: true },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: mlEmail,
          name: "Mercado Livre",
          passwordHash: "marketplace-placeholder",
          role: "CUSTOMER",
          isActive: true,
          customer: {
            create: {},
          },
        },
        include: { customer: true },
      });
    }

    if (!user.customer) {
      const customer = await this.prisma.customer.create({
        data: { userId: user.id },
      });
      return customer.id;
    }

    return user.customer.id;
  }
}
