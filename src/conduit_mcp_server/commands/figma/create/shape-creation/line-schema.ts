import { z } from "zod";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Shared Zod schema for line configuration objects.
 * Used for both single and batch line creation tools.
 */
export const LineSchema = z.object({
  x1: z.number()
    .describe("X coordinate for the start point. Example: 10"),
  y1: z.number()
    .describe("Y coordinate for the start point. Example: 20"),
  x2: z.number()
    .describe("X coordinate for the end point. Example: 110"),
  y2: z.number()
    .describe("Y coordinate for the end point. Example: 20"),
  parentId: z.string()
    .describe("Figma node ID of the parent.")
    .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
    .optional(),
  strokeColor: z.any()
    .describe("Stroke color for the line.")
    .optional(),
  strokeWeight: z.number()
    .describe("Stroke weight for the line.")
    .optional()
});

/**
 * TypeScript type inferred from LineSchema.
 */
export type LineConfig = z.infer<typeof LineSchema>;
