import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Shared Zod schema for a single Figma node ID.
 */
export const NodeIdSchema = z.string()
  .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
  .describe("A Figma node ID. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'.");

/**
 * Shared Zod schema for an array of Figma node IDs (batch operations).
 * @param min Minimum number of node IDs (default: 1)
 * @param max Maximum number of node IDs (default: 100)
 */
export function NodeIdsArraySchema(min = 1, max = 100) {
  return z.array(NodeIdSchema)
    .min(min)
    .max(max)
    .describe(`Array of node IDs. Must contain at least ${min} and at most ${max} items.`);
}

/**
 * TypeScript types inferred from schemas.
 */
export type NodeId = z.infer<typeof NodeIdSchema>;
