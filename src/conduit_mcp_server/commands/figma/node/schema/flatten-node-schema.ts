import { z } from "zod";
import { NodeIdsArraySchema } from "./node-ids-schema.js";

export const FlattenNodeSchema = z.object({
  nodeId: z.string()
    .describe("ID of the node to flatten. Must be a Frame, Group, or node that supports flattening.")
    .optional(),
  nodeIds: z.array(
    z.string()
  )
  .min(1)
  .max(100)
  .describe("Array of Figma node IDs to flatten. Must contain 1 to 100 items.")
  .optional(),
  selection: z.boolean()
    .optional()
    .describe("If true, use the current Figma selection for the operation. If true, nodeId and nodeIds are ignored.")
});
