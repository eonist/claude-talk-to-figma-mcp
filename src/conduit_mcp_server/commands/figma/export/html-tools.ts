import { z } from "zod";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { GenerateHtmlSchema } from "./schema/html-schema.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";

export function registerHtmlCommands(server: McpServer, figmaClient: FigmaClient): void {
  server.tool(
    MCP_COMMANDS.GET_HTML,
    `Generates HTML structure from Figma nodes.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the generated HTML string.
`,
    GenerateHtmlSchema.shape,
    {
      title: "Generate HTML",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false
    },
    async (args: any) => {
      try {
        const result = await figmaClient.executeCommand(MCP_COMMANDS.GET_HTML, {
          nodeId: args.nodeId,
          format: args.format,
          cssMode: args.cssMode,
        });
        const response = { success: true, results: [{ html: result }] };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response),
            },
          ],
        };
      } catch (error: any) {
        const response = {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
            results: [],
            meta: {
              operation: "get_html",
              params: args
            }
          }
        };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response),
            },
          ],
        };
      }
    }
  );
}
