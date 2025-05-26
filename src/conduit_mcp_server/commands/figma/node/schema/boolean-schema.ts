import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { NodeIdsArraySchema } from "./node-ids-schema.js";

export const BooleanSchema = z.object({
  operation: z
    .enum(["union", "subtract", "intersect", "exclude"])
    .describe("The boolean operation to perform: 'union', 'subtract', 'intersect', or 'exclude'."),
  nodeIds: NodeIdsArraySchema(2, 100)
    .describe("An array of node IDs to include in the operation. Must contain at least 2 and at most 100 items."),
});
