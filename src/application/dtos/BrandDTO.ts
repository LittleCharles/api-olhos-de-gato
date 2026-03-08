import { z } from "zod";

export const CreateBrandSchema = z.object({
  name: z.string().min(2).max(100),
});

export const UpdateBrandSchema = z.object({
  name: z.string().min(2).max(100).optional(),
});

export type CreateBrandDTO = z.infer<typeof CreateBrandSchema>;
export type UpdateBrandDTO = z.infer<typeof UpdateBrandSchema>;
