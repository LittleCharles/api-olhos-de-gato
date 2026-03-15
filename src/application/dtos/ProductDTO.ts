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
  subcategoryIds: z.array(z.string().min(1)).optional().default([]),
  promoPrice: z.number().positive().nullable().optional(),
  sku: z.string().min(1).max(50),
  isFeatured: z.boolean().default(false),
  isRecommended: z.boolean().default(false),
  brandId: z.string().uuid().nullable().optional(),
  ean: z.string().regex(/^\d{8,13}$/, "EAN deve ter 8 a 13 digitos").nullable().optional(),
  weight: z.number().positive().nullable().optional(),
  lengthCm: z.number().positive().nullable().optional(),
  widthCm: z.number().positive().nullable().optional(),
  heightCm: z.number().positive().nullable().optional(),
  countryOrigin: z.string().max(100).nullable().optional(),
  manufacturer: z.string().max(200).nullable().optional(),
  bulletPoints: z.array(z.string().max(200)).max(5).optional(),
  specifications: z.array(z.object({ label: z.string().min(1).max(100), value: z.string().min(1).max(500) })).max(20).optional().default([]),
});

export const UpdateProductSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(2).max(200).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  animalType: z.nativeEnum(AnimalType).optional(),
  subcategoryIds: z.array(z.string().min(1)).optional().default([]),
  promoPrice: z.number().positive().nullable().optional(),
  sku: z.string().min(1).max(50).optional(),
  isFeatured: z.boolean().optional(),
  isRecommended: z.boolean().optional(),
  brandId: z.string().uuid().nullable().optional(),
  ean: z.string().regex(/^\d{8,13}$/, "EAN deve ter 8 a 13 digitos").nullable().optional(),
  weight: z.number().positive().nullable().optional(),
  lengthCm: z.number().positive().nullable().optional(),
  widthCm: z.number().positive().nullable().optional(),
  heightCm: z.number().positive().nullable().optional(),
  countryOrigin: z.string().max(100).nullable().optional(),
  manufacturer: z.string().max(200).nullable().optional(),
  bulletPoints: z.array(z.string().max(200)).max(5).optional(),
  specifications: z.array(z.object({ label: z.string().min(1).max(100), value: z.string().min(1).max(500) })).max(20).optional(),
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
