import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../clients/figma-client.js";

/**
 * Registers HTML generation commands for the MCP server.
 *
 * @param server - The MCP server instance
 * @param figmaClient - The Figma client instance
 */
export function registerHtmlCommands(server: McpServer, figmaClient: FigmaClient): void {
  server.tool(
    "generate_html_async",
    "Generates HTML structure from Figma nodes",
    {
      nodeId: z.string().describe("Target node ID"),
      format: z
        .enum(["semantic", "div-based", "webcomponent"])
        .default("semantic")
        .describe("HTML output format"),
      cssMode: z
        .enum(["inline", "classes", "external"])
        .default("classes")
        .describe("CSS handling mode"),
    },
    async ({ nodeId, format, cssMode }) => {
      try {
        const result = await figmaClient.executeCommand("generate_html", {
          nodeId,
          format,
          cssMode,
        });
        return {
          content: [
            {
              type: "text",
              text: result as string,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `HTML generation failed: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );
}
