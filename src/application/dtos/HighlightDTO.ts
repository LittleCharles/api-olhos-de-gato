import { z } from "zod";

export const UpdateHighlightsSchema = z.object({
  featuredIds: z.array(z.string().uuid()),
  recommendedIds: z.array(z.string().uuid()),
});

export type UpdateHighlightsDTO = z.infer<typeof UpdateHighlightsSchema>;
