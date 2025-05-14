import { z } from "zod";

/**
 * Shared Zod schema for auto layout configuration.
 */
export const AutoLayoutConfigSchema = z.object({
  layoutMode: z.enum(["HORIZONTAL", "VERTICAL", "NONE"])
    .describe('The auto layout mode to set: "HORIZONTAL", "VERTICAL", or "NONE".'),
});

/**
 * Shared Zod schema for auto layout resizing.
 */
export const AutoLayoutResizingSchema = z.object({
  axis: z.enum(["horizontal", "vertical"])
    .describe('The axis to set sizing mode for: "horizontal" or "vertical".'),
  mode: z.enum(["FIXED", "HUG", "FILL"])
    .describe('The sizing mode to set: "FIXED", "HUG", or "FILL".'),
});

/**
 * TypeScript types inferred from schemas.
 */
export type AutoLayoutConfig = z.infer<typeof AutoLayoutConfigSchema>;
export type AutoLayoutResizing = z.infer<typeof AutoLayoutResizingSchema>;
