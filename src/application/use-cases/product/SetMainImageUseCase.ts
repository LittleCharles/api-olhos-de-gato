import { injectable } from "tsyringe";
import { AppError } from "../../../shared/errors/AppError.js";
import { prisma } from "../../../infrastructure/database/prisma/client.js";

@injectable()
export class SetMainImageUseCase {
  constructor() {}

  async execute(productId: string, imageId: string) {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new AppError("Imagem não encontrada", 404);
    }

    // Unset all main flags for this product
    await prisma.productImage.updateMany({
      where: { productId },
      data: { isMain: false },
    });

    // Set the selected image as main
    await prisma.productImage.update({
      where: { id: imageId },
      data: { isMain: true },
    });

    return { imageId, isMain: true };
  }
}
