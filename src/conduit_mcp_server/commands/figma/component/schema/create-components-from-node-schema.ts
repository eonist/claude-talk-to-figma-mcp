import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Zod schema for a single node-to-component conversion entry.
 */
export const NodeToComponentEntrySchema = z.object({
  nodeId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (e.g., '123:456')" }).describe("The Figma node ID to convert into a component."),
  maintain_position: z.boolean().optional().describe("Whether to maintain the node's position after conversion."),
}).describe("A single node-to-component conversion entry.");

/**
 * Zod schema for the create_components_from_node command parameters.
 */
export const CreateComponentsFromNodeSchema = z.object({
  entry: NodeToComponentEntrySchema.optional().describe("A single node-to-component conversion entry."),
  entries: z.array(NodeToComponentEntrySchema).optional().describe("An array of node-to-component conversion entries for batch conversion."),
  skip_errors: z.boolean().optional().describe("If true, skip errors and continue processing remaining entries."),
}).describe("Parameters for the create_components_from_node command. Provide either 'entry' or 'entries'.");
