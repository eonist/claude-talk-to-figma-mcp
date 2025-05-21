import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { FontFamilyStyleSchema, FontSizeSchema, FontWeightSchema } from "./font-schema.js";
import { MCP_COMMANDS } from "../../../../types/commands.js";

/**
 * Registers property-manipulation-related modify commands on the MCP server.
 *
 * This function adds tools for setting font properties and loading fonts asynchronously in Figma.
 * It includes commands for setting font name, size, weight, letter spacing, line height,
 * paragraph spacing, text case, text decoration, and loading fonts.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerFontTools(server, figmaClient);
 */
export function registerFontTools(server: McpServer, figmaClient: FigmaClient) {

  // Load Font Async
  server.tool(
    MCP_COMMANDS.LOAD_FONT_ASYNC,
    `Load a font asynchronously in Figma.

Returns:
  - content: Array containing a text message with the loaded font.
    Example: { "content": [{ "type": "text", "text": "Font loaded: Roboto" }] }
`,
    {
      ...FontFamilyStyleSchema.shape,
    },
    async ({ family, style }) => {
      try {
        await figmaClient.executeCommand(MCP_COMMANDS.LOAD_FONT_ASYNC, { family, style });
        const response = { success: true, results: [{ family, style, loaded: true }] };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      } catch (error) {
        const response = {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
            results: [],
            meta: {
              operation: "load_font_async",
              params: { family, style }
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
    }
  );
}
