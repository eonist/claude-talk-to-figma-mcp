import { z } from "zod";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";

/**
 * Shared Zod schema for a Figma instance ID.
 */
export const InstanceIdSchema = z.string()
  .refine(isValidNodeId, { message: "Must be a valid Figma instance ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
  .describe("The unique Figma instance ID to detach. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'.");

/**
 * TypeScript type inferred from schema.
 */
export type InstanceId = z.infer<typeof InstanceIdSchema>;
