import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";

/**
 * Registers document info read command:
 * - get_document_info
 */
export function registerDocumentTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "get_document_info",
    `Get detailed information about the current Figma document.

Parameters:
  (none)

Returns:
  - content: Array containing a text message with the document info as JSON.
`,
    {},
    async () => {
      try {
        const result = await figmaClient.executeCommand("get_document_info");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting document info: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}
