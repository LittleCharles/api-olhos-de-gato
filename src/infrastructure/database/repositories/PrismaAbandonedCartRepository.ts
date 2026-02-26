import { injectable } from "tsyringe";
import { prisma } from "../prisma/client.js";
import type {
  IAbandonedCartRepository,
  AbandonedCartResult,
  AbandonedCartData,
} from "../../../domain/repositories/IAbandonedCartRepository.js";
import type { PaginationParams } from "../../../domain/repositories/IProductRepository.js";

@injectable()
export class PrismaAbandonedCartRepository implements IAbandonedCartRepository {
  async findAbandoned(pagination?: PaginationParams): Promise<AbandonedCartResult> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    // Abandoned = cart updated more than 24h ago AND has items
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const where = {
      updatedAt: { lt: twentyFourHoursAgo },
      items: { some: {} },
    };

    const [carts, total] = await Promise.all([
      prisma.cart.findMany({
        where,
        include: {
          customer: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
          items: {
            include: {
              product: { select: { name: true, price: true, promoPrice: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.cart.count({ where }),
    ]);

    let totalValue = 0;

    const data: AbandonedCartData[] = carts.map((cart) => {
      const items = cart.items.map((item) => {
        const price = item.product.promoPrice
          ? Number(item.product.promoPrice)
          : Number(item.product.price);
        return {
          productName: item.product.name,
          quantity: item.quantity,
          price,
        };
      });

      const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      totalValue += cartTotal;

      return {
        id: cart.id,
        customerName: cart.customer.user.name,
        customerEmail: cart.customer.user.email,
        items,
        total: Math.round(cartTotal * 100) / 100,
        lastActivity: cart.updatedAt,
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalValue: Math.round(totalValue * 100) / 100,
    };
  }
}
