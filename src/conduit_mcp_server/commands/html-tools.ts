import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../clients/figma-client.js";
import { isValidNodeId } from "../utils/figma/is-valid-node-id.js";

/**
 * Registers HTML generation commands for the MCP server.
 *
 * @param server - The MCP server instance
 * @param figmaClient - The Figma client instance
 */
export function registerHtmlCommands(server: McpServer, figmaClient: FigmaClient): void {
  server.tool(
    "generate_html",
    `Generates HTML structure from Figma nodes.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the generated HTML string.
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to generate HTML from. Must be a string in the format '123:456'."),
      // Restrict format to allowed HTML output types
      format: z
        .enum(["semantic", "div-based", "webcomponent"])
        .default("semantic")
        .describe('Optional. The HTML output format: "semantic", "div-based", or "webcomponent". Defaults to "semantic".'),
      // Restrict cssMode to allowed CSS handling modes
      cssMode: z
        .enum(["inline", "classes", "external"])
        .default("classes")
        .describe('Optional. The CSS handling mode: "inline", "classes", or "external". Defaults to "classes".'),
    },
    {
      title: "Generate HTML",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false
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
