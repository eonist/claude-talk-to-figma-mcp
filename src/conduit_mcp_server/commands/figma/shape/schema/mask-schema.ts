import { z } from "zod";

/**
 * Zod schema for configuring a single masking operation in Figma.
 * 
 * Masking allows you to use one shape to clip or hide parts of another shape.
 * The mask node defines the visible area, while the target node is what gets masked.
 * 
 * @example
 * ```
 * const maskConfig: SingleMaskConfig = {
 *   targetNodeId: "123:456",
 *   maskNodeId: "789:012",
 *   parentId: "345:678"
 * };
 * ```
 */
export const SingleMaskSchema = z.object({
  /** Figma node ID of the element that will be masked (clipped) */
  targetNodeId: z.string().describe("ID of the node to be masked"),
  
  /** Figma node ID of the element that will act as the mask shape */
  maskNodeId: z.string().describe("ID of the node to use as mask"),
  
  /** Optional channel ID for communication between different parts of the application */
  channelId: z.string().optional().describe("Channel ID for communication"),
  
  /** Optional parent node ID where the resulting mask group will be placed */
  parentId: z.string().optional().describe("Optional parent node ID for the resulting mask group")
});

/**
 * Schema for performing multiple masking operations in a single batch.
 * 
 * This allows for efficient bulk masking operations where multiple target-mask
 * pairs need to be processed together.
 * 
 * @example
 * ```
 * const batchMaskConfig: BatchMaskConfig = {
 *   operations: [
 *     { targetNodeId: "123:456", maskNodeId: "789:012" },
 *     { targetNodeId: "234:567", maskNodeId: "890:123" }
 *   ],
 *   parentId: "345:678"
 * };
 * ```
 */
export const BatchMaskSchema = z.object({
  /** Array of masking operations to perform */
  operations: z.array(
    z.object({
      /** Figma node ID of the element that will be masked (clipped) */
      targetNodeId: z.string().describe("ID of the node to be masked"),
      
      /** Figma node ID of the element that will act as the mask shape */
      maskNodeId: z.string().describe("ID of the node to use as mask"),
      
      /** Optional channel ID for communication between different parts of the application */
      channelId: z.string().optional().describe("Channel ID for communication")
    })
  ),
  
  /** Optional parent node ID where all resulting mask groups will be placed */
  parentId: z.string().optional().describe("Optional parent node ID for the resulting mask group")
});
