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
  socialInstagram: z.string().optional(),
  socialFacebook: z.string().optional(),
  socialTiktok: z.string().optional(),
});

export type UpdateStoreSettingsDTO = z.infer<typeof UpdateStoreSettingsSchema>;
