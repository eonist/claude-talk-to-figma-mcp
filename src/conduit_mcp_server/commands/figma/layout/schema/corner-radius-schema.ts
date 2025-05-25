import { z } from "zod";

export const CornerRadiusSchema = z.object({
  radius: z.number()
    .min(0)
    .describe("The corner radius to set, in pixels. Must be a non-negative number."),
  corners: z.array(z.boolean())
    .length(4)
    .optional()
    .describe("Optional array of four booleans indicating which corners to apply the radius to, in order: [top-left, top-right, bottom-right, bottom-left].")
});
