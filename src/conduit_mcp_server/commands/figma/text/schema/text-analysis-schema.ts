import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

export const getStyledTextSegmentsSchema = {
  nodeId: z.string()
    .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
    .describe("The unique Figma text node ID to analyze. Must be a string in the format '123:456'."),
  property: z.enum([
    "fillStyleId", 
    "fontName", 
    "fontSize", 
    "textCase", 
    "textDecoration", 
    "textStyleId", 
    "fills", 
    "letterSpacing", 
    "lineHeight", 
    "fontWeight"
  ]).describe("The style property to analyze segments by. Must be one of the allowed style property names."),
};

export const scanTextNodesSchema = {
  nodeId: z.string()
    .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
    .describe("The unique Figma node ID to scan. Must be a string in the format '123:456'."),
};
