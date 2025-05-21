import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { MCP_COMMANDS } from "../../../../types/commands";
import { z, ensureNodeIdIsString } from "../utils.js";
import { CreateTextParams, CreateBoundedTextParams } from "../../../../types/command-params.js";
import { SingleTextSchema, BatchTextsSchema, TextSchema } from "./text-schema.js";
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
 * - createText: Create a text box in Figma (bounded text box support removed)
 */
export function registerTextTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified single/batch text creation (regular and bounded)
  server.tool(
    MCP_COMMANDS.SET_TEXT,
    `Creates one or more text elements in Figma. Accepts either a single text config (via 'text') or an array of configs (via 'texts').
If 'width' and 'height' are provided, creates a bounded text box; otherwise, creates a regular text node.

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
            { x: 10, y: 20, text: "A" },
            { x: 30, y: 40, width: 120, height: 60, text: "B", fontSize: 18 }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "Text content must be a non-empty string.",
        "Font size and weight must be within supported ranges.",
        "If width and height are provided, both must be positive.",
        "If parentId is invalid, the text will be added to the root."
      ],
      extraInfo: "Supports both regular and bounded text. Batch creation is efficient for adding many labels or text boxes at once."
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
        const nodeIds: string[] = [];
        for (const textConfig of textsArr) {
          const params: CreateTextParams = { commandId: uuidv4(), ...textConfig };
          const result = await (figmaClient as any).createText(params);
          if (result && typeof result.id === "string") {
            nodeIds.push(result.id);
          } else if (result && Array.isArray(result.nodes)) {
            for (const node of result.nodes) {
              if (node && typeof node.id === "string") {
                nodeIds.push(node.id);
              }
            }
          }
        }
        return {
          success: true,
          message: nodeIds.length === 1
            ? `Text node created successfully.`
            : `Text nodes created successfully.`,
          nodeIds
        };
      } catch (err) {
        // Return a structured error response.
        return {
          success: false,
          error: {
            message: err instanceof Error ? err.message : String(err),
            ...(err && typeof err === "object" && "stack" in err ? { stack: (err as Error).stack } : {})
          }
        };
      }
    }
  );
}
