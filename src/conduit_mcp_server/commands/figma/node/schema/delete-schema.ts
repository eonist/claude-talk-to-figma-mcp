import { z } from "zod";
import { NodeIdsArraySchema } from "./node-ids-schema.js";
export const DeleteNodeSchema = z.object({
  nodeId: z.string()
    .describe("The unique Figma node ID to delete. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'.")
    .optional(),
  nodeIds: NodeIdsArraySchema(1, 100).optional(),
});
