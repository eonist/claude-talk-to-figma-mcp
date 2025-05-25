import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

export const getTextStyleSchema = {
  nodeId: z.string()
    .refine(isValidNodeId, { message: "Must be a valid Figma text node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
    .optional(),
  nodeIds: z.array(z.string()).optional()
};
