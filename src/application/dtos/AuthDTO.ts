import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  name: z.string().min(2).max(100),
  phone: z
    .string()
    .regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos sem máscara")
    .optional()
    .nullable(),
  acceptedTerms: z.literal(true, {
    message: "Você precisa aceitar os termos de uso",
  }),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  rememberMe: z.boolean().optional().default(false),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;
