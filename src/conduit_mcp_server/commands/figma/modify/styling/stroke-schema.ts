import { z } from "zod";

/**
 * Shared Zod schema for stroke color and weight.
 */
export const StrokeColorSchema = z.object({
  r: z.number().min(0).max(1).describe("Red channel (0-1)"),
  g: z.number().min(0).max(1).describe("Green channel (0-1)"),
  b: z.number().min(0).max(1).describe("Blue channel (0-1)"),
  a: z.number().min(0).max(1).optional().describe("Optional. Alpha channel (0-1)"),
  weight: z.number().min(0.1).max(100).optional().describe("Optional. Stroke weight. Must be between 0.1 and 100."),
});

/**
 * TypeScript type inferred from schema.
 */
export type StrokeColor = z.infer<typeof StrokeColorSchema>;
