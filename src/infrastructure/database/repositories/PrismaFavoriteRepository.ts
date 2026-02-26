import { injectable } from "tsyringe";
import { prisma } from "../prisma/client.js";
import { IFavoriteRepository, FavoriteWithProduct } from "../../../domain/repositories/IFavoriteRepository.js";
import { randomUUID } from "crypto";

@injectable()
export class PrismaFavoriteRepository implements IFavoriteRepository {
  async findByCustomerId(customerId: string): Promise<FavoriteWithProduct[]> {
    const favorites = await prisma.favorite.findMany({
      where: { customerId },
      include: {
        product: {
          include: {
            images: { where: { isMain: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return favorites.map((f) => ({
      id: f.id,
      productId: f.productId,
      productName: f.product.name,
      productSlug: f.product.slug,
      productPrice: Number(f.product.price),
      productPromoPrice: f.product.promoPrice ? Number(f.product.promoPrice) : null,
      productImage: f.product.images[0]?.url ?? null,
      createdAt: f.createdAt,
    }));
  }

  async findByCustomerAndProduct(customerId: string, productId: string): Promise<{ id: string } | null> {
    const favorite = await prisma.favorite.findUnique({
      where: { customerId_productId: { customerId, productId } },
      select: { id: true },
    });
    return favorite;
  }

  async add(customerId: string, productId: string): Promise<void> {
    await prisma.favorite.create({
      data: {
        id: randomUUID(),
        customerId,
        productId,
      },
    });
  }

  async remove(customerId: string, productId: string): Promise<void> {
    await prisma.favorite.delete({
      where: { customerId_productId: { customerId, productId } },
    });
  }
}
