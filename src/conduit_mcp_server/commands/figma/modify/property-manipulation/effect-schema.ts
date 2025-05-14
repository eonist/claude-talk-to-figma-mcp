import { z } from "zod";

/**
 * Shared Zod schema for a Figma effect object.
 * This covers common effect types like DROP_SHADOW, INNER_SHADOW, LAYER_BLUR, BACKGROUND_BLUR.
 */
export const EffectSchema = z.object({
  type: z.enum(["DROP_SHADOW", "INNER_SHADOW", "LAYER_BLUR", "BACKGROUND_BLUR"])
    .describe("Type of effect."),
  color: z.string().optional().describe("Color for shadow effects (hex or rgba)."),
  offset: z.object({
    x: z.number().optional(),
    y: z.number().optional()
  }).optional().describe("Offset for shadow effects."),
  radius: z.number().optional().describe("Blur radius or shadow spread."),
  spread: z.number().optional().describe("Shadow spread."),
  visible: z.boolean().optional().describe("Whether the effect is visible."),
  blendMode: z.string().optional().describe("Blend mode for the effect."),
  opacity: z.number().min(0).max(1).optional().describe("Opacity of the effect (0-1)."),
});

/**
 * Shared Zod schema for an array of Figma effect objects.
 */
export const EffectsArraySchema = z.array(EffectSchema)
  .min(1)
  .max(20)
  .describe("Array of effect objects to apply. Must contain 1 to 20 items. Each effect object should match Figma's effect schema.");

/**
 * TypeScript types inferred from schemas.
 */
export type Effect = z.infer<typeof EffectSchema>;
