import { z } from "zod";
import { ReviewStatus } from "../../domain/enums/index.js";

export const ReviewFiltersSchema = z.object({
  search: z.string().optional(),
  productId: z.string().uuid().optional(),
  status: z.nativeEnum(ReviewStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const PublicReviewFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ReviewFiltersDTO = z.infer<typeof ReviewFiltersSchema>;
export type PublicReviewFiltersDTO = z.infer<typeof PublicReviewFiltersSchema>;
