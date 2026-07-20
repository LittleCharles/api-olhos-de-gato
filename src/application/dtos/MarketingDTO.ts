import { z } from "zod";

export const MarketingAttributionQuerySchema = z.object({
  period: z.enum(["7d", "30d", "6m"]).default("30d"),
});

export type MarketingAttributionQueryDTO = z.infer<typeof MarketingAttributionQuerySchema>;
