import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";

/**
 * Registers style info read command:
 * - get_styles
 */
export function registerStyleTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "get_styles",
    `Get all styles from the current Figma document.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the styles info as JSON.

Annotations:
  - title: "Get Styles"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: true
  - openWorldHint: false

---
Usage Example:
  Input: {}
  Output:
    {
      "content": [{ "type": "text", "text": "{...styles info...}" }]
    }
`,
    {},
    async () => {
      try {
        const result = await figmaClient.executeCommand("get_styles");
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
              text: `Error getting styles: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}
