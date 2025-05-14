import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { CreateTextParams, CreateBoundedTextParams } from "../../../../types/command-params.js";
import { v4 as uuidv4 } from "uuid";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers text-creation-related commands with the MCP server.
 * 
 * @param server - The MCP server instance to register tools on
 * @param figmaClient - The Figma client for executing commands
 * 
 * Adds:
 * - create_text: Create a new text element in Figma
 * - create_bounded_text: Create a bounded text box in Figma
 */
export function registerTextTools(server: McpServer, figmaClient: FigmaClient) {
  // Register the "create_text" tool for creating a new text element in Figma.
  server.tool(
    "create_text",
    `Creates a new text element in Figma at the specified coordinates with the given text content. Optionally, you can set font size, weight, color, name, and parent node.

Parameters:
  - x (number, required): X coordinate for the text element. Must be between -10,000 and 10,000. Example: 100
  - y (number, required): Y coordinate for the text element. Must be between -10,000 and 10,000. Example: 200
  - text (string, required): The text content. Must be a non-empty string up to 10,000 characters. Example: "Hello, Figma!"
  - fontSize (number, optional): Font size. Must be between 1 and 200.
  - fontWeight (number, optional): Font weight. Must be between 100 and 1000.
  - fontColor (any, optional): Font color.
  - name (string, optional): Name for the text node. If provided, must be a non-empty string up to 100 characters.
  - parentId (string, optional): Figma node ID of the parent. If provided, must be a string in the format '123:456'.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created text node's ID.

Annotations:
  - title: "Create Text"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "x": 100,
      "y": 200,
      "text": "Hello, Figma!"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Created text 123:456" }]
    }
`,
    {
      // Enforce reasonable X coordinate
      x: z.number()
        .min(-10000)
        .max(10000)
        .describe("X coordinate for the text element. Must be between -10,000 and 10,000."),
      // Enforce reasonable Y coordinate
      y: z.number()
        .min(-10000)
        .max(10000)
        .describe("Y coordinate for the text element. Must be between -10,000 and 10,000."),
      // Enforce non-empty string for text, reasonable length
      text: z.string()
        .min(1)
        .max(10000)
        .describe("The text content. Must be a non-empty string up to 10,000 characters."),
      // Enforce positive font size, reasonable upper bound
      fontSize: z.number()
        .min(1)
        .max(200)
        .optional()
        .describe("Optional. Font size. Must be between 1 and 200."),
      // Enforce reasonable font weight
      fontWeight: z.number()
        .min(100)
        .max(1000)
        .optional()
        .describe("Optional. Font weight. Must be between 100 and 1000."),
      // Accept any for fontColor (could be improved with stricter schema)
      fontColor: z.any().optional().describe("Optional. Font color."),
      // Enforce non-empty string for name if provided
      name: z.string()
        .min(1)
        .max(100)
        .optional()
        .describe("Optional. Name for the text node. If provided, must be a non-empty string up to 100 characters."),
      // Enforce Figma node ID format for parentId if provided
      parentId: z.string()
        .regex(/^\d+:\d+$/)
        .optional()
        .describe("Optional. Figma node ID of the parent. If provided, must be a string in the format '123:456'."),
    },
    // Tool handler: validates input, calls Figma client, and returns result or error.
    async (args) => {
      try {
        const params: CreateTextParams = { commandId: uuidv4(), ...args };
        const node = await figmaClient.createText(params);
        return { content: [{ type: "text", text: `Created text ${node.id}` }] };
      } catch (err) {
        // Handle errors and return a formatted error response.
        return handleToolError(err, "text-creation-tools", "create_text") as any;
      }
    }
  );

  // Register the "create_bounded_text" tool for creating a bounded text box in Figma.
  server.tool(
    "create_bounded_text",
    `Creates a bounded text box in Figma at the specified coordinates and dimensions with the given text content. Optionally, you can set font size, weight, color, name, and parent node.

Parameters:
  - x (number, required): X coordinate for the text box. Must be between -10,000 and 10,000. Example: 100
  - y (number, required): Y coordinate for the text box. Must be between -10,000 and 10,000. Example: 200
  - width (number, required): Width of the text box. Must be between 1 and 2000. Example: 300
  - height (number, required): Height of the text box. Must be between 1 and 2000. Example: 100
  - text (string, required): The text content. Must be a non-empty string up to 10,000 characters. Example: "Bounded text example"
  - fontSize (number, optional): Font size. Must be between 1 and 200.
  - fontWeight (number, optional): Font weight. Must be between 100 and 1000.
  - fontColor (any, optional): Font color.
  - name (string, optional): Name for the text node. If provided, must be a non-empty string up to 100 characters.
  - parentId (string, optional): Figma node ID of the parent. If provided, must be a string in the format '123:456'.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created bounded text node's ID.

Annotations:
  - title: "Create Bounded Text"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "x": 100,
      "y": 200,
      "width": 300,
      "height": 100,
      "text": "Bounded text example"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Created bounded text 123:456" }]
    }
`,
    {
      // Enforce reasonable X coordinate
      x: z.number()
        .min(-10000)
        .max(10000)
        .describe("X coordinate for the text box. Must be between -10,000 and 10,000."),
      // Enforce reasonable Y coordinate
      y: z.number()
        .min(-10000)
        .max(10000)
        .describe("Y coordinate for the text box. Must be between -10,000 and 10,000."),
      // Enforce positive width, reasonable upper bound
      width: z.number()
        .min(1)
        .max(2000)
        .describe("Width of the text box. Must be between 1 and 2000."),
      // Enforce positive height, reasonable upper bound
      height: z.number()
        .min(1)
        .max(2000)
        .describe("Height of the text box. Must be between 1 and 2000."),
      // Enforce non-empty string for text, reasonable length
      text: z.string()
        .min(1)
        .max(10000)
        .describe("The text content. Must be a non-empty string up to 10,000 characters."),
      // Enforce positive font size, reasonable upper bound
      fontSize: z.number()
        .min(1)
        .max(200)
        .optional()
        .describe("Optional. Font size. Must be between 1 and 200."),
      // Enforce reasonable font weight
      fontWeight: z.number()
        .min(100)
        .max(1000)
        .optional()
        .describe("Optional. Font weight. Must be between 100 and 1000."),
      // Accept any for fontColor (could be improved with stricter schema)
      fontColor: z.any().optional().describe("Optional. Font color."),
      // Enforce non-empty string for name if provided
      name: z.string()
        .min(1)
        .max(100)
        .optional()
        .describe("Optional. Name for the text node. If provided, must be a non-empty string up to 100 characters."),
      // Enforce Figma node ID format for parentId if provided
      parentId: z.string()
        .regex(/^\d+:\d+$/)
        .optional()
        .describe("Optional. Figma node ID of the parent. If provided, must be a string in the format '123:456'."),
    },
    // Tool handler: validates input, calls Figma client, and returns result or error.
    async (args) => {
      try {
        const params: CreateBoundedTextParams = { commandId: uuidv4(), ...args };
        const node = await figmaClient.executeCommand("create_bounded_text", params);
        return { content: [{ type: "text", text: `Created bounded text ${node.id}` }] };
      } catch (err) {
        // Handle errors and return a formatted error response.
        return handleToolError(err, "text-creation-tools", "create_bounded_text") as any;
      }
    }
  );
}
