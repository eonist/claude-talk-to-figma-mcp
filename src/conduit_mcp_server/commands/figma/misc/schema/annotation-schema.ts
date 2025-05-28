import { z } from "zod";

/**
 * Schema for retrieving annotations from Figma nodes.
 * Supports both single node and batch operations.
 * 
 * @example
 * ```
 * // Get annotation for single node
 * const params = { nodeId: "123:456" };
 * 
 * // Get annotations for multiple nodes
 * const params = { nodeIds: ["123:456", "789:012"] };
 * ```
 */
export const GetAnnotationParamsSchema = z.object({
  /** ID of a single node to retrieve annotations for */
  nodeId: z.string().optional().describe("The ID of a single node to get annotations for. Optional."),
  
  /** Array of node IDs for batch annotation retrieval */
  nodeIds: z.array(z.string()).optional().describe("An array of node IDs to get annotations for in batch. Optional.")
});

/**
 * Schema for a single annotation operation entry.
 * Can create, update, or delete annotations on a Figma node.
 * 
 * @example
 * ```
 * // Create/update annotation
 * const entry = {
 *   nodeId: "123:456",
 *   annotation: {
 *     label: "Primary CTA Button",
 *     labelMarkdown: "**Primary CTA Button**\nUsed for main actions"
 *   }
 * };
 * 
 * // Delete annotation
 * const deleteEntry = { nodeId: "123:456", delete: true };
 * ```
 */
export const AnnotationEntrySchema = z.object({
  /** The Figma node ID to annotate */
  nodeId: z.string(),
  
  /** 
   * Annotation content with optional label and markdown formatting.
   * Omit to keep existing annotation unchanged.
   */
  annotation: z.object({
    /** Plain text label for the annotation */
    label: z.string().optional(),
    
    /** Markdown-formatted label with rich text support */
    labelMarkdown: z.string().optional()
  }).optional(),
  
  /** Set to true to delete the annotation from this node */
  delete: z.boolean().optional()
});

/**
 * Schema for setting annotations on Figma nodes.
 * Supports both single operations and batch processing.
 * 
 * @example
 * ```
 * // Single annotation operation
 * const params = {
 *   entry: { nodeId: "123:456", annotation: { label: "Button" } }
 * };
 * 
 * // Batch annotation operations
 * const params = {
 *   entries: [
 *     { nodeId: "123:456", annotation: { label: "Button 1" } },
 *     { nodeId: "789:012", delete: true }
 *   ]
 * };
 * ```
 */
export const SetAnnotationParamsSchema = z.object({
  /** Single annotation operation to perform */
  entry: AnnotationEntrySchema.optional().describe("A single annotation operation to perform. Optional."),
  
  /** Array of annotation operations for batch processing */
  entries: z.array(AnnotationEntrySchema).optional().describe("An array of annotation operations to perform in batch. Optional.")
});
