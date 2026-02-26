import { inject, injectable } from "tsyringe";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import type { IStorageProvider } from "../../interfaces/IStorageProvider.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { prisma } from "../../../infrastructure/database/prisma/client.js";

@injectable()
export class UploadProductImagesUseCase {
  constructor(
    @inject("ProductRepository")
    private productRepository: IProductRepository,
    @inject("StorageProvider")
    private storageProvider: IStorageProvider,
  ) {}

  async execute(
    productId: string,
    files: Array<{ buffer: Buffer; filename: string; mimetype: string }>,
  ) {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new AppError("Produto não encontrado", 404);
    }

    const existingImages = await prisma.productImage.count({
      where: { productId },
    });

    if (existingImages + files.length > 5) {
      throw new AppError("Produto pode ter no máximo 5 imagens", 400);
    }

    const isFirstImage = existingImages === 0;
    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = await this.storageProvider.upload({
        file: file.buffer,
        fileName: file.filename,
        mimeType: file.mimetype,
        folder: "products",
      });

      const image = await prisma.productImage.create({
        data: {
          productId,
          url,
          alt: product.name,
          order: existingImages + i,
          isMain: isFirstImage && i === 0,
        },
      });

      uploadedImages.push(image);
    }

    return uploadedImages;
  }
}
