import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

export const setFillAndStrokeSchema = {
  nodeId: z.string()
    .optional()
    .describe("The unique Figma node ID to update. Provide either nodeId or nodeIds, not both."),
  nodeIds: z.array(z.string())
    .optional()
    .describe("An array of Figma node IDs to update. Provide either nodeId or nodeIds, not both."),
  fill: z.any()
    .optional()
    .describe("The fill color(s) to set. Can be a single fill or an array of fills."),
  stroke: z.any()
    .optional()
    .describe("The stroke color(s) to set. Can be a single stroke or an array of strokes.")
};

export const getFillAndStrokeSchema = {
  nodeId: z.string()
    .optional()
    .describe("The unique Figma node ID to query. Provide either nodeId or nodeIds, not both."),
  nodeIds: z.array(z.string())
    .optional()
    .describe("An array of Figma node IDs to query. Provide either nodeId or nodeIds, not both.")
};
