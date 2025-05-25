import { z } from "zod";

export const UnifiedEventSchema = z.object({
  eventType: z.string(),
  filter: z.any().optional(),
  subscribe: z.boolean(),
  subscriptionId: z.string().optional()
});
