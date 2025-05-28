import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Zod schema for configuring a single line element in Figma.
 * 
 * Lines are vector elements defined by start and end points.
 * They're commonly used for dividers, connectors, or decorative elements.
 * 
 * @example
 * ```
 * const lineConfig: LineConfig = {
 *   x1: 0,
 *   y1: 0,
 *   x2: 100,
 *   y2: 0,
 *   strokeColor: { r: 0, g: 0, b: 0, a: 1 },
 *   strokeWeight: 2
 * };
 * ```
 */
export const SingleLineSchema = z.object({
  /** X coordinate of the line's starting point in pixels */
  x1: z.number()
    .describe("X coordinate for the start point. Example: 10"),
  
  /** Y coordinate of the line's starting point in pixels */
  y1: z.number()
    .describe("Y coordinate for the start point. Example: 20"),
  
  /** X coordinate of the line's ending point in pixels */
  x2: z.number()
    .describe("X coordinate for the end point. Example: 110"),
  
  /** Y coordinate of the line's ending point in pixels */
  y2: z.number()
    .describe("Y coordinate for the end point. Example: 20"),
  
  /** Optional Figma node ID of the parent container where this line will be placed */
  parentId: z.string()
    .describe("Figma node ID of the parent.")
    .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
    .optional(),
  
  /** Optional color for the line stroke */
  strokeColor: z.any()
    .describe("Stroke color for the line.")
    .optional(),
  
  /** Optional thickness of the line in pixels */
  strokeWeight: z.number()
    .describe("Stroke weight for the line.")
    .optional()
});

/**
 * Schema for creating multiple lines in a single operation.
 * Each line in the array follows the SingleLineSchema structure.
 */
export const BatchLinesSchema = z.array(SingleLineSchema);

/**
 * Union schema that accepts either a single line configuration or an array of line configurations.
 * This provides flexibility for tools that need to create one or many lines.
 */
export const LineSchema = z.union([
  SingleLineSchema,
  BatchLinesSchema
]);

/**
 * TypeScript type for a single line configuration object.
 * Inferred from the SingleLineSchema for type safety.
 */
export type LineConfig = z.infer<typeof SingleLineSchema>;

/**
 * TypeScript type for batch line creation operations.
 * Represents an array of line configurations.
 */
export type BatchLinesConfig = z.infer<typeof BatchLinesSchema>;
