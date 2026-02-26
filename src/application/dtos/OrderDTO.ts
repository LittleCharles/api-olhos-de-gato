import { z } from "zod";
import { OrderStatus, PaymentMethod } from "../../domain/enums/index.js";

export const CreateOrderSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes: z.string().optional(),
  pickupLocation: z.string().optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  notes: z.string().optional(),
});

export const AdminOrderFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const UpdateTrackingSchema = z.object({
  trackingCode: z.string().min(1),
});

export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusDTO = z.infer<typeof UpdateOrderStatusSchema>;
export type AdminOrderFiltersDTO = z.infer<typeof AdminOrderFiltersSchema>;
export type UpdateTrackingDTO = z.infer<typeof UpdateTrackingSchema>;
