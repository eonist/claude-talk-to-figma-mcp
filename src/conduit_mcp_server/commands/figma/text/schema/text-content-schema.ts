import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Schema for a single node ID with validation
 */
export const NodeIdSchema = z.string()
  .refine(isValidNodeId, { 
    message: "Must be a valid Figma text node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" 
  })
  .describe("The unique Figma text node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'.");

/**
 * Schema for text content string
 */
export const TextContentSchema = z.string()
  .min(1)
  .max(10000)
  .describe("The new text content to set for the node. Must be a non-empty string. Maximum length 10,000 characters.");

/**
 * Schema for font name object
 */
export const FontNameSchema = z.object({
  family: z.string().min(1).max(100).describe("Font family name"),
  style: z.string().min(1).max(100).describe("Font style (e.g., 'Regular', 'Bold', 'Italic')")
}).describe("Font name object with family and style");

/**
 * Schema for letter spacing with units
 */
export const LetterSpacingSchema = z.object({
  value: z.number().describe("Letter spacing value"),
  unit: z.enum(["PIXELS", "PERCENT"]).describe("Letter spacing unit")
}).describe("Letter spacing with value and unit");

/**
 * Schema for line height with units
 */
export const LineHeightSchema = z.union([
  z.number().describe("Line height as multiplier (e.g., 1.6)"),
  z.object({
    value: z.number().describe("Line height value"),
    unit: z.enum(["PIXELS", "PERCENT", "AUTO", "MULTIPLIER"]).describe("Line height unit")
  }).describe("Line height with value and unit")
]).describe("Line height as number or object with value and unit");

/**
 * Schema for text case values
 */
export const TextCaseSchema = z.enum([
  "ORIGINAL", "UPPER", "LOWER", "TITLE", "SMALL_CAPS", "SMALL_CAPS_FORCED"
]).describe("Text case transformation");

/**
 * Schema for text decoration values
 */
export const TextDecorationSchema = z.enum([
  "NONE", "UNDERLINE", "STRIKETHROUGH"
]).describe("Text decoration type");

/**
 * Schema for RGBA color object
 */
export const ColorSchema = z.object({
  r: z.number().min(0).max(1).describe("Red channel (0-1)"),
  g: z.number().min(0).max(1).describe("Green channel (0-1)"),
  b: z.number().min(0).max(1).describe("Blue channel (0-1)"),
  a: z.number().min(0).max(1).optional().describe("Alpha channel (0-1)")
}).describe("RGBA color object");

/**
 * Comprehensive schema for text style properties
 */
export const TextStylePropertiesSchema = z.object({
  fontSize: z.number()
    .min(1)
    .max(200)
    .optional()
    .describe("Font size in pixels. Must be between 1 and 200."),
  fontWeight: z.number()
    .min(100)
    .max(1000)
    .optional()
    .describe("Font weight. Must be between 100 and 1000."),
  fontName: z.union([
    z.string().min(1).max(100),
    FontNameSchema
  ]).optional().describe("Font name as string (family name) or object with family and style"),
  letterSpacing: LetterSpacingSchema.optional(),
  lineHeight: LineHeightSchema.optional(),
  paragraphSpacing: z.number()
    .min(0)
    .max(1000)
    .optional()
    .describe("Paragraph spacing in pixels. Must be between 0 and 1000."),
  textCase: TextCaseSchema.optional(),
  textDecoration: TextDecorationSchema.optional(),
  fontColor: ColorSchema.optional().describe("Font color as RGBA object"),
  fills: z.array(z.any()).optional().describe("Array of fill objects"),
  textAlignHorizontal: z.enum(["LEFT", "CENTER", "RIGHT", "JUSTIFIED"])
    .optional()
    .describe("Horizontal text alignment"),
  textAlignVertical: z.enum(["TOP", "CENTER", "BOTTOM"])
    .optional()
    .describe("Vertical text alignment"),
  textAutoResize: z.enum(["NONE", "WIDTH_AND_HEIGHT", "HEIGHT"])
    .optional()
    .describe("Text auto-resize behavior"),
  textTruncation: z.enum(["DISABLED", "ENDING"])
    .optional()
    .describe("Text truncation behavior"),
  maxLines: z.number()
    .min(1)
    .optional()
    .describe("Maximum number of lines for text truncation")
}).describe("Text style properties object");

/**
 * Schema for a single text style update entry
 */
export const TextStyleEntrySchema = z.object({
  nodeId: NodeIdSchema,
  styles: TextStylePropertiesSchema
}).describe("A single text style update entry with nodeId and styles");

/**
 * Schema for batch text style entries
 */
export const BatchTextStyleEntriesSchema = z.array(TextStyleEntrySchema)
  .min(1)
  .max(100)
  .describe("Array of text style update entries. Must contain 1 to 100 items.");

/**
 * Schema for SET_TEXT_CONTENT tool parameters
 */
export const SetTextContentParamsSchema = z.object({
  nodeId: NodeIdSchema.optional(),
  text: TextContentSchema.optional(),
  texts: z.array(z.object({
    nodeId: NodeIdSchema,
    text: TextContentSchema
  })).min(1).max(100).optional()
}).refine(
  (data) => (data.nodeId && data.text) || data.texts,
  { message: "Must provide either (nodeId + text) or texts array" }
).describe("Parameters for SET_TEXT_CONTENT tool");

/**
 * Schema for SET_TEXT_STYLE tool parameters
 */
export const SetTextStyleParamsSchema = z.object({
  nodeId: NodeIdSchema.optional(),
  styles: TextStylePropertiesSchema.optional(),
  entries: BatchTextStyleEntriesSchema.optional()
}).refine(
  (data) => (data.nodeId && data.styles) || data.entries,
  { message: "Must provide either (nodeId + styles) or entries array" }
).describe("Parameters for SET_TEXT_STYLE tool");

/**
 * TypeScript types inferred from schemas
 */
export type NodeId = z.infer<typeof NodeIdSchema>;
export type TextContent = z.infer<typeof TextContentSchema>;
export type FontName = z.infer<typeof FontNameSchema>;
export type LetterSpacing = z.infer<typeof LetterSpacingSchema>;
export type LineHeight = z.infer<typeof LineHeightSchema>;
export type TextCase = z.infer<typeof TextCaseSchema>;
export type TextDecoration = z.infer<typeof TextDecorationSchema>;
export type Color = z.infer<typeof ColorSchema>;
export type TextStyleProperties = z.infer<typeof TextStylePropertiesSchema>;
export type TextStyleEntry = z.infer<typeof TextStyleEntrySchema>;
export type BatchTextStyleEntries = z.infer<typeof BatchTextStyleEntriesSchema>;
export type SetTextContentParams = z.infer<typeof SetTextContentParamsSchema>;
export type SetTextStyleParams = z.infer<typeof SetTextStyleParamsSchema>;
