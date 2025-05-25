import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

export const getSvgVectorSchema = {
  nodeId: z.string()
    .optional()
    .describe("The unique Figma node ID to extract SVG from. Provide either nodeId or nodeIds, not both."),
  nodeIds: z.array(z.string())
    .optional()
    .describe("An array of Figma node IDs to extract SVG from. Provide either nodeId or nodeIds, not both.")
};
