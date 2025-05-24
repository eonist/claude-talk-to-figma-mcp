import { z } from "zod";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";

/**
 * Zod schema for the set_selection command input.
 */
export const SetSelectionInputSchema = z.object({
  nodeId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID." }).optional().describe("A single Figma node ID to select."),
  nodeIds: z.array(z.string().refine(isValidNodeId)).optional().describe("An array of Figma node IDs to select."),
}).refine(
  (data) => data.nodeId || (Array.isArray(data.nodeIds) && data.nodeIds.length > 0),
  { message: "You must provide 'nodeId' or 'nodeIds'." }
).describe("Input schema for the set_selection command. Provide either 'nodeId' or 'nodeIds'.");
