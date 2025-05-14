import { z } from "zod";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Shared Zod schema for RGBA color channels.
 */
export const RgbaSchema = z.object({
  r: z.number().min(0).max(1).describe("Red channel (0-1)"),
  g: z.number().min(0).max(1).describe("Green channel (0-1)"),
  b: z.number().min(0).max(1).describe("Blue channel (0-1)"),
  a: z.number().min(0).max(1).optional().describe("Optional. Alpha channel (0-1)"),
});

/**
 * Shared Zod schema for Figma node ID.
 */
export const NodeIdSchema = z.string()
  .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
  .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'.");

/**
 * TypeScript types inferred from schemas.
 */
export type Rgba = z.infer<typeof RgbaSchema>;
export type NodeId = z.infer<typeof NodeIdSchema>;
