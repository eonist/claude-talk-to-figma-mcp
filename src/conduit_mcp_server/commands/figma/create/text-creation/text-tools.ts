import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { CreateTextParams, CreateBoundedTextParams } from "../../../../types/command-params.js";
import { SingleTextSchema, BatchTextsSchema, TextSchema, SingleBoundedTextSchema, BatchBoundedTextsSchema, BoundedTextSchema } from "./text-schema.js";
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
  // Unified single/batch text creation
  server.tool(
    "create_text",
    `Creates one or more text elements in Figma. Accepts either a single text config (via 'text') or an array of configs (via 'texts').

Input:
  - text: A single text configuration object.
  - texts: An array of text configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created text node ID(s).
`,
    {
      text: SingleTextSchema.optional(),
      texts: BatchTextsSchema.optional(),
    },
    {
      title: "Create Text(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          text: {
            x: 100,
            y: 200,
            text: "Hello, world!",
            fontSize: 16,
            fontWeight: 400,
            name: "Greeting"
          }
        },
        {
          texts: [
            { x: 10, y: 20, text: "A" },
            { x: 30, y: 40, text: "B", fontSize: 18 }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "Text content must be a non-empty string.",
        "Font size and weight must be within supported ranges.",
        "If parentId is invalid, the text will be added to the root."
      ],
      extraInfo: "Useful for programmatically adding text labels, headings, or annotations. Batch creation is efficient for adding many labels or annotations at once."
    },
    async (args) => {
      try {
        let textsArr;
        if (args.texts) {
          textsArr = args.texts;
        } else if (args.text) {
          textsArr = [args.text];
        } else {
          throw new Error("You must provide either 'text' or 'texts' as input.");
        }
        const results = [];
        for (const textConfig of textsArr) {
          const params: CreateTextParams = { commandId: uuidv4(), ...textConfig };
          const node = await figmaClient.createText(params);
          results.push({ type: "text", text: `Created text ${node.id}` });
        }
        return { content: results };
      } catch (err) {
        return handleToolError(err, "text-creation-tools", "create_text") as any;
      }
    }
  );

  // Unified single/batch bounded text creation
  server.tool(
    "create_bounded_text",
    `Creates one or more bounded text boxes in Figma. Accepts either a single bounded text config (via 'text') or an array of configs (via 'texts').

Input:
  - text: A single bounded text configuration object.
  - texts: An array of bounded text configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created bounded text node ID(s).
`,
    {
      text: SingleBoundedTextSchema.optional(),
      texts: BatchBoundedTextsSchema.optional(),
    },
    {
      title: "Create Bounded Text(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          text: {
            x: 100,
            y: 200,
            width: 300,
            height: 100,
            text: "This is a bounded text box.",
            fontSize: 14,
            fontWeight: 500,
            name: "Description"
          }
        },
        {
          texts: [
            { x: 10, y: 20, width: 100, height: 40, text: "A" },
            { x: 30, y: 40, width: 120, height: 60, text: "B", fontSize: 18 }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "Text content must be a non-empty string.",
        "Width and height must be positive.",
        "Font size and weight must be within supported ranges.",
        "If parentId is invalid, the text will be added to the root."
      ],
      extraInfo: "Bounded text is useful for paragraphs, captions, or multi-line text blocks. Batch creation is efficient for adding many bounded text boxes at once."
    },
    async (args) => {
      try {
        let textsArr;
        if (args.texts) {
          textsArr = args.texts;
        } else if (args.text) {
          textsArr = [args.text];
        } else {
          throw new Error("You must provide either 'text' or 'texts' as input.");
        }
        const results = [];
        for (const textConfig of textsArr) {
          const params: CreateBoundedTextParams = { commandId: uuidv4(), ...textConfig };
          const node = await figmaClient.executeCommand("create_bounded_text", params);
          results.push({ type: "text", text: `Created bounded text ${node.id}` });
        }
        return { content: results };
      } catch (err) {
        return handleToolError(err, "text-creation-tools", "create_bounded_text") as any;
      }
    }
  );
}
