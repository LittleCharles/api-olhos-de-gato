import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { ListFavoritesUseCase } from "../../../application/use-cases/favorite/ListFavoritesUseCase.js";
import { AddFavoriteUseCase } from "../../../application/use-cases/favorite/AddFavoriteUseCase.js";
import { RemoveFavoriteUseCase } from "../../../application/use-cases/favorite/RemoveFavoriteUseCase.js";
import { prisma } from "../../database/prisma/client.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { z } from "zod";

const AddFavoriteSchema = z.object({
  productId: z.string().uuid(),
});

export class FavoriteController {
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

  async list(request: FastifyRequest, reply: FastifyReply) {
    const customerId = await favoriteController.getCustomerId(request.user.id);

    const listFavoritesUseCase = container.resolve(ListFavoritesUseCase);
    const favorites = await listFavoritesUseCase.execute(customerId);

    return reply.send(
      favorites.map((f) => ({
        id: f.id,
        productId: f.productId,
        productName: f.productName,
        productSlug: f.productSlug,
        productPrice: f.productPrice,
        productPromoPrice: f.productPromoPrice,
        productImage: f.productImage,
        createdAt: f.createdAt.toISOString(),
      })),
    );
  }

  async add(request: FastifyRequest, reply: FastifyReply) {
    const customerId = await favoriteController.getCustomerId(request.user.id);
    const { productId } = AddFavoriteSchema.parse(request.body);

    const addFavoriteUseCase = container.resolve(AddFavoriteUseCase);
    await addFavoriteUseCase.execute(customerId, productId);

    return reply.status(201).send({ message: "Produto adicionado aos favoritos" });
  }

  async remove(request: FastifyRequest, reply: FastifyReply) {
    const { productId } = request.params as { productId: string };
    const customerId = await favoriteController.getCustomerId(request.user.id);

    const removeFavoriteUseCase = container.resolve(RemoveFavoriteUseCase);
    await removeFavoriteUseCase.execute(customerId, productId);

    return reply.status(204).send();
  }
}

const favoriteController = new FavoriteController();
