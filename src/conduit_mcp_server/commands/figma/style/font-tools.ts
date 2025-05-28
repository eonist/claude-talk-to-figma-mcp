import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
// import { z } from "zod";
// import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
// import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
import { FontFamilyStyleSchema, FontSizeSchema, FontWeightSchema } from "./schema/font-schema.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers font-related commands on the MCP server.
 * 
 * This module provides tools for font management in Figma, including asynchronous font loading
 * to ensure fonts are available before applying text styles.
 * 
 * Registered commands:
 * - `load_font_async`: Loads a font family and style asynchronously
 * 
 * @param {McpServer} server - The MCP server instance to register the tools on
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API
 * @returns {void}
 * 
 * @example
 * ```
 * registerFontTools(server, figmaClient);
 * // Now you can use: load_font_async command
 * await figmaClient.executeCommand('load_font_async', { family: 'Roboto', style: 'Regular' });
 * ```
 * 
 * @throws {Error} When font family or style is invalid or unavailable
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
