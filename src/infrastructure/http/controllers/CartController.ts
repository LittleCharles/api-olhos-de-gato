import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { GetCartUseCase } from "../../../application/use-cases/cart/GetCartUseCase.js";
import { AddToCartUseCase } from "../../../application/use-cases/cart/AddToCartUseCase.js";
import { UpdateCartItemUseCase } from "../../../application/use-cases/cart/UpdateCartItemUseCase.js";
import { RemoveCartItemUseCase } from "../../../application/use-cases/cart/RemoveCartItemUseCase.js";
import { ClearCartUseCase } from "../../../application/use-cases/cart/ClearCartUseCase.js";
import {
  AddToCartSchema,
  UpdateCartItemSchema,
} from "../../../application/dtos/CartDTO.js";
import { prisma } from "../../database/prisma/client.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class CartController {
  private async getCustomerId(userId: string): Promise<string> {
    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!customer) {
      throw new AppError("Perfil de cliente não encontrado", 404);
    }
    return customer.id;
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const customerId = await cartController.getCustomerId(request.user.id);

    const getCartUseCase = container.resolve(GetCartUseCase);
    const cart = await getCartUseCase.execute(customerId);

    if (!cart) {
      return reply.send({ items: [], total: 0 });
    }

    const items = cart.items.map((item) => {
      const unitPrice = item.productPromoPrice ?? item.productPrice;
      return {
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSlug: item.productSlug,
        productPrice: item.productPrice,
        productPromoPrice: item.productPromoPrice,
        productImage: item.productImage,
        productAnimalType: item.productAnimalType,
        quantity: item.quantity,
        subtotal: unitPrice * item.quantity,
      };
    });

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return reply.send({ items, total });
  }

  async addItem(request: FastifyRequest, reply: FastifyReply) {
    const customerId = await cartController.getCustomerId(request.user.id);
    const { productId, quantity } = AddToCartSchema.parse(request.body);

    const addToCartUseCase = container.resolve(AddToCartUseCase);
    await addToCartUseCase.execute(customerId, productId, quantity);

    return reply.status(201).send({ message: "Item adicionado ao carrinho" });
  }

  async updateItem(request: FastifyRequest, reply: FastifyReply) {
    const { itemId } = request.params as { itemId: string };
    const customerId = await cartController.getCustomerId(request.user.id);
    const { quantity } = UpdateCartItemSchema.parse(request.body);

    const cart = await prisma.cart.findUnique({
      where: { customerId },
      select: { id: true },
    });
    if (!cart) {
      throw new AppError("Carrinho não encontrado", 404);
    }

    const updateCartItemUseCase = container.resolve(UpdateCartItemUseCase);
    await updateCartItemUseCase.execute(itemId, cart.id, quantity);

    return reply.send({ message: "Quantidade atualizada" });
  }

  async removeItem(request: FastifyRequest, reply: FastifyReply) {
    const { itemId } = request.params as { itemId: string };
    const customerId = await cartController.getCustomerId(request.user.id);

    const cart = await prisma.cart.findUnique({
      where: { customerId },
      select: { id: true },
    });
    if (!cart) {
      throw new AppError("Carrinho não encontrado", 404);
    }

    const removeCartItemUseCase = container.resolve(RemoveCartItemUseCase);
    await removeCartItemUseCase.execute(itemId, cart.id);

    return reply.status(204).send();
  }

  async clear(request: FastifyRequest, reply: FastifyReply) {
    const customerId = await cartController.getCustomerId(request.user.id);

    const clearCartUseCase = container.resolve(ClearCartUseCase);
    await clearCartUseCase.execute(customerId);

    return reply.status(204).send();
  }
}

const cartController = new CartController();
