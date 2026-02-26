import { z } from "zod";

export const CustomerFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const UpdateCustomerStatusSchema = z.object({
  status: z.enum(["active", "inactive"]),
});

export type CustomerFiltersDTO = z.infer<typeof CustomerFiltersSchema>;
export type UpdateCustomerStatusDTO = z.infer<typeof UpdateCustomerStatusSchema>;
