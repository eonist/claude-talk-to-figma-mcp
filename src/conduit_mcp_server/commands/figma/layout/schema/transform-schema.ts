import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

export const ResizeNodeSchema = z.object({
  nodeId: z.string()
    .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
    .describe("The unique Figma node ID to resize. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
  width: z.number()
    .min(1)
    .max(10000)
    .describe("The new width for the node, in pixels. Must be a positive number between 1 and 10,000."),
  height: z.number()
    .min(1)
    .max(10000)
    .describe("The new height for the node, in pixels. Must be a positive number between 1 and 10,000."),
});
