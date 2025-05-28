/**
 * Configuration for renaming a single Figma node.
 * Defines the node to rename and its new name.
 */
import { z } from "zod";

export const RenameConfig = z.object({
  /** The unique Figma node identifier in the format '123:456' */
  nodeId: z.string()
    .describe("The unique Figma node ID to rename. Must be a string in the format '123:456'."),

  /** 
   * The new name to assign to the node.
   * Must be non-empty and within reasonable length limits.
   */
  newName: z.string()
    .min(1)
    .max(100)
    .describe("The new name for the node. Must be a non-empty string up to 100 characters."),

  /** 
   * Whether to preserve the TextNode's autoRename functionality.
   * When true, maintains automatic naming behavior for text nodes.
   */
  setAutoRename: z.boolean().optional().describe("Whether to preserve TextNode autoRename"),
}).describe("A single rename configuration object.");

/**
 * Schema for node renaming operations.
 * Supports both single node renaming and batch operations.
 * 
 * @example
 * // Rename a single node
 * { rename: { nodeId: "123:456", newName: "New Button" } }
 * 
 * @example
 * // Batch rename multiple nodes
 * { renames: [
 *   { nodeId: "123:456", newName: "Button 1" },
 *   { nodeId: "789:012", newName: "Button 2" }
 * ]}
 */
export const RenameSchema = z.object({
  /** Configuration for renaming a single node */
  rename: RenameConfig.optional().describe("A single rename configuration object. Optional."),

  /** Array of configurations for batch renaming multiple nodes */
  renames: z.array(RenameConfig).optional().describe("An array of rename configuration objects for batch renaming. Optional.")
});
