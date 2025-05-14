import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";

/**
 * Registers component info read commands:
 * - get_local_components
 * - get_remote_components
 */
export function registerComponentTools(server: McpServer, figmaClient: FigmaClient) {
  // Get Local Components
  server.tool(
    "get_local_components",
    `Get all local components from the Figma document.

Parameters:
  (none)

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the local components info as JSON.

Annotations:
  - title: "Get Local Components"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: true
  - openWorldHint: false

---
Usage Example:
  Input: {}
  Output:
    {
      "content": [{ "type": "text", "text": "{...local components info...}" }]
    }
`,
    {},
    async () => {
      try {
        const result = await figmaClient.executeCommand("get_local_components");
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
              text: `Error getting local components: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Get Remote Components
  server.tool(
    "get_remote_components",
    `Get available components from team libraries in Figma.

Parameters:
  (none)

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the remote components info as JSON.

Annotations:
  - title: "Get Remote Components"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: true
  - openWorldHint: false

---
Usage Example:
  Input: {}
  Output:
    {
      "content": [{ "type": "text", "text": "{...remote components info...}" }]
    }
`,
    {},
    async () => {
      try {
        const result = await figmaClient.executeCommand("get_remote_components");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting remote components: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );
}
