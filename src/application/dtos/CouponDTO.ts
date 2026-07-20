import { z } from "zod";

// Código sempre normalizado MAIÚSCULO (busca e unicidade case-insensitive na prática)
const couponCodeSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[A-Za-z0-9]+$/, "Use apenas letras e números")
  .transform((v) => v.toUpperCase());

const couponDatesRefine = {
  check: (d: { startsAt?: Date | null; expiresAt?: Date | null }) =>
    !d.startsAt || !d.expiresAt || d.expiresAt > d.startsAt,
  options: {
    message: "Data de expiração deve ser posterior à de início",
    path: ["expiresAt"],
  },
};

export const CreateCouponSchema = z
  .object({
    code: couponCodeSchema,
    description: z.string().max(255).optional(),
    discountPercent: z.coerce.number().min(1).max(100),
    minOrderValue: z.coerce.number().positive().nullish(),
    usageLimit: z.coerce.number().int().positive().nullish(),
    startsAt: z.coerce.date().nullish(),
    expiresAt: z.coerce.date().nullish(),
    isActive: z.boolean().default(true),
  })
  .refine(couponDatesRefine.check, couponDatesRefine.options);

export const UpdateCouponSchema = z
  .object({
    code: couponCodeSchema.optional(),
    description: z.string().max(255).nullish(),
    discountPercent: z.coerce.number().min(1).max(100).optional(),
    minOrderValue: z.coerce.number().positive().nullish(),
    usageLimit: z.coerce.number().int().positive().nullish(),
    startsAt: z.coerce.date().nullish(),
    expiresAt: z.coerce.date().nullish(),
    isActive: z.boolean().optional(),
  })
  .refine(couponDatesRefine.check, couponDatesRefine.options);

export const ValidateCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1)
    .max(30)
    .transform((v) => v.toUpperCase()),
});

export type CreateCouponDTO = z.infer<typeof CreateCouponSchema>;
export type UpdateCouponDTO = z.infer<typeof UpdateCouponSchema>;
export type ValidateCouponDTO = z.infer<typeof ValidateCouponSchema>;
