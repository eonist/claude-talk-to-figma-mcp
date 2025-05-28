import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Zod schema for configuring a single ellipse shape in Figma.
 * 
 * Ellipses are oval shapes that can range from perfect circles (when width equals height)
 * to stretched ovals. They're commonly used for avatars, buttons, decorative elements,
 * and icons.
 * 
 * @example
 * ```
 * const ellipseConfig: EllipseConfig = {
 *   x: 100,
 *   y: 50,
 *   width: 120,
 *   height: 120, // Same as width for a perfect circle
 *   name: "Profile Avatar",
 *   fillColor: { r: 0.9, g: 0.9, b: 0.9, a: 1 }
 * };
 * ```
 */
export const SingleEllipseSchema = z.object({
  /** X coordinate for the top-left corner of the ellipse's bounding box in pixels */
  x: z.number()
    .describe("X coordinate for the top-left corner. Example: 60"),
  
  /** Y coordinate for the top-left corner of the ellipse's bounding box in pixels */
  y: z.number()
    .describe("Y coordinate for the top-left corner. Example: 80"),
  
  /** Width of the ellipse's bounding box in pixels */
  width: z.number()
    .describe("Width in pixels. Example: 120"),
  
  /** Height of the ellipse's bounding box in pixels */
  height: z.number()
    .describe("Height in pixels. Example: 90"),
  
  /** Optional name for the ellipse node that will appear in Figma's layers panel */
  name: z.string()
    .describe("Name for the ellipse node. Example: 'Ellipse1'")
    .optional(),
  
  /** Optional Figma node ID of the parent container where this ellipse will be placed */
  parentId: z.string()
    .describe("Figma node ID of the parent.")
    .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
    .optional(),
  
  /** Optional fill color for the ellipse interior */
  fillColor: z.any()
    .describe("Fill color for the ellipse.")
    .optional(),
  
  /** Optional stroke (border) color for the ellipse */
  strokeColor: z.any()
    .describe("Stroke color for the ellipse.")
    .optional(),
  
  /** Optional stroke (border) thickness in pixels */
  strokeWeight: z.number()
    .describe("Stroke weight for the ellipse.")
    .optional()
});

/**
 * Schema for creating multiple ellipses in a single operation.
 * Each ellipse in the array follows the SingleEllipseSchema structure.
 */
export const BatchEllipsesSchema = z.array(SingleEllipseSchema);

/**
 * Union schema that accepts either a single ellipse configuration or an array of ellipse configurations.
 * This provides flexibility for tools that need to create one or many ellipses.
 */
export const EllipseSchema = z.union([
  SingleEllipseSchema,
  BatchEllipsesSchema
]);

/**
 * TypeScript type for a single ellipse configuration object.
 * Inferred from the SingleEllipseSchema for type safety.
 */
export type EllipseConfig = z.infer<typeof SingleEllipseSchema>;

/**
 * TypeScript type for batch ellipse creation operations.
 * Represents an array of ellipse configurations.
 */
export type BatchEllipsesConfig = z.infer<typeof BatchEllipsesSchema>;
