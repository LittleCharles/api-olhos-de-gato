import { inject, injectable } from "tsyringe";
import type { IStorageProvider } from "../../interfaces/IStorageProvider.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { prisma } from "../../../infrastructure/database/prisma/client.js";

@injectable()
export class DeleteProductImageUseCase {
  constructor(
    @inject("StorageProvider")
    private storageProvider: IStorageProvider,
  ) {}

  async execute(productId: string, imageId: string) {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new AppError("Imagem não encontrada", 404);
    }

    try {
      await this.storageProvider.delete(image.url);
    } catch (err) {
      console.error("Erro ao deletar arquivo fisico:", err);
    }
    await prisma.productImage.delete({ where: { id: imageId } });

    // If deleted image was main, set first remaining as main
    if (image.isMain) {
      const firstRemaining = await prisma.productImage.findFirst({
        where: { productId },
        orderBy: { order: "asc" },
      });
      if (firstRemaining) {
        await prisma.productImage.update({
          where: { id: firstRemaining.id },
          data: { isMain: true },
        });
      }
    }

    return { deleted: true };
  }
}
