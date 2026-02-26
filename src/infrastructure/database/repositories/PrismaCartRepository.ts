import { injectable } from "tsyringe";
import { prisma } from "../prisma/client.js";
import { ICartRepository, CartWithItems, CartItemWithProduct } from "../../../domain/repositories/ICartRepository.js";
import { randomUUID } from "crypto";

@injectable()
export class PrismaCartRepository implements ICartRepository {
  async findByCustomerId(customerId: string): Promise<CartWithItems | null> {
    const cart = await prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isMain: true }, take: 1 },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!cart) return null;

    return {
      id: cart.id,
      customerId: cart.customerId,
      items: cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSlug: item.product.slug,
        productPrice: Number(item.product.price),
        productPromoPrice: item.product.promoPrice ? Number(item.product.promoPrice) : null,
        productImage: item.product.images[0]?.url ?? null,
        quantity: item.quantity,
      })),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  async getOrCreateCart(customerId: string): Promise<string> {
    const existing = await prisma.cart.findUnique({
      where: { customerId },
      select: { id: true },
    });

    if (existing) return existing.id;

    const cart = await prisma.cart.create({
      data: { id: randomUUID(), customerId },
    });

    return cart.id;
  }

  async addItem(cartId: string, productId: string, quantity: number): Promise<void> {
    await prisma.cartItem.create({
      data: {
        id: randomUUID(),
        cartId,
        productId,
        quantity,
      },
    });
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async removeItem(itemId: string): Promise<void> {
    await prisma.cartItem.delete({ where: { id: itemId } });
  }

  async clearCart(cartId: string): Promise<void> {
    await prisma.cartItem.deleteMany({ where: { cartId } });
  }

  async findItemById(itemId: string): Promise<{ id: string; cartId: string; productId: string; quantity: number } | null> {
    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item) return null;
    return { id: item.id, cartId: item.cartId, productId: item.productId, quantity: item.quantity };
  }

  async findItemByProduct(cartId: string, productId: string): Promise<{ id: string; quantity: number } | null> {
    const item = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId, productId } },
    });
    if (!item) return null;
    return { id: item.id, quantity: item.quantity };
  }
}
