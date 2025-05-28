import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Zod schema for configuring a single polygon shape in Figma.
 * 
 * Polygons are regular geometric shapes with a specified number of sides.
 * Common examples include triangles (3 sides), pentagons (5 sides), hexagons (6 sides), etc.
 * 
 * @example
 * ```
 * const polygonConfig: PolygonConfig = {
 *   x: 100,
 *   y: 100,
 *   width: 80,
 *   height: 80,
 *   sides: 6, // hexagon
 *   name: "Hexagon Shape",
 *   fillColor: { r: 0.2, g: 0.8, b: 0.4, a: 1 }
 * };
 * ```
 */
export const SinglePolygonSchema = z.object({
  /** X coordinate for the top-left corner of the polygon's bounding box in pixels */
  x: z.number()
    .describe("X coordinate for the top-left corner. Example: 10"),
  
  /** Y coordinate for the top-left corner of the polygon's bounding box in pixels */
  y: z.number()
    .describe("Y coordinate for the top-left corner. Example: 20"),
  
  /** Width of the polygon's bounding box in pixels */
  width: z.number()
    .describe("Width in pixels. Example: 100"),
  
  /** Height of the polygon's bounding box in pixels */
  height: z.number()
    .describe("Height in pixels. Example: 100"),
  
  /** Number of sides for the polygon (minimum 3 for a triangle) */
  sides: z.number().min(3)
    .describe("Number of sides (minimum 3). Example: 5"),
  
  /** Optional name for the polygon node that will appear in Figma's layers panel */
  name: z.string()
    .describe("Name for the polygon node.")
    .optional(),
  
  /** Optional Figma node ID of the parent container where this polygon will be placed */
  parentId: z.string()
    .describe("Figma node ID of the parent.")
    .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
    .optional(),
  
  /** Optional fill color for the polygon interior */
  fillColor: z.any()
    .describe("Fill color for the polygon.")
    .optional(),
  
  /** Optional stroke (border) color for the polygon */
  strokeColor: z.any()
    .describe("Stroke color for the polygon.")
    .optional(),
  
  /** Optional stroke (border) thickness in pixels */
  strokeWeight: z.number()
    .describe("Stroke weight for the polygon.")
    .optional()
});

/**
 * Schema for creating multiple polygons in a single operation.
 * Each polygon in the array follows the SinglePolygonSchema structure.
 */
export const BatchPolygonsSchema = z.array(SinglePolygonSchema);

/**
 * Union schema that accepts either a single polygon configuration or an array of polygon configurations.
 * This provides flexibility for tools that need to create one or many polygons.
 */
export const PolygonSchema = z.union([
  SinglePolygonSchema,
  BatchPolygonsSchema
]);

/**
 * TypeScript type for a single polygon configuration object.
 * Inferred from the SinglePolygonSchema for type safety.
 */
export type PolygonConfig = z.infer<typeof SinglePolygonSchema>;

/**
 * TypeScript type for batch polygon creation operations.
 * Represents an array of polygon configurations.
 */
export type BatchPolygonsConfig = z.infer<typeof BatchPolygonsSchema>;
