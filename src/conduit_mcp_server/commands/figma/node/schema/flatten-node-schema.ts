import { z } from "zod";
import { NodeIdsArraySchema } from "./node-ids-schema.js";

/**
 * Schema for flattening nodes in Figma.
 * Flattening converts vector nodes into a single flattened shape.
 * Only works with Frame, Group, or other nodes that support flattening operations.
 * 
 * @example
 * // Flatten a single node
 * { nodeId: "123:456" }
 * 
 * @example
 * // Flatten multiple nodes
 * { nodeIds: ["123:456", "789:012"] }
 * 
 * @example
 * // Flatten current selection
 * { selection: true }
 */
export const FlattenNodeSchema = z.object({
  /** 
   * ID of a single node to flatten.
   * Must be a Frame, Group, or other node type that supports flattening.
   */
  nodeId: z.string()
    .describe("ID of the node to flatten. Must be a Frame, Group, or node that supports flattening.")
    .optional(),

  /** 
   * Array of node IDs to flatten in a batch operation.
   * Limited to 100 items maximum for performance reasons.
   */
  nodeIds: z.array(
    z.string()
  )
  .min(1)
  .max(100)
  .describe("Array of Figma node IDs to flatten. Must contain 1 to 100 items.")
  .optional(),

  /** 
   * Whether to use the current Figma selection for the operation.
   * When true, nodeId and nodeIds parameters are ignored.
   */
  selection: z.boolean()
    .optional()
    .describe("If true, use the current Figma selection for the operation. If true, nodeId and nodeIds are ignored.")
});
