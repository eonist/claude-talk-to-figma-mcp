import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Zod schema for a single node move operation.
 */
export const MoveNodeOpSchema = z.object({
  nodeId: z.string()
    .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
    .describe("The unique Figma node ID to move. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
  x: z.number()
    .min(-10000)
    .max(10000)
    .describe("New X position. Must be between -10,000 and 10,000."),
  y: z.number()
    .min(-10000)
    .max(10000)
    .describe("New Y position. Must be between -10,000 and 10,000."),
}).describe("A single node move operation.");

/**
 * Zod schema for the move_node command parameters.
 */
export const MoveNodeSchema = z.object({
  move: MoveNodeOpSchema.optional().describe("A single node move operation."),
  moves: z.array(MoveNodeOpSchema).optional().describe("An array of node move operations for batch movement."),
}).describe("Parameters for the move_node command. Provide either 'move' or 'moves'.");
