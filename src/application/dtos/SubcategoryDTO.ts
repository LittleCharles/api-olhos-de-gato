import { z } from "zod";
import { AnimalType } from "../../domain/enums/index.js";

export const CreateSubcategorySchema = z.object({
  id: z.string().min(1).max(50),
  animalType: z.nativeEnum(AnimalType),
  name: z.string().min(2).max(100),
  icon: z.string().min(1).max(50),
});

export const UpdateSubcategorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  icon: z.string().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
});

export type CreateSubcategoryDTO = z.infer<typeof CreateSubcategorySchema>;
export type UpdateSubcategoryDTO = z.infer<typeof UpdateSubcategorySchema>;
