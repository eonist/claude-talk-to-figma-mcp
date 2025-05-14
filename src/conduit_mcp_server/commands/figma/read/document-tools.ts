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
  - content: Array of objects. Each object contains a type: "text" and a text field with the document info as JSON.

Annotations:
  - title: "Get Document Info"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: true
  - openWorldHint: false

---
Usage Example:
  Input: {}
  Output:
    {
      "content": [{ "type": "text", "text": "{...document info...}" }]
    }
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
