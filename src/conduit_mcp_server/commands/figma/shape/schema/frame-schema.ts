import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Shared Zod schema for frame configuration objects.
 * Used for single frame creation tools.
 */
export const SingleFrameSchema = z.object({
  x: z.number()
    .describe("X coordinate for the top-left corner. Example: 50"),
  y: z.number()
    .describe("Y coordinate for the top-left corner. Example: 100"),
  width: z.number()
    .describe("Width in pixels. Example: 400"),
  height: z.number()
    .describe("Height in pixels. Example: 300"),
  name: z.string()
    .describe("Name for the frame node. Example: 'Main Frame'")
    .optional(),
  parentId: z.string()
    .describe("Figma node ID of the parent.")
    .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
    .optional(),
  fillColor: z.any()
    .describe("Fill color for the frame.")
    .optional(),
  strokeColor: z.any()
    .describe("Stroke color for the frame.")
    .optional(),
  strokeWeight: z.number()
    .describe("Stroke weight for the frame.")
    .optional()
});

export const BatchFramesSchema = z.array(SingleFrameSchema);

export const FrameSchema = z.union([
  SingleFrameSchema,
  BatchFramesSchema
]);

/**
 * TypeScript type inferred from FrameSchema.
 */
export type FrameConfig = z.infer<typeof SingleFrameSchema>;
export type BatchFramesConfig = z.infer<typeof BatchFramesSchema>;
