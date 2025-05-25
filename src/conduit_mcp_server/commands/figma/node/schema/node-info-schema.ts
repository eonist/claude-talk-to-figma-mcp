import { z } from "zod";
import { NodeIdsArraySchema } from "./node-ids-schema.js";

export const GetNodeInfoSchema = z.object({
  nodeId: z.string()
    .describe("The unique Figma node ID to get information about. Must be a string in the format '123:456'.")
    .optional(),
  nodeIds: NodeIdsArraySchema(1, 100)
    .describe("An array of Figma node IDs to get information about. Each must be a string in the format '123:456'.")
    .optional(),
});
