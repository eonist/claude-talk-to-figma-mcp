import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { CreateTextParams, CreateBoundedTextParams, CreateTextsParams } from "../../../../types/command-params.js";
import { BaseTextSchema, BoundedTextSchema, CreateTextsSchema } from "./text-schema.js";
import { v4 as uuidv4 } from "uuid";
import { handleToolError } from "../../../../utils/error-handling.js";

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

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created text node's ID.
`,
    BaseTextSchema.shape,
    {
      title: "Create Text",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          x: 100,
          y: 200,
          text: "Hello, world!",
          fontSize: 16,
          fontWeight: 400,
          name: "Greeting"
        }
      ]),
      edgeCaseWarnings: [
        "Text content must be a non-empty string.",
        "Font size and weight must be within supported ranges.",
        "If parentId is invalid, the text will be added to the root."
      ],
      extraInfo: "Useful for programmatically adding text labels, headings, or annotations."
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

  // Register the "create_texts" tool for batch-creating multiple text elements in Figma.
  server.tool(
    "create_texts",
    `Batch-creates multiple text elements in Figma. Accepts an array of text configs (same as create_text), and returns an array of created node IDs.`,
    CreateTextsSchema.shape,
    {
      title: "Create Texts (Batch)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          texts: [
            { x: 10, y: 20, text: "A" },
            { x: 30, y: 40, text: "B", fontSize: 18 }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "Each text config must have a non-empty string.",
        "Font size/weight must be valid.",
        "If parentId is invalid, text will be added to the root."
      ],
      extraInfo: "Efficient for adding many labels or annotations at once."
    },
    async (args: any) => {
      try {
        const params: CreateTextsParams = { commandId: uuidv4(), ...args };
        const results = [];
        for (const textConfig of params.texts) {
          const singleParams = { commandId: uuidv4(), ...textConfig };
          const node = await figmaClient.createText(singleParams);
          results.push({ type: "text", text: `Created text ${node.id}` });
        }
        return { content: results };
      } catch (err) {
        return handleToolError(err, "text-creation-tools", "create_texts") as any;
      }
    }
  );

  // Register the "create_bounded_text" tool for creating a bounded text box in Figma.
  server.tool(
    "create_bounded_text",
    `Creates a bounded text box in Figma at the specified coordinates and dimensions with the given text content. Optionally, you can set font size, weight, color, name, and parent node.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created bounded text node's ID.
`,
    BoundedTextSchema.shape,
    {
      title: "Create Bounded Text",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          x: 100,
          y: 200,
          width: 300,
          height: 100,
          text: "This is a bounded text box.",
          fontSize: 14,
          fontWeight: 500,
          name: "Description"
        }
      ]),
      edgeCaseWarnings: [
        "Text content must be a non-empty string.",
        "Width and height must be positive.",
        "Font size and weight must be within supported ranges.",
        "If parentId is invalid, the text will be added to the root."
      ],
      extraInfo: "Bounded text is useful for paragraphs, captions, or multi-line text blocks."
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
