import { z } from "zod";

/**
 * Configuration for reordering a single node in the layer hierarchy.
 * Supports both directional movement and absolute index positioning.
 */
export const ReorderConfig = z.object({
  /** The unique identifier of the node to reorder */
  nodeId: z.string().describe("The ID of the node to reorder."),

  /** 
   * Direction to move the node relative to its current position.
   * - up: Move one layer up (towards front)
   * - down: Move one layer down (towards back)  
   * - front: Move to the very front of its parent
   * - back: Move to the very back of its parent
   */
  direction: z.enum(["up", "down", "front", "back"])
    .optional()
    .describe("The direction to move the node: 'up', 'down', 'front', or 'back'. Optional."),

  /** 
   * Absolute index position to move the node to (0-based).
   * 0 is the back-most position, higher numbers are towards the front.
   */
  index: z.number().int()
    .optional()
    .describe("The new index to move the node to (0-based). Optional."),
}).describe("A single reorder configuration object. Each object should include nodeId and optional direction or index.");

/**
 * Schema for layer reordering operations.
 * Supports both single node reordering and batch operations with error handling options.
 * 
 * @example
 * // Move a single node to front
 * { reorder: { nodeId: "123:456", direction: "front" } }
 * 
 * @example
 * // Batch reorder with error skipping
 * { 
 *   reorders: [
 *     { nodeId: "123:456", index: 0 },
 *     { nodeId: "789:012", direction: "up" }
 *   ],
 *   options: { skip_errors: true }
 * }
 */
export const ReorderSchema = z.object({
  /** Configuration for reordering a single node */
  reorder: ReorderConfig.optional(),

  /** Array of configurations for batch reordering multiple nodes */
  reorders: z.array(ReorderConfig).optional(),

  /** 
   * Options to control the behavior of the reordering operation.
   * Useful for batch operations where some nodes might fail to reorder.
   */
  options: z.object({
    /** 
     * Whether to continue processing remaining operations if one fails.
     * When true, errors are logged but don't stop the batch operation.
     */
    skip_errors: z.boolean()
      .optional()
      .describe("If true, skip errors and continue processing remaining operations in batch mode.")
  })
    .optional()
    .describe("Options for the operation (e.g., skip_errors). Optional.")
});
