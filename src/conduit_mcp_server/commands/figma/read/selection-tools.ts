import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";

/**
 * Registers selection info read command:
 * - get_selection
 */
export function registerSelectionTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "get_selection",
    `Get information about the current selection in Figma.

Parameters:
  (none)

Returns:
  - content: Array containing a text message with the selection info as JSON.
`,
    {},
    async () => {
      try {
        const result = await figmaClient.executeCommand("get_selection");
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
              text: `Error getting selection: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}
