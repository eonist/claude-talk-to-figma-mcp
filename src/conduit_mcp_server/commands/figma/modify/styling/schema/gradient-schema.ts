import { z } from "zod";

/**
 * Shared Zod schema for a single gradient color stop.
 */
export const GradientStopSchema = z.object({
  position: z.number().min(0).max(1)
    .describe("Position of the stop (0-1)."),
  color: z.tuple([
    z.number().min(0).max(1).describe("Red channel (0-1)"),
    z.number().min(0).max(1).describe("Green channel (0-1)"),
    z.number().min(0).max(1).describe("Blue channel (0-1)"),
    z.number().min(0).max(1).describe("Alpha channel (0-1)")
  ]).describe("RGBA color array (4 numbers, each 0-1)."),
});

/**
 * Shared Zod schema for a gradient definition.
 */
export const GradientDefinitionSchema = z.object({
  name: z.string().min(1).max(100)
    .describe("Name for the gradient style. Must be a non-empty string up to 100 characters."),
  gradientType: z.enum(["LINEAR", "RADIAL", "ANGULAR", "DIAMOND"])
    .describe('Type of gradient: "LINEAR", "RADIAL", "ANGULAR", or "DIAMOND".'),
  stops: z.array(GradientStopSchema)
    .min(2)
    .max(10)
    .describe("Array of color stops. Each stop is an object with position and color. Must contain 2 to 10 stops."),
  mode: z.string().optional()
    .describe("Optional. Gradient mode."),
  opacity: z.number().min(0).max(1).optional()
    .describe("Optional. Opacity of the gradient (0-1)."),
  transformMatrix: z.array(z.array(z.number())).optional()
    .describe("Optional. Transform matrix for the gradient."),
});

/**
 * TypeScript types inferred from schemas.
 */
export type GradientStop = z.infer<typeof GradientStopSchema>;
export type GradientDefinition = z.infer<typeof GradientDefinitionSchema>;
