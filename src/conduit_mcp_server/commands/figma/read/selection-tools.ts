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

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the selection info as JSON.

Annotations:
  - title: "Get Selection"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: true
  - openWorldHint: false

---
Usage Example:
  Input: {}
  Output:
    {
      "content": [{ "type": "text", "text": "{...selection info...}" }]
    }
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
