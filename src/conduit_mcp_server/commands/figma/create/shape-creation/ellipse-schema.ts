import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Shared Zod schema for ellipse configuration objects.
 * Used for both single and batch ellipse creation tools.
 */
export const EllipseSchema = z.object({
  x: z.number()
    .describe("X coordinate for the top-left corner. Example: 60"),
  y: z.number()
    .describe("Y coordinate for the top-left corner. Example: 80"),
  width: z.number()
    .describe("Width in pixels. Example: 120"),
  height: z.number()
    .describe("Height in pixels. Example: 90"),
  name: z.string()
    .describe("Name for the ellipse node. Example: 'Ellipse1'")
    .optional(),
  parentId: z.string()
    .describe("Figma node ID of the parent.")
    .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
    .optional(),
  fillColor: z.any()
    .describe("Fill color for the ellipse.")
    .optional(),
  strokeColor: z.any()
    .describe("Stroke color for the ellipse.")
    .optional(),
  strokeWeight: z.number()
    .describe("Stroke weight for the ellipse.")
    .optional()
});

/**
 * TypeScript type inferred from EllipseSchema.
 */
export type EllipseConfig = z.infer<typeof EllipseSchema>;
