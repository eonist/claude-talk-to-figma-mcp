import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";

/**
 * Registers property-manipulation-related modify commands:
 * - detach_instance
 */
export function registerDetachInstanceTools(server: McpServer, figmaClient: FigmaClient) {
  // Detach Instance
  server.tool(
    "detach_instance",
    `Detach a Figma component instance from its master.

Parameters:
  - instanceId (string, required): The ID of the instance to detach.

Returns:
  - content: Array containing a text message with the detached instance's ID.
    Example: { "content": [{ "type": "text", "text": "Detached instance 123:456" }] }

Annotations:
  - title: "Detach Instance"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "instanceId": "123:456"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Detached instance 123:456" }]
    }
`,
    { instanceId: z.string() },
    async ({ instanceId }) => {
      const id = ensureNodeIdIsString(instanceId);
      const result = await figmaClient.executeCommand("detach_instance", { instanceId: id });
      return { content: [{ type: "text", text: `Detached instance ${result.id}` }] };
    }
  );
}
