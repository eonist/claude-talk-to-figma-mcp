import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";

/**
 * Registers detach instance command:
 * - detach_instance
 */
export function registerDetachInstanceTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "detach_instance",
    `Detach a Figma component instance from its master.

Parameters:
  - instanceId (string, required): The ID of the instance to detach.

Returns:
  - content: Array containing a text message with the detached instance's ID.
    Example: { "content": [{ "type": "text", "text": "Detached instance 123:456" }] }
`,
    { instanceId: z.string() },
    async ({ instanceId }) => {
      const id = ensureNodeIdIsString(instanceId);
      const result = await figmaClient.executeCommand("detach_instance", { instanceId: id });
      return { content: [{ type: "text", text: `Detached instance ${result.id}` }] };
    }
  );
}
