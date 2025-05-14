import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers property-manipulation-related modify commands:
 * - set_font_name
 * - set_font_size
 * - set_font_weight
 * - set_letter_spacing
 * - set_line_height
 * - set_paragraph_spacing
 * - set_text_case
 * - set_text_decoration
 * - load_font_async
 */
export function registerFontTools(server: McpServer, figmaClient: FigmaClient) {
  // Set Font Name
  server.tool(
    "set_font_name",
    `Set the font name and style of a text node in Figma.

Parameters:
  - nodeId (string, required): The ID of the text node.
  - family (string, required): Font family.
  - style (string, optional): Font style.

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Font set for 123:456" }] }

Annotations:
  - title: "Set Font Name"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "family": "Roboto",
      "style": "Bold"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Font set for 123:456" }]
    }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      family: z.string()
        .min(1)
        .max(100)
        .describe("The font family to set. Must be a non-empty string. Maximum length 100 characters."),
      style: z.string()
        .min(1)
        .max(100)
        .optional()
        .describe("Optional. The font style to set (e.g., 'Bold', 'Italic'). If provided, must be a non-empty string. Maximum length 100 characters."),
    },
    async ({ nodeId, family, style }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_font_name", { nodeId: id, family, style });
      return { content: [{ type: "text", text: `Font set for ${id}` }] };
    }
  );

  // Set Font Size
  server.tool(
    "set_font_size",
    `Set the font size of a text node in Figma.

Parameters:
  - nodeId (string, required): The ID of the text node.
  - fontSize (number, required): Font size (> 0).

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Font size set for 123:456" }] }

Annotations:
  - title: "Set Font Size"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "fontSize": 16
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Font size set for 123:456" }]
    }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      fontSize: z.number()
        .min(1)
        .max(512)
        .describe("The font size to set, in points. Must be a positive number between 1 and 512."),
    },
    async ({ nodeId, fontSize }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_font_size", { nodeId: id, fontSize });
      return { content: [{ type: "text", text: `Font size set for ${id}` }] };
    }
  );

  // Set Font Weight
  server.tool(
    "set_font_weight",
    `Set the font weight of a text node in Figma.

Parameters:
  - nodeId (string, required): The ID of the text node.
  - weight (number, required): Font weight.

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Font weight set for 123:456" }] }

Annotations:
  - title: "Set Font Weight"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "weight": 700
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Font weight set for 123:456" }]
    }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      weight: z.number()
        .int()
        .min(100)
        .max(1000)
        .describe("The font weight to set. Must be an integer between 100 and 1000 (typical Figma font weight range)."),
    },
    async ({ nodeId, weight }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_font_weight", { nodeId: id, weight });
      return { content: [{ type: "text", text: `Font weight set for ${id}` }] };
    }
  );

  // Set Letter Spacing
  server.tool(
    "set_letter_spacing",
    `Set the letter spacing of a text node in Figma.

Parameters:
  - nodeId (string, required): The ID of the text node.
  - letterSpacing (number, required): Letter spacing value.
  - unit (string, optional): Unit ("PIXELS" or "PERCENT").

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Letter spacing set for 123:456" }] }

Annotations:
  - title: "Set Letter Spacing"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "letterSpacing": 2,
      "unit": "PIXELS"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Letter spacing set for 123:456" }]
    }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      letterSpacing: z.number()
        .min(-100)
        .max(1000)
        .describe("The letter spacing value to set. Can be negative or positive, typically between -100 and 1000."),
      unit: z.enum(["PIXELS", "PERCENT"]).optional()
        .describe('Optional. The unit for letter spacing: "PIXELS" or "PERCENT". Defaults to "PIXELS" if omitted.'),
    },
    async ({ nodeId, letterSpacing, unit }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_letter_spacing", { nodeId: id, letterSpacing, unit });
      return { content: [{ type: "text", text: `Letter spacing set for ${id}` }] };
    }
  );

  // Set Line Height
  server.tool(
    "set_line_height",
    `Set the line height of a text node in Figma.

Parameters:
  - nodeId (string, required): The ID of the text node.
  - lineHeight (number, required): Line height value.
  - unit (string, optional): Unit ("PIXELS", "PERCENT", "AUTO").

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Line height set for 123:456" }] }

Annotations:
  - title: "Set Line Height"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "lineHeight": 24,
      "unit": "PIXELS"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Line height set for 123:456" }]
    }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      lineHeight: z.number()
        .min(1)
        .max(1000)
        .describe("The line height value to set. Must be a positive number between 1 and 1000."),
      unit: z.enum(["PIXELS", "PERCENT", "AUTO"]).optional()
        .describe('Optional. The unit for line height: "PIXELS", "PERCENT", or "AUTO". Defaults to "AUTO" if omitted.'),
    },
    async ({ nodeId, lineHeight, unit }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_line_height", { nodeId: id, lineHeight, unit });
      return { content: [{ type: "text", text: `Line height set for ${id}` }] };
    }
  );

  // Set Paragraph Spacing
  server.tool(
    "set_paragraph_spacing",
    `Set the paragraph spacing of a text node in Figma.

Parameters:
  - nodeId (string, required): The ID of the text node.
  - paragraphSpacing (number, required): Paragraph spacing value.

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Paragraph spacing set for 123:456" }] }

Annotations:
  - title: "Set Paragraph Spacing"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "paragraphSpacing": 12
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Paragraph spacing set for 123:456" }]
    }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456'."),
      paragraphSpacing: z.number()
        .min(0)
        .max(1000)
        .describe("The paragraph spacing value to set. Must be a non-negative number between 0 and 1000."),
    },
    async ({ nodeId, paragraphSpacing }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_paragraph_spacing", { nodeId: id, paragraphSpacing });
      return { content: [{ type: "text", text: `Paragraph spacing set for ${id}` }] };
    }
  );

  // Set Text Case
  server.tool(
    "set_text_case",
    `Set the text case of a text node in Figma.

Parameters:
  - nodeId (string, required): The ID of the text node.
  - textCase (string, required): Text case ("ORIGINAL", "UPPER", "LOWER", "TITLE").

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Text case set for 123:456" }] }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456'."),
      textCase: z.enum(["ORIGINAL", "UPPER", "LOWER", "TITLE"])
        .describe('The text case to set: "ORIGINAL", "UPPER", "LOWER", or "TITLE".'),
    },
    async ({ nodeId, textCase }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_text_case", { nodeId: id, textCase });
      return { content: [{ type: "text", text: `Text case set for ${id}` }] };
    }
  );

  // Set Text Decoration
  server.tool(
    "set_text_decoration",
    `Set the text decoration of a text node in Figma.

Parameters:
  - nodeId (string, required): The ID of the text node.
  - textDecoration (string, required): Text decoration ("NONE", "UNDERLINE", "STRIKETHROUGH").

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Text decoration set for 123:456" }] }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456'."),
      textDecoration: z.enum(["NONE", "UNDERLINE", "STRIKETHROUGH"])
        .describe('The text decoration to set: "NONE", "UNDERLINE", or "STRIKETHROUGH".'),
    },
    async ({ nodeId, textDecoration }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_text_decoration", { nodeId: id, textDecoration });
      return { content: [{ type: "text", text: `Text decoration set for ${id}` }] };
    }
  );

  // Load Font Async
  server.tool(
    "load_font_async",
    `Load a font asynchronously in Figma.

Parameters:
  - family (string, required): Font family.
  - style (string, optional): Font style.

Returns:
  - content: Array containing a text message with the loaded font.
    Example: { "content": [{ "type": "text", "text": "Font loaded: Roboto" }] }
`,
    {
      family: z.string()
        .min(1)
        .max(100)
        .describe("The font family to load. Must be a non-empty string. Maximum length 100 characters."),
      style: z.string()
        .min(1)
        .max(100)
        .optional()
        .describe("Optional. The font style to load (e.g., 'Bold', 'Italic'). If provided, must be a non-empty string. Maximum length 100 characters."),
    },
    async ({ family, style }) => {
      await figmaClient.executeCommand("load_font_async", { family, style });
      return { content: [{ type: "text", text: `Font loaded: ${family}` }] };
    }
  );
}
