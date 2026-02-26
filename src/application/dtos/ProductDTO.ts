import { z } from "zod";
import { AnimalType } from "../../domain/enums/index.js";

export const CreateProductSchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  animalType: z.nativeEnum(AnimalType),
  subcategoryId: z.string().min(1).nullable().optional(),
  promoPrice: z.number().positive().nullable().optional(),
  sku: z.string().min(1).max(50),
  isFeatured: z.boolean().default(false),
  isRecommended: z.boolean().default(false),
});

export const UpdateProductSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(2).max(200).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  animalType: z.nativeEnum(AnimalType).optional(),
  subcategoryId: z.string().min(1).optional(),
  promoPrice: z.number().positive().nullable().optional(),
  sku: z.string().min(1).max(50).optional(),
  isFeatured: z.boolean().optional(),
  isRecommended: z.boolean().optional(),
});

// z.coerce.boolean() usa Boolean("false") = true, entao precisamos de coercao customizada
const queryBool = z.preprocess(
  (v) => v === "true" || v === true ? true : v === "false" || v === false ? false : undefined,
  z.boolean().optional(),
);

export const ProductFiltersSchema = z.object({
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  isActive: queryBool,
  onlyActive: z.preprocess(
    (v) => v === "false" || v === false ? false : true,
    z.boolean(),
  ),
  onlyInStock: queryBool,
  animalType: z.nativeEnum(AnimalType).optional(),
  subcategoryId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const ToggleFeaturedSchema = z.object({ isFeatured: z.boolean() });
export const ToggleRecommendedSchema = z.object({ isRecommended: z.boolean() });

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;
export type UpdateProductDTO = z.infer<typeof UpdateProductSchema>;
export type ProductFiltersDTO = z.infer<typeof ProductFiltersSchema>;
export type ToggleFeaturedDTO = z.infer<typeof ToggleFeaturedSchema>;
export type ToggleRecommendedDTO = z.infer<typeof ToggleRecommendedSchema>;
