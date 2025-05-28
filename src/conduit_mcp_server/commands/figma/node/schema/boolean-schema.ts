import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { NodeIdsArraySchema } from "./node-ids-schema.js";

/**
 * Schema for performing boolean operations on Figma vector nodes.
 * Boolean operations combine multiple vector shapes using set theory operations.
 * 
 * @example
 * // Union two shapes
 * { operation: "union", nodeIds: ["123:456", "789:012"] }
 * 
 * @example
 * // Subtract one shape from another
 * { operation: "subtract", nodeIds: ["123:456", "789:012"] }
 */
export const BooleanSchema = z.object({
  /** 
   * The type of boolean operation to perform.
   * - union: Combines all shapes into one
   * - subtract: Removes overlapping areas of subsequent shapes from the first
   * - intersect: Keeps only overlapping areas
   * - exclude: Removes overlapping areas, keeps non-overlapping parts
   */
  operation: z
    .enum(["union", "subtract", "intersect", "exclude"])
    .describe("The boolean operation to perform: 'union', 'subtract', 'intersect', or 'exclude'."),

  /** 
   * Array of vector node IDs to include in the boolean operation.
   * Order matters for operations like subtract - the first node is the base shape.
   */
  nodeIds: NodeIdsArraySchema(2, 100)
    .describe("An array of node IDs to include in the operation. Must contain at least 2 and at most 100 items."),
});
