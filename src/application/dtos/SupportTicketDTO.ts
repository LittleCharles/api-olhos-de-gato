import { z } from "zod";
import { TicketStatus, TicketSubject } from "../../domain/enums/index.js";

export const CreateTicketSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional(),
  subject: z.nativeEnum(TicketSubject),
  message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
  orderId: z.string().uuid().optional(),
});

export const TicketFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(TicketStatus).optional(),
  subject: z.nativeEnum(TicketSubject).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const ReplyTicketSchema = z.object({
  message: z.string().min(1, "Mensagem não pode ser vazia"),
});

export const UpdateTicketStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus),
});

export type CreateTicketDTO = z.infer<typeof CreateTicketSchema>;
export type TicketFiltersDTO = z.infer<typeof TicketFiltersSchema>;
export type ReplyTicketDTO = z.infer<typeof ReplyTicketSchema>;
export type UpdateTicketStatusDTO = z.infer<typeof UpdateTicketStatusSchema>;
