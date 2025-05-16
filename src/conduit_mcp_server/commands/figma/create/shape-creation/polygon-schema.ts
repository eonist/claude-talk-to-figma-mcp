import { z } from "zod";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";

/**
 * Shared Zod schema for polygon configuration objects.
 * Used for batch polygon creation tools.
 */
export const PolygonSchema = z.object({
  x: z.number()
    .describe("X coordinate for the top-left corner. Example: 10"),
  y: z.number()
    .describe("Y coordinate for the top-left corner. Example: 20"),
  width: z.number()
    .describe("Width in pixels. Example: 100"),
  height: z.number()
    .describe("Height in pixels. Example: 100"),
  sides: z.number().min(3)
    .describe("Number of sides (minimum 3). Example: 5"),
  name: z.string()
    .describe("Name for the polygon node.")
    .optional(),
  parentId: z.string()
    .describe("Figma node ID of the parent.")
    .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
    .optional(),
  fillColor: z.any()
    .describe("Fill color for the polygon.")
    .optional(),
  strokeColor: z.any()
    .describe("Stroke color for the polygon.")
    .optional(),
  strokeWeight: z.number()
    .describe("Stroke weight for the polygon.")
    .optional()
});

/**
 * TypeScript type inferred from PolygonSchema.
 */
export type PolygonConfig = z.infer<typeof PolygonSchema>;
