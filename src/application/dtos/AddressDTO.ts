import { z } from "zod";

export const CreateAddressSchema = z.object({
  street: z.string().min(1).max(200),
  number: z.string().min(1).max(20),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  state: z.string().length(2),
  zipCode: z.string().min(8).max(9),
  isDefault: z.boolean().optional().default(false),
});

export const UpdateAddressSchema = CreateAddressSchema;

export type CreateAddressDTO = z.infer<typeof CreateAddressSchema>;
export type UpdateAddressDTO = z.infer<typeof UpdateAddressSchema>;
