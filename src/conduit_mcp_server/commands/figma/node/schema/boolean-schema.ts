import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { NodeIdsArraySchema } from "./node-ids-schema.js";

export const BooleanSchema = z.object({
  operation: z
    .enum(["union", "subtract", "intersect", "exclude"])
    .describe("The boolean operation to perform: 'union', 'subtract', 'intersect', or 'exclude'."),
  selection: z
    .boolean()
    .optional()
    .describe("If true, use the current Figma selection for the operation. If true, nodeId and nodeIds are ignored."),
  nodeId: z
    .string()
    .refine(isValidNodeId, { message: "Must be a valid Figma node ID." })
    .optional()
    .describe("The ID of a single node to include in the operation. Must be a valid Figma node ID."),
  nodeIds: NodeIdsArraySchema(1, 100)
    .optional()
    .describe("An array of node IDs to include in the operation. Must contain at least 1 and at most 100 items."),
});
