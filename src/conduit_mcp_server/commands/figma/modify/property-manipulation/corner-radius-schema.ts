import { z } from "zod";

/**
 * Shared Zod schema for corner radius configuration.
 */
export const CornerRadiusSchema = z.object({
  radius: z.number().min(0)
    .describe("The new corner radius to set, in pixels. Must be a non-negative number (>= 0)."),
  corners: z.array(z.boolean()).length(4).optional()
    .describe("Optional. An array of four booleans indicating which corners to apply the radius to, in the order: [top-left, top-right, bottom-right, bottom-left]. If omitted, applies to all corners."),
});

/**
 * TypeScript type inferred from schema.
 */
export type CornerRadiusConfig = z.infer<typeof CornerRadiusSchema>;
