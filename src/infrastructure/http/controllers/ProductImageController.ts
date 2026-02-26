import { FastifyRequest, FastifyReply } from "fastify";
import { container } from "tsyringe";
import { UploadProductImagesUseCase } from "../../../application/use-cases/product/UploadProductImagesUseCase.js";
import { DeleteProductImageUseCase } from "../../../application/use-cases/product/DeleteProductImageUseCase.js";
import { SetMainImageUseCase } from "../../../application/use-cases/product/SetMainImageUseCase.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class ProductImageController {
  async upload(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id: productId } = request.params;

    const parts = request.files();
    const files: Array<{
      buffer: Buffer;
      filename: string;
      mimetype: string;
    }> = [];

    for await (const part of parts) {
      const buffer = await part.toBuffer();
      files.push({
        buffer,
        filename: part.filename,
        mimetype: part.mimetype,
      });
    }

    if (files.length === 0) {
      throw new AppError("Nenhuma imagem enviada", 400);
    }

    const useCase = container.resolve(UploadProductImagesUseCase);
    const images = await useCase.execute(productId, files);

    return reply.status(201).send({
      message: `${images.length} imagem(ns) enviada(s) com sucesso`,
      images: images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        order: img.order,
        isMain: img.isMain,
      })),
    });
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string; imageId: string } }>,
    reply: FastifyReply,
  ) {
    const { id: productId, imageId } = request.params;

    const useCase = container.resolve(DeleteProductImageUseCase);
    await useCase.execute(productId, imageId);

    return reply.status(204).send();
  }

  async setMain(
    request: FastifyRequest<{ Params: { id: string; imageId: string } }>,
    reply: FastifyReply,
  ) {
    const { id: productId, imageId } = request.params;

    const useCase = container.resolve(SetMainImageUseCase);
    const result = await useCase.execute(productId, imageId);

    return reply.send(result);
  }
}
