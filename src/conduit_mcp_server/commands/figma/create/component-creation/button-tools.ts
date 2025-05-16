import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";

/**
 * Registers button creation command on the MCP server.
 *
 * This function adds a tool named "create_button" to the MCP server,
 * enabling creation of a complete button with customizable style and text in Figma.
 * It validates inputs, executes the corresponding Figma command, and returns the result.
 *
 * @param {McpServer} server - The MCP server instance to register the tool on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tool asynchronously.
 *
 * @example
 * registerButtonTools(server, figmaClient);
 */
export function registerButtonTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "create_button",
    `Creates a complete button with background and text in Figma at the specified coordinates. You can customize size, text, colors, font, corner radius, name, and parent node.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created button's frame, background, and text node IDs.
`,
    {
      x: z.number().min(-10000).max(10000)
        .describe("X coordinate for the button. Must be between -10,000 and 10,000. Example: 100"),
      y: z.number().min(-10000).max(10000)
        .describe("Y coordinate for the button. Must be between -10,000 and 10,000. Example: 200"),
      width: z.number().min(1).max(2000).optional().default(100)
        .describe("Width of the button. Default 100. Must be between 1 and 2000."),
      height: z.number().min(1).max(2000).optional().default(40)
        .describe("Height of the button. Default 40. Must be between 1 and 2000."),
      text: z.string().min(1).max(200).optional().default("Button")
        .describe('Button text. Default "Button". Must be 1-200 characters.'),
      background: z.object({
        r: z.number().min(0).max(1)
          .describe("Red channel (0-1)"),
        g: z.number().min(0).max(1)
          .describe("Green channel (0-1)"),
        b: z.number().min(0).max(1)
          .describe("Blue channel (0-1)"),
        a: z.number().min(0).max(1).optional().default(1)
          .describe("Alpha channel (0-1). Default 1")
      }).optional().default({ r: 0.19, g: 0.39, b: 0.85, a: 1 })
        .describe("Background color. Default { r: 0.19, g: 0.39, b: 0.85, a: 1 }"),
      textColor: z.object({
        r: z.number().min(0).max(1)
          .describe("Red channel (0-1)"),
        g: z.number().min(0).max(1)
          .describe("Green channel (0-1)"),
        b: z.number().min(0).max(1)
          .describe("Blue channel (0-1)"),
        a: z.number().min(0).max(1).optional().default(1)
          .describe("Alpha channel (0-1). Default 1")
      }).optional().default({ r: 1, g: 1, b: 1, a: 1 })
        .describe("Text color. Default { r: 1, g: 1, b: 1, a: 1 }"),
      fontSize: z.number().min(1).max(200).optional().default(14)
        .describe("Font size. Default 14. Must be between 1 and 200."),
      fontWeight: z.number().min(100).max(1000).optional().default(500)
        .describe("Font weight. Default 500. Must be between 100 and 1000."),
      cornerRadius: z.number().min(0).max(100).optional().default(4)
        .describe("Corner radius. Default 4. Must be between 0 and 100."),
      name: z.string().min(1).max(100).optional()
        .describe("Name for the button node. If provided, must be 1-100 characters."),
      parentId: z.string()
        .describe("Figma node ID of the parent. If provided, must be a string in the format '123:456'.")
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .optional(),
    },
    {
      title: "Create Button",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          x: 100,
          y: 200,
          width: 120,
          height: 40,
          text: "Click Me",
          background: { r: 0.2, g: 0.5, b: 0.8, a: 1 },
          textColor: { r: 1, g: 1, b: 1, a: 1 },
          fontSize: 16,
          fontWeight: 600,
          cornerRadius: 8,
          name: "Primary Button"
        }
      ]),
      edgeCaseWarnings: [
        "Width and height must be within allowed range.",
        "Text must be a non-empty string.",
        "Color values must be between 0 and 1.",
        "If parentId is invalid, the button will be added to the root."
      ],
      extraInfo: "Creates a visually complete button with customizable style and text."
    },
    async (args) => {
      try {
        const params = {
          x: args.x,
          y: args.y,
          width: args.width,
          height: args.height,
          text: args.text,
          style: {
            background: args.background,
            text: args.textColor,
            fontSize: args.fontSize,
            fontWeight: args.fontWeight,
            cornerRadius: args.cornerRadius
          },
          name: args.name,
          parentId: args.parentId
        };
        const result = await figmaClient.executeCommand("create_button", params);
        return { 
          content: [{ 
            type: "text", 
            text: `Created button with frame ID: ${result.frameId}, background ID: ${result.backgroundId}, text ID: ${result.textId}` 
          }],
          _meta: {
            frameId: result.frameId,
            backgroundId: result.backgroundId,
            textId: result.textId
          }
        };
      } catch (err) {
        return handleToolError(err, "component-creation-tools", "create_button") as any;
      }
    }
  );
}
