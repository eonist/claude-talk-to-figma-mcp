import { z } from "zod";

/**
 * Zod schema for configuring a single rectangle shape in Figma.
 * 
 * Rectangles are fundamental geometric shapes commonly used for buttons,
 * containers, backgrounds, and layout elements. They support rounded corners
 * and various styling options.
 * 
 * @example
 * ```
 * const rectConfig: RectangleConfig = {
 *   x: 50,
 *   y: 100,
 *   width: 200,
 *   height: 100,
 *   name: "Button Background",
 *   cornerRadius: 8,
 *   fillColor: { r: 0.2, g: 0.6, b: 1, a: 1 }
 * };
 * ```
 */
export const SingleRectangleSchema = z.object({
  /** X coordinate for the top-left corner of the rectangle in pixels (must be non-negative) */
  x: z.number().min(0, "x must be >= 0")
    .describe("The X coordinate (in Figma canvas units, pixels) for the top-left corner of the rectangle. Must be >= 0. Example: 100"),
  
  /** Y coordinate for the top-left corner of the rectangle in pixels (must be non-negative) */
  y: z.number().min(0, "y must be >= 0")
    .describe("The Y coordinate (in Figma canvas units, pixels) for the top-left corner of the rectangle. Must be >= 0. Example: 200"),
  
  /** Width of the rectangle in pixels (must be positive) */
  width: z.number().positive("width must be > 0")
    .describe("The width of the rectangle in pixels. Must be > 0. Example: 300"),
  
  /** Height of the rectangle in pixels (must be positive) */
  height: z.number().positive("height must be > 0")
    .describe("The height of the rectangle in pixels. Must be > 0. Example: 150"),
  
  /** Optional name for the rectangle node that will appear in Figma's layers panel */
  name: z.string()
    .describe("The name to assign to the rectangle node in Figma. Example: 'Button Background'")
    .optional(),
  
  /** Optional Figma node ID of the parent container where this rectangle will be placed */
  parentId: z.string()
    .describe("The Figma node ID of the parent to attach the rectangle to. If omitted, the rectangle is added to the root.")
    .optional(),
  
  /** Optional corner radius in pixels for rounded corners (must be non-negative) */
  cornerRadius: z.number().min(0, "cornerRadius must be >= 0")
    .describe("The corner radius (in pixels) for rounded corners. Must be >= 0. Example: 8")
    .optional(),
  
  /** Optional RGBA fill color for the rectangle background */
  fillColor: z.any()
    .describe("Optional RGBA fill color for the rectangle. Example: { r: 0.2235, g: 1, b: 0.0784, a: 1 }")
    .optional(),
  
  /** Optional RGBA stroke (border) color for the rectangle */
  strokeColor: z.any()
    .describe("Optional RGBA stroke color for the rectangle. Example: { r: 0, g: 0, b: 0, a: 1 }")
    .optional(),
  
  /** Optional stroke (border) thickness in pixels */
  strokeWeight: z.number()
    .describe("Optional stroke weight for the rectangle.")
    .optional()
});

/**
 * Schema for creating multiple rectangles in a single operation.
 * Each rectangle in the array follows the SingleRectangleSchema structure.
 */
export const BatchRectanglesSchema = z.array(SingleRectangleSchema);

/**
 * Union schema that accepts either a single rectangle configuration or an array of rectangle configurations.
 * This provides flexibility for tools that need to create one or many rectangles.
 */
export const RectangleSchema = z.union([
  SingleRectangleSchema,
  BatchRectanglesSchema
]);

/**
 * TypeScript type for a single rectangle configuration object.
 * Inferred from the SingleRectangleSchema for type safety.
 */
export type RectangleConfig = z.infer<typeof SingleRectangleSchema>;

/**
 * TypeScript type for batch rectangle creation operations.
 * Represents an array of rectangle configurations.
 */
export type BatchRectanglesConfig = z.infer<typeof BatchRectanglesSchema>;
