import { z } from "zod";

/**
 * Shared Zod schema for fill properties.
 */
export const FillPropsSchema = z.object({
  color: z.tuple([
    z.number().min(0).max(1).describe("Red channel (0-1)"),
    z.number().min(0).max(1).describe("Green channel (0-1)"),
    z.number().min(0).max(1).describe("Blue channel (0-1)"),
    z.number().min(0).max(1).describe("Alpha channel (0-1)")
  ])
    .describe("RGBA color array for the fill. Each value must be between 0 and 1.")
    .optional(),
  visible: z.boolean().optional().describe("Whether the fill is visible."),
  opacity: z.number().min(0).max(1).optional().describe("Opacity of the fill (0-1)."),
});

/**
 * Shared Zod schema for stroke properties.
 */
export const StrokePropsSchema = z.object({
  color: z.tuple([
    z.number().min(0).max(1).describe("Red channel (0-1)"),
    z.number().min(0).max(1).describe("Green channel (0-1)"),
    z.number().min(0).max(1).describe("Blue channel (0-1)"),
    z.number().min(0).max(1).describe("Alpha channel (0-1)")
  ])
    .describe("RGBA color array for the stroke. Each value must be between 0 and 1.")
    .optional(),
  weight: z.number().min(0.1).max(100).optional().describe("Stroke weight. Must be between 0.1 and 100."),
});

/**
 * TypeScript types inferred from schemas.
 */
export type FillProps = z.infer<typeof FillPropsSchema>;
export type StrokeProps = z.infer<typeof StrokePropsSchema>;
