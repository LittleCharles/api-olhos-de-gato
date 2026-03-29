import { inject, injectable } from "tsyringe";
import type { IMarketplaceAccountRepository } from "../../../domain/repositories/IMarketplaceAccountRepository.js";
import type { IMarketplaceListingRepository } from "../../../domain/repositories/IMarketplaceListingRepository.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { MarketplaceListing } from "../../../domain/entities/MarketplaceListing.js";
import { Money } from "../../../domain/value-objects/Money.js";
import { MarketplaceListingStatus } from "../../../domain/enums/index.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { randomUUID } from "crypto";

interface BatchCreateInput {
  accountId: string;
  productIds: string[];
}

interface BatchCreateResult {
  created: number;
  skipped: number;
  errors: string[];
  listings: MarketplaceListing[];
}

@injectable()
export class CreateBatchListingsUseCase {
  constructor(
    @inject("MarketplaceAccountRepository")
    private accountRepository: IMarketplaceAccountRepository,
    @inject("MarketplaceListingRepository")
    private listingRepository: IMarketplaceListingRepository,
    @inject("ProductRepository")
    private productRepository: IProductRepository,
  ) {}

  async execute(data: BatchCreateInput): Promise<BatchCreateResult> {
    const account = await this.accountRepository.findById(data.accountId);
    if (!account) {
      throw new AppError("Conta de marketplace não encontrada", 404);
    }

    if (!account.isActive) {
      throw new AppError("Conta de marketplace não está ativa", 400);
    }

    const result: BatchCreateResult = {
      created: 0,
      skipped: 0,
      errors: [],
      listings: [],
    };

    for (const productId of data.productIds) {
      try {
        const product = await this.productRepository.findById(productId);
        if (!product) {
          result.errors.push(`Produto ${productId.substring(0, 8)} não encontrado`);
          continue;
        }

        const existing = await this.listingRepository.findByAccountAndProduct(data.accountId, productId);
        if (existing) {
          result.skipped++;
          continue;
        }

        const listing = new MarketplaceListing({
          id: randomUUID(),
          accountId: data.accountId,
          productId,
          externalId: null,
          externalUrl: null,
          price: Money.create(product.promoPrice?.getValue() ?? product.price.getValue()),
          status: MarketplaceListingStatus.DRAFT,
          lastSyncAt: null,
          lastError: null,
          categoryMapping: null,
          metadata: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const saved = await this.listingRepository.create(listing);
        result.listings.push(saved);
        result.created++;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        result.errors.push(`Produto ${productId.substring(0, 8)}: ${message}`);
      }
    }

    return result;
  }
}
