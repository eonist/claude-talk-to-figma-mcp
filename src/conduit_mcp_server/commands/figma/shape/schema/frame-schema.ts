import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Zod schema for configuring a single frame in Figma.
 * 
 * A frame is a container element that can hold other design elements.
 * It's similar to a div in HTML and is commonly used for organizing layouts.
 * 
 * @example
 * ```
 * const frameConfig: FrameConfig = {
 *   x: 100,
 *   y: 200,
 *   width: 400,
 *   height: 300,
 *   name: "Main Content Frame",
 *   fillColor: { r: 1, g: 1, b: 1, a: 1 }
 * };
 * ```
 */
export const SingleFrameSchema = z.object({
  /** X coordinate for the top-left corner of the frame in pixels */
  x: z.number()
    .describe("X coordinate for the top-left corner. Example: 50"),
  
  /** Y coordinate for the top-left corner of the frame in pixels */
  y: z.number()
    .describe("Y coordinate for the top-left corner. Example: 100"),
  
  /** Width of the frame in pixels */
  width: z.number()
    .describe("Width in pixels. Example: 400"),
  
  /** Height of the frame in pixels */
  height: z.number()
    .describe("Height in pixels. Example: 300"),
  
  /** Optional name for the frame node that will appear in Figma's layers panel */
  name: z.string()
    .describe("Name for the frame node. Example: 'Main Frame'")
    .optional(),
  
  /** Optional Figma node ID of the parent container where this frame will be placed */
  parentId: z.string()
    .describe("Figma node ID of the parent.")
    .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
    .optional(),
  
  /** Optional fill color for the frame background */
  fillColor: z.any()
    .describe("Fill color for the frame.")
    .optional(),
  
  /** Optional stroke (border) color for the frame */
  strokeColor: z.any()
    .describe("Stroke color for the frame.")
    .optional(),
  
  /** Optional stroke (border) thickness in pixels */
  strokeWeight: z.number()
    .describe("Stroke weight for the frame.")
    .optional()
});

/**
 * Schema for creating multiple frames in a single operation.
 * Each frame in the array follows the SingleFrameSchema structure.
 */
export const BatchFramesSchema = z.array(SingleFrameSchema);

/**
 * Union schema that accepts either a single frame configuration or an array of frame configurations.
 * This provides flexibility for tools that need to create one or many frames.
 */
export const FrameSchema = z.union([
  SingleFrameSchema,
  BatchFramesSchema
]);

/**
 * TypeScript type for a single frame configuration object.
 * Inferred from the SingleFrameSchema for type safety.
 */
export type FrameConfig = z.infer<typeof SingleFrameSchema>;

/**
 * TypeScript type for batch frame creation operations.
 * Represents an array of frame configurations.
 */
export type BatchFramesConfig = z.infer<typeof BatchFramesSchema>;
