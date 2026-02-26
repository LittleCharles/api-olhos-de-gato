import { z } from "zod";

export const DashboardStatsQuerySchema = z.object({
  period: z.enum(["7d", "30d", "6m"]).default("30d"),
});

export const DashboardChartQuerySchema = z.object({
  period: z.enum(["7d", "30d", "6m"]).default("30d"),
});

export const DashboardTopProductsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(6),
});

export const DashboardRecentOrdersQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(6),
});

export type DashboardStatsQueryDTO = z.infer<typeof DashboardStatsQuerySchema>;
export type DashboardChartQueryDTO = z.infer<typeof DashboardChartQuerySchema>;
export type DashboardTopProductsQueryDTO = z.infer<typeof DashboardTopProductsQuerySchema>;
export type DashboardRecentOrdersQueryDTO = z.infer<typeof DashboardRecentOrdersQuerySchema>;
