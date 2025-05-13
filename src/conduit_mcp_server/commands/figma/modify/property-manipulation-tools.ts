import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";

/**
 * Registers property-manipulation-related modify commands:
 * - set_text_content
 * - set_multiple_text_contents
 * - set_corner_radius
 * - export_node_as_image
 * - set_font_name
 * - set_font_size
 * - set_font_weight
 * - set_letter_spacing
 * - set_line_height
 * - set_paragraph_spacing
 * - set_text_case
 * - set_text_decoration
 * - load_font_async
 * - set_effects
 * - set_effect_style_id
 * - set_auto_layout
 * - set_auto_layout_resizing
 * - detach_instance
 */
export function registerPropertyManipulationCommands(server: McpServer, figmaClient: FigmaClient) {
  // Set Text Content
  server.tool(
    "set_text_content",
    `Set the text content of an existing text node in Figma.

Parameters:
  - nodeId (string, required): The ID of the text node to update.
  - text (string, required): The new text content.

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Updated text of 123:456" }] }

Annotations:
  - title: "Set Text Content"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "text": "Updated text"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Updated text of 123:456" }]
    }
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456'."),
      // Enforce non-empty string for text content (Figma API and user safety)
      text: z.string()
        .min(1)
        .max(10000)
        .describe("The new text content to set for the node. Must be a non-empty string. Maximum length 10,000 characters."),
    },
    async ({ nodeId, text }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_text_content", { nodeId: id, text });
      return { content: [{ type: "text", text: `Updated text of ${id}` }] };
    }
    /*
    Additional Usage Example:
      Input:
        {
          "nodeId": "123:456",
          "text": "Hello, world!"
        }
      Output:
        {
          "content": [{ "type": "text", "text": "Updated text of 123:456" }]
        }

    Error Handling:
      - Returns an error if nodeId is invalid or not found.
      - Returns an error if text is empty or exceeds maximum length.

    Security Notes:
      - All inputs are validated and sanitized. nodeId must match the expected format (e.g., "123:456").
      - Text content is limited to 10,000 characters to prevent abuse.

    Output Schema:
      {
        "content": [
          {
            "type": "text",
            "text": "Updated text of <nodeId>"
          }
        ]
      }
    */
  );

  // Set Multiple Text Contents
  server.tool(
    "set_multiple_text_contents",
    `Set multiple text contents parallelly in a node.

Parameters:
  - nodeId (string, required): The ID of the parent node.
  - text (array, required): Array of objects with nodeId and text.

Returns:
  - content: Array containing a text message with the number of text nodes updated.
    Example: { "content": [{ "type": "text", "text": "Updated 3 text nodes" }] }

Annotations:
  - title: "Set Multiple Text Contents"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "parent:123",
      "text": [
        { "nodeId": "child:1", "text": "A" },
        { "nodeId": "child:2", "text": "B" }
      ]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Updated 2 text nodes" }]
    }
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma parent node ID. Must be a string in the format '123:456'."),
      // Enforce array of objects with valid nodeId and non-empty text
      text: z.array(
        z.object({
          // Enforce Figma node ID format for each child
          nodeId: z.string()
            .regex(/^\d+:\d+$/)
            .describe("The unique Figma child text node ID to update. Must be a string in the format '123:456'."),
          // Enforce non-empty string for text content
          text: z.string()
            .min(1)
            .max(10000)
            .describe("The new text content to set for the child node. Must be a non-empty string. Maximum length 10,000 characters."),
        })
      )
      .min(1)
      .max(100)
      .describe("Array of objects specifying nodeId and text for each child text node to update. Must contain 1 to 100 items."),
    },
    async ({ nodeId, text }) => {
      const parent = ensureNodeIdIsString(nodeId);
      const payload = text.map(t => ({ nodeId: ensureNodeIdIsString(t.nodeId), text: t.text }));
      await figmaClient.executeCommand("set_multiple_text_contents", { nodeId: parent, text: payload });
      return { content: [{ type: "text", text: `Updated ${payload.length} text nodes` }] };
    }
    /*
    Additional Usage Example:
      Input:
        {
          "nodeId": "parent:123",
          "text": [
            { "nodeId": "child:1", "text": "A" },
            { "nodeId": "child:2", "text": "B" }
          ]
        }
      Output:
        {
          "content": [{ "type": "text", "text": "Updated 2 text nodes" }]
        }

    Error Handling:
      - Returns an error if any nodeId is invalid or not found.
      - Returns an error if any text is empty or exceeds maximum length.
      - Returns an error if the array is empty or exceeds 100 items.

    Security Notes:
      - All inputs are validated and sanitized. All nodeIds must match the expected format.
      - Text content is limited to 10,000 characters per node and 100 nodes per call.

    Output Schema:
      {
        "content": [
          {
            "type": "text",
            "text": "Updated <N> text nodes"
          }
        ]
      }
    */
  );

  // Set Corner Radius
  server.tool(
    "set_corner_radius",
    `Set the corner radius of a node in Figma.

Parameters:
  - nodeId (string, required): The ID of the node to update.
  - radius (number, required): The new corner radius (>= 0).
  - corners (array, optional): Array of booleans for each corner (length 4).

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Set corner radius for 123:456" }] }

Annotations:
  - title: "Set Corner Radius"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "radius": 8
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Set corner radius for 123:456" }]
    }

Additional Usage Example (with corners):
  Input:
    {
      "nodeId": "123:456",
      "radius": 8,
      "corners": [true, false, true, false]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Set corner radius for 123:456" }]
    }

Error Handling:
  - Returns an error if nodeId is invalid or not found.
  - Returns an error if radius is negative or corners is not an array of four booleans.

Security Notes:
  - All inputs are validated and sanitized. nodeId must match the expected format (e.g., "123:456").
  - Only non-negative radius values are accepted.

Output Schema:
  {
    "content": [
      {
        "type": "text",
        "text": "Set corner radius for <nodeId>"
      }
    ]
  }
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456'."),
      // Enforce non-negative radius for Figma API and user safety
      radius: z.number().min(0)
        .describe("The new corner radius to set, in pixels. Must be a non-negative number (>= 0)."),
      // Enforce array of four booleans for explicit per-corner control (Figma API)
      corners: z.array(z.boolean()).length(4).optional()
        .describe("Optional. An array of four booleans indicating which corners to apply the radius to, in the order: [top-left, top-right, bottom-right, bottom-left]. If omitted, applies to all corners."),
    },
    async ({ nodeId, radius, corners }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_corner_radius", { nodeId: id, radius, corners });
      return { content: [{ type: "text", text: `Set corner radius for ${id}` }] };
    }
    // If the MCP server supports metadata/annotations as a separate argument, add here (non-breaking)
    // {
    //   title: "Set Corner Radius",
    //   idempotentHint: true,
    //   destructiveHint: false,
    //   readOnlyHint: false,
    //   openWorldHint: false
    // }
  );

  // Export Node As Image
  server.tool(
    "export_node_as_image",
    `Export a node as an image from Figma.

Parameters:
  - nodeId (string, required): The ID of the node to export.
  - format (string, optional): Image format ("PNG", "JPG", "SVG", "PDF").
  - scale (number, optional): Export scale (> 0).

Returns:
  - content: Array containing an image object with the exported image data.
    Example: { "content": [{ "type": "image", "data": "...", "mimeType": "image/png" }] }

Annotations:
  - title: "Export Node As Image"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "format": "PNG",
      "scale": 2
    }
  Output:
    {
      "content": [{ "type": "image", "data": "...", "mimeType": "image/png" }]
    }
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma node ID to export. Must be a string in the format '123:456'."),
      // Restrict format to allowed image types
      format: z.enum(["PNG", "JPG", "SVG", "PDF"]).optional()
        .describe('Optional. The image format to export: "PNG", "JPG", "SVG", or "PDF". Defaults to "PNG" if omitted.'),
      // Enforce positive scale for export
      scale: z.number().positive().optional()
        .describe("Optional. The export scale factor. Must be a positive number. Defaults to 1 if omitted."),
    },
    async ({ nodeId, format, scale }) => {
      const id = ensureNodeIdIsString(nodeId);
      const result = await figmaClient.executeCommand("export_node_as_image", { nodeId: id, format, scale });
      return { content: [{ type: "image", data: result.imageData, mimeType: result.mimeType }] };
    }
    /*
    Additional Usage Example:
      Input:
        {
          "nodeId": "123:456",
          "format": "SVG",
          "scale": 2
        }
      Output:
        {
          "content": [{ "type": "image", "data": "...", "mimeType": "image/svg+xml" }]
        }

    Error Handling:
      - Returns an error if nodeId is invalid or not found.
      - Returns an error if format is not one of the allowed values.
      - Returns an error if scale is not a positive number.

    Security Notes:
      - All inputs are validated and sanitized. nodeId must match the expected format.
      - Exported image data is limited by Figma's API.

    Output Schema:
      {
        "content": [
          {
            "type": "image",
            "data": "<base64 or binary>",
            "mimeType": "<image mime type>"
          }
        ]
      }
    */
  );

  // Font and Text Styling
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
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456'."),
      // Enforce non-empty string for font family
      family: z.string()
        .min(1)
        .max(100)
        .describe("The font family to set. Must be a non-empty string. Maximum length 100 characters."),
      // Enforce non-empty string for style if provided
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
    /*
    Additional Usage Example:
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

    Error Handling:
      - Returns an error if nodeId is invalid or not found.
      - Returns an error if family or style is empty or exceeds maximum length.

    Security Notes:
      - All inputs are validated and sanitized. nodeId must match the expected format.
      - Font family and style are limited to 100 characters.

    Output Schema:
      {
        "content": [
          {
            "type": "text",
            "text": "Font set for <nodeId>"
          }
        ]
      }
    */
  );
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
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456'."),
      // Enforce positive font size, reasonable upper bound
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
    /*
    Additional Usage Example:
      Input:
        {
          "nodeId": "123:456",
          "fontSize": 24
        }
      Output:
        {
          "content": [{ "type": "text", "text": "Font size set for 123:456" }]
        }

    Error Handling:
      - Returns an error if nodeId is invalid or not found.
      - Returns an error if fontSize is not between 1 and 512.

    Security Notes:
      - All inputs are validated and sanitized. nodeId must match the expected format.
      - fontSize is limited to a reasonable range for Figma.

    Output Schema:
      {
        "content": [
          {
            "type": "text",
            "text": "Font size set for <nodeId>"
          }
        ]
      }
    */
  );
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
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456'."),
      // Enforce integer font weight, reasonable range
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
    /*
    Additional Usage Example:
      Input:
        {
          "nodeId": "123:456",
          "weight": 700
        }
      Output:
        {
          "content": [{ "type": "text", "text": "Font weight set for 123:456" }]
        }

    Error Handling:
      - Returns an error if nodeId is invalid or not found.
      - Returns an error if weight is not an integer between 100 and 1000.

    Security Notes:
      - All inputs are validated and sanitized. nodeId must match the expected format.
      - weight is limited to a typical Figma font weight range.

    Output Schema:
      {
        "content": [
          {
            "type": "text",
            "text": "Font weight set for <nodeId>"
          }
        ]
      }
    */
  );
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
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456'."),
      // Enforce reasonable letter spacing range
      letterSpacing: z.number()
        .min(-100)
        .max(1000)
        .describe("The letter spacing value to set. Can be negative or positive, typically between -100 and 1000."),
      // Restrict unit to allowed values
      unit: z.enum(["PIXELS", "PERCENT"]).optional()
        .describe('Optional. The unit for letter spacing: "PIXELS" or "PERCENT". Defaults to "PIXELS" if omitted.'),
    },
    async ({ nodeId, letterSpacing, unit }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_letter_spacing", { nodeId: id, letterSpacing, unit });
      return { content: [{ type: "text", text: `Letter spacing set for ${id}` }] };
    }
    /*
    Additional Usage Example:
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

    Error Handling:
      - Returns an error if nodeId is invalid or not found.
      - Returns an error if letterSpacing is outside the allowed range.
      - Returns an error if unit is not "PIXELS" or "PERCENT".

    Security Notes:
      - All inputs are validated and sanitized. nodeId must match the expected format.
      - letterSpacing is limited to a reasonable range.

    Output Schema:
      {
        "content": [
          {
            "type": "text",
            "text": "Letter spacing set for <nodeId>"
          }
        ]
      }
    */
  );
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
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456'."),
      // Enforce positive line height, reasonable upper bound
      lineHeight: z.number()
        .min(1)
        .max(1000)
        .describe("The line height value to set. Must be a positive number between 1 and 1000."),
      // Restrict unit to allowed values
      unit: z.enum(["PIXELS", "PERCENT", "AUTO"]).optional()
        .describe('Optional. The unit for line height: "PIXELS", "PERCENT", or "AUTO". Defaults to "AUTO" if omitted.'),
    },
    async ({ nodeId, lineHeight, unit }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_line_height", { nodeId: id, lineHeight, unit });
      return { content: [{ type: "text", text: `Line height set for ${id}` }] };
    }
    /*
    Additional Usage Example:
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

    Error Handling:
      - Returns an error if nodeId is invalid or not found.
      - Returns an error if lineHeight is not between 1 and 1000.
      - Returns an error if unit is not "PIXELS", "PERCENT", or "AUTO".

    Security Notes:
      - All inputs are validated and sanitized. nodeId must match the expected format.
      - lineHeight is limited to a reasonable range.

    Output Schema:
      {
        "content": [
          {
            "type": "text",
            "text": "Line height set for <nodeId>"
          }
        ]
      }
    */
  );
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
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456'."),
      // Enforce positive paragraph spacing, reasonable upper bound
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
    /*
    Additional Usage Example:
      Input:
        {
          "nodeId": "123:456",
          "paragraphSpacing": 12
        }
      Output:
        {
          "content": [{ "type": "text", "text": "Paragraph spacing set for 123:456" }]
        }

    Error Handling:
      - Returns an error if nodeId is invalid or not found.
      - Returns an error if paragraphSpacing is not between 0 and 1000.

    Security Notes:
      - All inputs are validated and sanitized. nodeId must match the expected format.
      - paragraphSpacing is limited to a reasonable range.

    Output Schema:
      {
        "content": [
          {
            "type": "text",
            "text": "Paragraph spacing set for <nodeId>"
          }
        ]
      }
    */
  );
  server.tool(
    "set_text_case",
    `Set the text case of a text node in Figma.

Parameters:
  - nodeId (string, required): The ID of the text node.
  - textCase (string, required): Text case ("ORIGINAL", "UPPER", "LOWER", "TITLE").

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Text case set for 123:456" }] }

Annotations:
  - title: "Set Text Case"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "textCase": "UPPER"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Text case set for 123:456" }]
    }
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456'."),
      // Restrict textCase to allowed values
      textCase: z.enum(["ORIGINAL", "UPPER", "LOWER", "TITLE"])
        .describe('The text case to set: "ORIGINAL", "UPPER", "LOWER", or "TITLE".'),
    },
    async ({ nodeId, textCase }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_text_case", { nodeId: id, textCase });
      return { content: [{ type: "text", text: `Text case set for ${id}` }] };
    }
    /*
    Additional Usage Example:
      Input:
        {
          "nodeId": "123:456",
          "textCase": "UPPER"
        }
      Output:
        {
          "content": [{ "type": "text", "text": "Text case set for 123:456" }]
        }

    Error Handling:
      - Returns an error if nodeId is invalid or not found.
      - Returns an error if textCase is not one of the allowed values.

    Security Notes:
      - All inputs are validated and sanitized. nodeId must match the expected format.

    Output Schema:
      {
        "content": [
          {
            "type": "text",
            "text": "Text case set for <nodeId>"
          }
        ]
      }
    */
  );
  server.tool(
    "set_text_decoration",
    `Set the text decoration of a text node in Figma.

Parameters:
  - nodeId (string, required): The ID of the text node.
  - textDecoration (string, required): Text decoration ("NONE", "UNDERLINE", "STRIKETHROUGH").

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Text decoration set for 123:456" }] }

Annotations:
  - title: "Set Text Decoration"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "textDecoration": "UNDERLINE"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Text decoration set for 123:456" }]
    }
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456'."),
      // Restrict textDecoration to allowed values
      textDecoration: z.enum(["NONE", "UNDERLINE", "STRIKETHROUGH"])
        .describe('The text decoration to set: "NONE", "UNDERLINE", or "STRIKETHROUGH".'),
    },
    async ({ nodeId, textDecoration }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_text_decoration", { nodeId: id, textDecoration });
      return { content: [{ type: "text", text: `Text decoration set for ${id}` }] };
    }
    /*
    Additional Usage Example:
      Input:
        {
          "nodeId": "123:456",
          "textDecoration": "UNDERLINE"
        }
      Output:
        {
          "content": [{ "type": "text", "text": "Text decoration set for 123:456" }]
        }

    Error Handling:
      - Returns an error if nodeId is invalid or not found.
      - Returns an error if textDecoration is not one of the allowed values.

    Security Notes:
      - All inputs are validated and sanitized. nodeId must match the expected format.

    Output Schema:
      {
        "content": [
          {
            "type": "text",
            "text": "Text decoration set for <nodeId>"
          }
        ]
      }
    */
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

