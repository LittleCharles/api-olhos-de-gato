import { z } from "zod";

export const UploadProductImagesSchema = z.object({
  productId: z.string().uuid(),
});

export const DeleteProductImageSchema = z.object({
  productId: z.string().uuid(),
  imageId: z.string().uuid(),
});

export const SetMainImageSchema = z.object({
  productId: z.string().uuid(),
  imageId: z.string().uuid(),
});

export type UploadProductImagesDTO = z.infer<typeof UploadProductImagesSchema>;
export type DeleteProductImageDTO = z.infer<typeof DeleteProductImageSchema>;
export type SetMainImageDTO = z.infer<typeof SetMainImageSchema>;
