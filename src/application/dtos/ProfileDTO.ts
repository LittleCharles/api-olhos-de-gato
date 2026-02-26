import { z } from "zod";

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().optional().nullable(),
  cpf: z.string().length(11).optional().nullable(),
  birthDate: z.coerce.date().optional().nullable(),
});

export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>;
