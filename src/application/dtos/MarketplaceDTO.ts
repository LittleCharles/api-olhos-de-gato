import { z } from "zod";
import { MarketplacePlatform, MarketplaceListingStatus } from "../../domain/enums/index.js";

// ==================== Accounts ====================

export const MarketplacePlatformParam = z.nativeEnum(MarketplacePlatform);

export const OAuthCallbackSchema = z.object({
  code: z.string().min(1),
});

// ==================== Listings ====================

export const CreateListingSchema = z.object({
  accountId: z.string().uuid(),
  productId: z.string().uuid(),
  price: z.number().positive(),
  categoryMapping: z.string().optional(),
});

export const UpdateListingSchema = z.object({
  price: z.number().positive().optional(),
  categoryMapping: z.string().optional(),
});

const queryBool = z.preprocess(
  (v) => v === "true" || v === true ? true : v === "false" || v === false ? false : undefined,
  z.boolean().optional(),
);

export const ListingFiltersSchema = z.object({
  accountId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  status: z.nativeEnum(MarketplaceListingStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ==================== Types ====================

export type OAuthCallbackDTO = z.infer<typeof OAuthCallbackSchema>;
export type CreateListingDTO = z.infer<typeof CreateListingSchema>;
export type UpdateListingDTO = z.infer<typeof UpdateListingSchema>;
export type ListingFiltersDTO = z.infer<typeof ListingFiltersSchema>;
