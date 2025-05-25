import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

export const AutoLayoutConfigSchemaWithWrap = z.object({
  nodeId: z.string()
    .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
    .describe("The unique Figma node ID to update."),
  layoutMode: z.enum(["HORIZONTAL", "VERTICAL", "NONE"])
    .describe('The auto layout mode to set: "HORIZONTAL", "VERTICAL", or "NONE".'),
  layoutWrap: z.enum(["NO_WRAP", "WRAP"]).optional()
    .describe('The layout wrap mode: "NO_WRAP" or "WRAP". Optional.'),
  itemSpacing: z.number().optional()
    .describe("Spacing between items in pixels. Optional."),
  paddingTop: z.number().optional()
    .describe("Top padding in pixels. Optional."),
  paddingRight: z.number().optional()
    .describe("Right padding in pixels. Optional."),
  paddingBottom: z.number().optional()
    .describe("Bottom padding in pixels. Optional."),
  paddingLeft: z.number().optional()
    .describe("Left padding in pixels. Optional."),
});

export const SetAutoLayoutSchema = z.object({
  layout: z.object({
    nodeId: z.string()
      .refine(isValidNodeId, { message: "Must be a valid Figma node ID" })
      .describe("The unique Figma node ID to update."),
    mode: z.enum(["HORIZONTAL", "VERTICAL", "NONE"])
      .describe('The auto layout mode to set: "HORIZONTAL", "VERTICAL", or "NONE".'),
    layoutWrap: z.enum(["NO_WRAP", "WRAP"]).optional()
      .describe('The layout wrap mode: "NO_WRAP" or "WRAP". Optional.'),
    itemSpacing: z.number().optional()
      .describe("Spacing between items in pixels. Optional."),
    padding: z.object({
      top: z.number().optional().describe("Top padding in pixels. Optional."),
      right: z.number().optional().describe("Right padding in pixels. Optional."),
      bottom: z.number().optional().describe("Bottom padding in pixels. Optional."),
      left: z.number().optional().describe("Left padding in pixels. Optional."),
    }).optional().describe("Padding object with top, right, bottom, left properties. Optional."),
  }).optional().describe("A single auto-layout configuration. Optional."),
});
