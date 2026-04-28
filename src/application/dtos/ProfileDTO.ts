import { z } from "zod";
import { CPF } from "../../domain/value-objects/CPF.js";

const cpfSchema = z.string().refine(
  (v) => {
    try {
      CPF.create(v);
      return true;
    } catch {
      return false;
    }
  },
  { message: "CPF inválido" },
);

const phoneSchema = z
  .string()
  .regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos sem máscara");

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100),
  phone: phoneSchema.optional().nullable(),
  cpf: cpfSchema.optional().nullable(),
  birthDate: z.coerce.date().optional().nullable(),
});

export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>;