Annotations:
  - title: "Load Font Async"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "family": "Roboto",
      "style": "Bold"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Font loaded: Roboto" }]
    }
`,
    {
      // Enforce non-empty string for font family
      family: z.string()
        .min(1)
        .max(100)
        .describe("The font family to load. Must be a non-empty string. Maximum length 100 characters."),
      // Enforce non-empty string for style if provided
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
    /*
    Additional Usage Example:
      Input:
        {
          "family": "Roboto",
          "style": "Bold"
        }
      Output:
        {
          "content": [{ "type": "text", "text": "Font loaded: Roboto" }]
        }

    Error Handling:
      - Returns an error if family or style is empty or exceeds maximum length.

    Security Notes:
      - All inputs are validated and sanitized.
      - Font family and style are limited to 100 characters.

    Output Schema:
      {
        "content": [
          {
            "type": "text",
            "text": "Font loaded: <family>"
          }
        ]
      }
    */
  );

  // Effects
  server.tool(
    "set_effects",
    `Set visual effects of a node in Figma.

Parameters:
  - nodeId (string, required): The ID of the node.
  - effects (array, required): Array of effect objects.

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Effects set for 123:456" }] }

Annotations:
  - title: "Set Effects"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "effects": [{ "type": "DROP_SHADOW", "color": "#000000" }]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Effects set for 123:456" }]
    }
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456'."),
      // Enforce array of effect objects, at least one
      effects: z.array(z.any())
        .min(1)
        .max(20)
        .describe("Array of effect objects to apply. Must contain 1 to 20 items. Each effect object should match Figma's effect schema."),
    },
    async ({ nodeId, effects }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_effects", { nodeId: id, effects });
      return { content: [{ type: "text", text: `Effects set for ${id}` }] };
    }
    /*
    Additional Usage Example:
      Input:
        {
          "nodeId": "123:456",
          "effects": [{ "type": "DROP_SHADOW", "color": "#000000" }]
        }
      Output:
        {
          "content": [{ "type": "text", "text": "Effects set for 123:456" }]
        }

    Error Handling:
      - Returns an error if nodeId is invalid or not found.
      - Returns an error if effects array is empty or exceeds 20 items.

    Security Notes:
      - All inputs are validated and sanitized. nodeId must match the expected format.
      - effects array is limited to 20 items.

    Output Schema:
      {
        "content": [
          {
            "type": "text",
            "text": "Effects set for <nodeId>"
          }
        ]
      }
    */
  );
  server.tool(
    "set_effect_style_id",
    `Apply an effect style to a node in Figma.

Parameters:
  - nodeId (string, required): The ID of the node.
  - effectStyleId (string, required): The ID of the effect style to apply.

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Effect style applied to 123:456" }] }

Annotations:
  - title: "Set Effect Style ID"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "effectStyleId": "effect:789"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Effect style applied to 123:456" }]
    }
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456'."),
      // Enforce non-empty string for effectStyleId
      effectStyleId: z.string()
        .min(1)
        .max(100)
        .describe("The ID of the effect style to apply. Must be a non-empty string. Maximum length 100 characters."),
    },
    async ({ nodeId, effectStyleId }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_effect_style_id", { nodeId: id, effectStyleId });
      return { content: [{ type: "text", text: `Effect style applied to ${id}` }] };
    }
    /*
    Additional Usage Example:
      Input:
        {
          "nodeId": "123:456",
          "effectStyleId": "effect:789"
        }
      Output:
        {
          "content": [{ "type": "text", "text": "Effect style applied to 123:456" }]
        }

    Error Handling:
      - Returns an error if nodeId is invalid or not found.
      - Returns an error if effectStyleId is empty or exceeds maximum length.

    Security Notes:
      - All inputs are validated and sanitized. nodeId must match the expected format.
      - effectStyleId is limited to 100 characters.

    Output Schema:
      {
        "content": [
          {
            "type": "text",
            "text": "Effect style applied to <nodeId>"
          }
        ]
      }
    */
  );

  // Auto Layout
  server.tool(
    "set_auto_layout",
    `Configure auto layout properties for a node in Figma.

Parameters:
  - nodeId (string, required): The ID of the node.
  - layoutMode (string, required): Layout mode ("HORIZONTAL", "VERTICAL", "NONE").

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Auto layout set for 123:456" }] }

Annotations:
  - title: "Set Auto Layout"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "layoutMode": "HORIZONTAL"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Auto layout set for 123:456" }]
    }
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456'."),
      // Restrict layoutMode to allowed values
      layoutMode: z.enum(["HORIZONTAL", "VERTICAL", "NONE"])
        .describe('The auto layout mode to set: "HORIZONTAL", "VERTICAL", or "NONE".'),
    },
    async ({ nodeId, layoutMode }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_auto_layout", { nodeId: id, layoutMode });
      return { content: [{ type: "text", text: `Auto layout set for ${id}` }] };
    }
    /*
    Additional Usage Example:
      Input:
        {
          "nodeId": "123:456",
          "layoutMode": "VERTICAL"
        }
      Output:
        {
          "content": [{ "type": "text", "text": "Auto layout set for 123:456" }]
        }

    Error Handling:
      - Returns an error if nodeId is invalid or not found.
      - Returns an error if layoutMode is not one of the allowed values.

    Security Notes:
      - All inputs are validated and sanitized. nodeId must match the expected format.

    Output Schema:
      {
        "content": [
          {
            "type": "text",
            "text": "Auto layout set for <nodeId>"
          }
        ]
      }
    */
  );
  server.tool(
    "set_auto_layout_resizing",
    `Set hug or fill sizing mode on an auto layout frame or child node.

Parameters:
  - nodeId (string, required): The ID of the node.
  - axis (string, required): Axis ("horizontal" or "vertical").
  - mode (string, required): Sizing mode ("FIXED", "HUG", "FILL").

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Auto layout resizing set for 123:456" }] }

Annotations:
  - title: "Set Auto Layout Resizing"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "axis": "horizontal",
      "mode": "HUG"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Auto layout resizing set for 123:456" }]
    }
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456'."),
      // Restrict axis to allowed values
      axis: z.enum(["horizontal", "vertical"])
        .describe('The axis to set sizing mode for: "horizontal" or "vertical".'),
      // Restrict mode to allowed values
      mode: z.enum(["FIXED", "HUG", "FILL"])
        .describe('The sizing mode to set: "FIXED", "HUG", or "FILL".'),
    },
    async ({ nodeId, axis, mode }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_auto_layout_resizing", { nodeId: id, axis, mode });
      return { content: [{ type: "text", text: `Auto layout resizing set for ${id}` }] };
    }
    /*
    Additional Usage Example:
      Input:
        {
          "nodeId": "123:456",
          "axis": "vertical",
          "mode": "FILL"
        }
      Output:
        {
          "content": [{ "type": "text", "text": "Auto layout resizing set for 123:456" }]
        }

    Error Handling:
      - Returns an error if nodeId is invalid or not found.
      - Returns an error if axis or mode is not one of the allowed values.

    Security Notes:
      - All inputs are validated and sanitized. nodeId must match the expected format.

    Output Schema:
      {
        "content": [
          {
            "type": "text",
            "text": "Auto layout resizing set for <nodeId>"
          }
        ]
      }
    */
  );

  // Detach Instance
  server.tool(
    "detach_instance",
    `Detach a Figma component instance from its master.

Parameters:
  - instanceId (string, required): The ID of the instance to detach.

Returns:
  - content: Array containing a text message with the detached instance's ID.
    Example: { "content": [{ "type": "text", "text": "Detached instance 123:456" }] }

Annotations:
  - title: "Detach Instance"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "instanceId": "123:456"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Detached instance 123:456" }]
    }
`,
    { instanceId: z.string() },
    async ({ instanceId }) => {
      const id = ensureNodeIdIsString(instanceId);
      const result = await figmaClient.executeCommand("detach_instance", { instanceId: id });
      return { content: [{ type: "text", text: `Detached instance ${result.id}` }] };
    }
  );
}
