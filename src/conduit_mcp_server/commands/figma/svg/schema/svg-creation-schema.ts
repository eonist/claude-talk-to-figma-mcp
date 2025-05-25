import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

export const setSvgVectorSchema = {
  svg: z.object({
    svg: z.string()
      .min(1)
      .max(100000)
      .describe("The SVG content (raw SVG text or URL). Must be a non-empty string up to 100,000 characters."),
    x: z.number()
      .min(-10000)
      .max(10000)
      .optional()
      .default(0)
      .describe("Optional. X coordinate for the SVG. Must be between -10,000 and 10,000. Defaults to 0."),
    y: z.number()
      .min(-10000)
      .max(10000)
      .optional()
      .default(0)
      .describe("Optional. Y coordinate for the SVG. Must be between -10,000 and 10,000. Defaults to 0."),
    name: z.string()
      .min(1)
      .max(100)
      .optional()
      .describe("Optional. Name for the SVG node. If provided, must be a non-empty string up to 100 characters."),
    parentId: z.string()
      .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
      .optional()
      .describe("Optional. Figma node ID of the parent. If provided, must be a string in the format '123:456'."),
  }).optional().describe("A single SVG vector configuration. Optional."),
  svgs: z.array(
    z.object({
      svg: z.string()
        .min(1)
        .max(100000)
        .describe("The SVG content (raw SVG text or URL). Must be a non-empty string up to 100,000 characters."),
      x: z.number()
        .min(-10000)
        .max(10000)
        .optional()
        .default(0)
        .describe("Optional. X coordinate for the SVG. Must be between -10,000 and 10,000. Defaults to 0."),
      y: z.number()
        .min(-10000)
        .max(10000)
        .optional()
        .default(0)
        .describe("Optional. Y coordinate for the SVG. Must be between -10,000 and 10,000. Defaults to 0."),
      name: z.string()
        .min(1)
        .max(100)
        .optional()
        .describe("Optional. Name for the SVG node. If provided, must be a non-empty string up to 100 characters."),
      parentId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .optional()
        .describe("Optional. Figma node ID of the parent. If provided, must be a string in the format '123:456'."),
    })
  ).optional().describe("An array of SVG vector configurations for batch insertion. Optional."),
};
