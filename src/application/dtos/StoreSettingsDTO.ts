import { z } from "zod";

export const UpdateStoreSettingsSchema = z.object({
  storeName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  shippingFreeAbove: z.number().min(0).optional(),
  shippingBasePrice: z.number().min(0).optional(),
  estimatedDelivery: z.string().optional(),
  pixEnabled: z.boolean().optional(),
  creditCardEnabled: z.boolean().optional(),
  creditCardMaxInstallments: z.number().int().min(1).max(24).optional(),
  boletoEnabled: z.boolean().optional(),
  cardFeePercent: z.number().min(0).max(100).optional(),
  cardFeeFixed: z.number().min(0).optional(),
  pixFeePercent: z.number().min(0).max(100).optional(),
  applyCardFeeToShipping: z.boolean().optional(),
  socialInstagram: z.string().url().or(z.literal("")).optional(),
  socialFacebook: z.string().url().or(z.literal("")).optional(),
  socialTiktok: z.string().url().or(z.literal("")).optional(),
  socialMercadoLivre: z.string().url().or(z.literal("")).optional(),
  socialShopee: z.string().url().or(z.literal("")).optional(),
  socialAmazon: z.string().url().or(z.literal("")).optional(),
  lookerStudioUrl: z.string().url().or(z.literal("")).optional(),
});

export type UpdateStoreSettingsDTO = z.infer<typeof UpdateStoreSettingsSchema>;
