import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Shared Zod schema for a batch text update entry.
 */
export const BatchTextUpdateEntrySchema = z.object({
  nodeId: z.string()
    .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
    .describe("The unique Figma child text node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
  text: z.string()
    .min(1)
    .max(10000)
    .describe("The new text content to set for the child node. Must be a non-empty string. Maximum length 10,000 characters."),
});

/**
 * Shared Zod schema for an array of batch text update entries.
 */
export const BatchTextUpdateArraySchema = z.array(BatchTextUpdateEntrySchema)
  .min(1)
  .max(100)
  .describe("Array of objects specifying nodeId and text for each child text node to update. Must contain 1 to 100 items.");

/**
 * TypeScript types inferred from schemas.
 */
export type BatchTextUpdateEntry = z.infer<typeof BatchTextUpdateEntrySchema>;
