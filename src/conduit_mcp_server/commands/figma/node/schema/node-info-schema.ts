import { z } from "zod";
import { NodeIdsArraySchema } from "./node-ids-schema.js";

/**
 * Schema for retrieving information about Figma nodes.
 * Supports querying both single nodes and multiple nodes in batch.
 * 
 * @example
 * // Get info for a single node
 * { nodeId: "123:456" }
 * 
 * @example
 * // Get info for multiple nodes
 * { nodeIds: ["123:456", "789:012", "345:678"] }
 */
export const GetNodeInfoSchema = z.object({
  /** 
   * The unique identifier of a single node to retrieve information about.
   * Must follow Figma's node ID format.
   */
  nodeId: z.string()
    .describe("The unique Figma node ID to get information about. Must be a string in the format '123:456'.")
    .optional(),

  /** 
   * Array of node IDs to retrieve information about in a batch operation.
   * Limited to 100 items maximum for performance reasons.
   */
  nodeIds: NodeIdsArraySchema(1, 100)
    .describe("An array of Figma node IDs to get information about. Each must be a string in the format '123:456'.")
    .optional(),
});
