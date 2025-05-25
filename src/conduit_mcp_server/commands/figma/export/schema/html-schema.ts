import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

export const GenerateHtmlSchema = z.object({
  nodeId: z.string()
    .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
    .describe("The unique Figma node ID to generate HTML from. Must be a string in the format '123:456'."),
  format: z.enum(["semantic", "div-based", "webcomponent"])
    .default("semantic")
    .describe('Optional. The HTML output format: "semantic", "div-based", or "webcomponent". Defaults to "semantic".'),
  cssMode: z.enum(["inline", "classes", "external"])
    .default("classes")
    .describe('Optional. The CSS handling mode: "inline", "classes", or "external". Defaults to "classes".'),
});
