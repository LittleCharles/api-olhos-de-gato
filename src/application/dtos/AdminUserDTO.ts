import { z } from "zod";

export const CreateAdminSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").trim(),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
  phone: z.string().optional(),
});

export const ListAdminsFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const ToggleAdminStatusSchema = z.object({
  isActive: z.boolean(),
});

export type CreateAdminDTO = z.infer<typeof CreateAdminSchema>;
export type ListAdminsFiltersDTO = z.infer<typeof ListAdminsFiltersSchema>;
export type ToggleAdminStatusDTO = z.infer<typeof ToggleAdminStatusSchema>;
