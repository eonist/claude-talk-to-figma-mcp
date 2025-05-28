/**
 * Configuration schema for cloning a single node in Figma.
 * Defines the structure for specifying which node to clone and where to place it.
 */
/**
 * Configuration schema for cloning a single node in Figma.
 * Defines the structure for specifying which node to clone and where to place it.
 */
import { z } from "zod";

export const CloneNodeConfig = z.object({
  /** The unique identifier of the node to be cloned */
  nodeId: z.string()
    .describe("ID of the node to clone."),

  /** 
   * Absolute position coordinates for the cloned node.
   * If not provided, the node will be placed at a default offset from the original.
   */
  position: z.object({
    /** X coordinate in pixels for the new node's position */
    x: z.number().describe("X coordinate for the new node's position."),
    /** Y coordinate in pixels for the new node's position */
    y: z.number().describe("Y coordinate for the new node's position.")
  }).optional().describe("Optional absolute position for the cloned node."),

  /** Horizontal offset in pixels to apply relative to the original node's position */
  offsetX: z.number().optional().describe("Optional X offset to apply to the cloned node's position."),
  
  /** Vertical offset in pixels to apply relative to the original node's position */
  offsetY: z.number().optional().describe("Optional Y offset to apply to the cloned node's position."),

  /** 
   * Parent node ID to attach the cloned node to.
   * If not provided, the node will be placed in the same parent as the original.
   */
  parentId: z.string().optional().describe("Optional parent node ID to attach the cloned node to.")
}).describe("A single node clone configuration.");

/**
 * Schema for node cloning operations.
 * Supports both single node cloning and batch operations.
 * 
 * @example
 * // Single node clone
 * { node: { nodeId: "123:456", offsetX: 100 } }
 * 
 * @example
 * // Batch clone
 * { nodes: [{ nodeId: "123:456" }, { nodeId: "789:012" }] }
 */
export const CloneNodeSchema = z.object({
  /** Configuration for cloning a single node */
  node: CloneNodeConfig.optional().describe("A single node clone configuration. Optional."),

  /** Array of configurations for batch cloning multiple nodes */
  nodes: z.array(CloneNodeConfig).optional().describe("An array of node clone configurations for batch cloning. Optional.")
});
