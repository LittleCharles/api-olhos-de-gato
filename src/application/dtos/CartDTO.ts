import { z } from "zod";

export const AddToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).default(1),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1),
});

export type AddToCartDTO = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemDTO = z.infer<typeof UpdateCartItemSchema>;
