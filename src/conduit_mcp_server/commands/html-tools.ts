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
    "generate_html",
    `Generates HTML structure from Figma nodes.

Parameters:
  - nodeId (string, required): The ID of the Figma node to generate HTML from.
  - format (string, optional): HTML output format ("semantic", "div-based", "webcomponent"). Defaults to "semantic".
  - cssMode (string, optional): CSS handling mode ("inline", "classes", "external"). Defaults to "classes".

Returns:
  - content: Array containing a text message with the generated HTML string.
    Example: { "content": [{ "type": "text", "text": "<div>...</div>" }] }

Annotations:
  - title: "Generate HTML"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: true
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "format": "semantic",
      "cssMode": "classes"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "<main>...</main>" }]
    }

Additional Usage Example:
  Input:
    {
      "nodeId": "789:1011",
      "format": "webcomponent",
      "cssMode": "inline"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "<my-component>...</my-component>" }]
    }

Error Handling:
  - Returns an error message if nodeId is invalid or not found.
  - Returns an error if format or cssMode is not one of the allowed values.

Security Notes:
  - All inputs are validated and sanitized. nodeId must match the expected format.
  - Only allowed formats and CSS modes are accepted.

Output Schema:
  {
    "content": [
      {
        "type": "text",
        "text": "<html string>"
      }
    ]
  }
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
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
