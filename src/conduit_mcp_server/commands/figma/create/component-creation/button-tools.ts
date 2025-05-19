import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { MCP_COMMANDS } from "../../../../types/commands.js";

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
    MCP_COMMANDS.CREATE_BUTTON,
    `Creates a complete button with background and text in Figma at the specified coordinates. You can customize size, text, colors, font, corner radius, name, and parent node.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created button's frame, background, and text node IDs.
`,
    {
      // Single button params
      x: z.number().min(-10000).max(10000).optional(),
      y: z.number().min(-10000).max(10000).optional(),
      width: z.number().min(1).max(2000).optional(),
      height: z.number().min(1).max(2000).optional(),
      text: z.string().min(1).max(200).optional(),
      background: z.object({
        r: z.number().min(0).max(1),
        g: z.number().min(0).max(1),
        b: z.number().min(0).max(1),
        a: z.number().min(0).max(1).optional()
      }).optional(),
      textColor: z.object({
        r: z.number().min(0).max(1),
        g: z.number().min(0).max(1),
        b: z.number().min(0).max(1),
        a: z.number().min(0).max(1).optional()
      }).optional(),
      fontSize: z.number().min(1).max(200).optional(),
      fontWeight: z.number().min(100).max(1000).optional(),
      cornerRadius: z.number().min(0).max(100).optional(),
      name: z.string().min(1).max(100).optional(),
      parentId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" }).optional(),
      // Batch support
      buttons: z.array(z.object({
        x: z.number().min(-10000).max(10000),
        y: z.number().min(-10000).max(10000),
        width: z.number().min(1).max(2000).optional(),
        height: z.number().min(1).max(2000).optional(),
        text: z.string().min(1).max(200).optional(),
        background: z.object({
          r: z.number().min(0).max(1),
          g: z.number().min(0).max(1),
          b: z.number().min(0).max(1),
          a: z.number().min(0).max(1).optional()
        }).optional(),
        textColor: z.object({
          r: z.number().min(0).max(1),
          g: z.number().min(0).max(1),
          b: z.number().min(0).max(1),
          a: z.number().min(0).max(1).optional()
        }).optional(),
        fontSize: z.number().min(1).max(200).optional(),
        fontWeight: z.number().min(100).max(1000).optional(),
        cornerRadius: z.number().min(0).max(100).optional(),
        name: z.string().min(1).max(100).optional(),
        parentId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" }).optional(),
      })).optional()
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
        // Batch support: if args.buttons exists, treat as batch
        if (Array.isArray(args.buttons)) {
          const results = [];
          for (const btn of args.buttons) {
            const params = {
              x: btn.x,
              y: btn.y,
              width: btn.width,
              height: btn.height,
              text: btn.text,
              style: {
                background: btn.background,
                text: btn.textColor,
                fontSize: btn.fontSize,
                fontWeight: btn.fontWeight,
                cornerRadius: btn.cornerRadius
              },
              name: btn.name,
              parentId: btn.parentId
            };
            const result = await figmaClient.executeCommand(MCP_COMMANDS.CREATE_BUTTON, params);
            results.push({
              type: "text",
              text: `Created button with frame ID: ${result.frameId}, background ID: ${result.backgroundId}, text ID: ${result.textId}`,
              _meta: {
                frameId: result.frameId,
                backgroundId: result.backgroundId,
                textId: result.textId
              }
            });
          }
          return { content: results };
        } else {
          // Single button
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
          const result = await figmaClient.executeCommand(MCP_COMMANDS.CREATE_BUTTON, params);
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
        }
      } catch (err) {
        return handleToolError(err, "component-creation-tools", "create_button") as any;
      }
    }
  );
}
