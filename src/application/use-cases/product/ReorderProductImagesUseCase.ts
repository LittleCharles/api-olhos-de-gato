import { injectable } from "tsyringe";
import { AppError } from "../../../shared/errors/AppError.js";
import { prisma } from "../../../infrastructure/database/prisma/client.js";

@injectable()
export class ReorderProductImagesUseCase {
  async execute(productId: string, imageIds: string[]) {
    const images = await prisma.productImage.findMany({
      where: { productId },
      select: { id: true },
    });

    if (images.length === 0) {
      throw new AppError("Produto não possui imagens", 404);
    }

    const existingIds = new Set(images.map((img) => img.id));
    for (const id of imageIds) {
      if (!existingIds.has(id)) {
        throw new AppError(`Imagem ${id} não pertence a este produto`, 400);
      }
    }

    await prisma.$transaction(
      imageIds.map((id, index) =>
        prisma.productImage.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );

    return { message: "Ordem atualizada com sucesso" };
  }
}
