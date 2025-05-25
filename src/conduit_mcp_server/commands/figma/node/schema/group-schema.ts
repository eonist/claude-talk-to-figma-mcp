import { z } from "zod";
import { NodeIdsArraySchema } from "./node-ids-schema.js";
export const GroupSchema = z.object({
  group: z.boolean().describe("If true, group nodes; if false, ungroup a group node."),
  nodeIds: NodeIdsArraySchema(2, 100).optional(),
  name: z.string()
    .min(1)
    .max(100)
    .optional()
    .describe("Optional. Name for the group. If provided, must be a non-empty string up to 100 characters."),
  nodeId: z.string()
    .optional()
    .describe("The unique Figma group node ID to ungroup. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
});
