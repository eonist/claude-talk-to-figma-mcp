import { z } from "zod";

/**
 * Zod schema for validating vector node properties in Figma.
 * 
 * Defines the structure and validation rules for creating or updating
 * vector nodes, including position, dimensions, and vector path data.
 * 
 * @property x - X coordinate position (defaults to 0)
 * @property y - Y coordinate position (defaults to 0)
 * @property width - Width of the vector node (defaults to 100)
 * @property height - Height of the vector node (defaults to 100)
 * @property name - Optional name for the vector node
 * @property parentId - Optional parent node ID for hierarchical placement
 * @property vectorPaths - Array of vector path objects with winding rules and SVG path data
 */
export const vectorSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().default(100),
  height: z.number().default(100),
  name: z.string().optional(),
  parentId: z.string().optional().describe("Optional parent node ID."),
  vectorPaths: z.array(
    z.object({
      /** Winding rule for path filling - EVENODD or NONZERO */
      windingRule: z.enum(["EVENODD", "NONZERO"]),
      /** SVG path data string */
      data: z.string()
    })
  ).min(1)
});

/**
 * Zod schema for validating an optional array of vector nodes.
 * 
 * Used for batch operations where multiple vectors can be created
 * or processed simultaneously.
 */
export const vectorsSchema = z.array(vectorSchema).optional();
