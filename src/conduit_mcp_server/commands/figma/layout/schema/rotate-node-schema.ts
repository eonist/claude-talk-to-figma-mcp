import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

export const RotateNodeShape = {
  nodeId: z.string()
    .refine(isValidNodeId, { message: "Must be a valid Figma node ID (e.g., '123:456' or 'I422:10713;1082:2236')" })
    .describe("The unique Figma node ID to rotate."),
  angle: z.number()
    .min(-360)
    .max(360)
    .describe("The rotation angle in degrees. Positive is clockwise."),
  pivot: z.enum(['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'custom'])
    .optional()
    .default('center')
    .describe("The pivot point for rotation. Defaults to 'center'."),
  pivotPoint: z.object({
    x: z.number().describe("X coordinate of the custom pivot point (absolute coordinates)."),
    y: z.number().describe("Y coordinate of the custom pivot point (absolute coordinates).")
  })
    .optional()
    .describe("Custom pivot point coordinates. Required if pivot is 'custom'.")
};

export const RotateNodeSchema = z.object(RotateNodeShape).refine(
  (data) => data.pivot !== 'custom' || !!data.pivotPoint,
  { message: "pivotPoint is required when pivot is 'custom'", path: ['pivotPoint'] }
);
