import { z } from "zod";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";

/**
 * Shared Zod schema for CSS export options.
 */
export const CssExportOptionsSchema = z.object({
  nodeId: z.string()
    .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
    .optional()
    .describe("Optional. The unique Figma node ID to get CSS from. If provided, must be a string in the format '123:456'."),
  format: z.enum(["object", "string", "inline"])
    .optional()
    .describe('Optional. The format to return CSS in: "object", "string", or "inline".'),
});

/**
 * TypeScript type inferred from schema.
 */
export type CssExportOptions = z.infer<typeof CssExportOptionsSchema>;
