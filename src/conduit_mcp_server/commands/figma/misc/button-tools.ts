import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { CreateButtonSchema } from "./schema/button-schema.js";
import { handleToolError } from "../../../utils/error-handling.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

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
    CreateButtonSchema.shape,
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
            try {
              const result = await figmaClient.executeCommand(MCP_COMMANDS.CREATE_BUTTON, params);
              results.push({
                frameId: result.frameId,
                backgroundId: result.backgroundId,
                textId: result.textId,
                success: true
              });
            } catch (err) {
              results.push({
                success: false,
                error: err?.message || String(err),
                meta: {
                  operation: "create_button",
                  params
                }
              });
            }
          }
          const anySuccess = results.some(r => r.success);
          let response;
          if (anySuccess) {
            response = { success: true, results };
          } else {
            response = {
              success: false,
              error: {
                message: "All create_button operations failed",
                results,
                meta: {
                  operation: "create_button",
                  params: args.buttons
                }
              }
            };
          }
          return { content: [{ type: "text", text: JSON.stringify(response) }] };
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
          try {
            const result = await figmaClient.executeCommand(MCP_COMMANDS.CREATE_BUTTON, params);
            const response = {
              success: true,
              results: [{
                frameId: result.frameId,
                backgroundId: result.backgroundId,
                textId: result.textId
              }]
            };
            return { content: [{ type: "text", text: JSON.stringify(response) }] };
          } catch (err) {
            const response = {
              success: false,
              error: {
                message: err?.message || String(err),
                results: [],
                meta: {
                  operation: "create_button",
                  params
                }
              }
            };
            return { content: [{ type: "text", text: JSON.stringify(response) }] };
          }
        }
      } catch (err) {
        const response = {
          success: false,
          error: {
            message: err?.message || String(err),
            results: [],
            meta: {
              operation: "create_button",
              params: args
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
    }
  );
}
