import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers node-to-component conversion command:
 * - create_component_from_node
 */
export function registerNodeTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "create_component_from_node",
    `Convert an existing node into a component.

Parameters:
  - nodeId (string, required): The ID of the node to convert.

Returns:
  - content: Array containing a text message with the created component's ID.
    Example: { "content": [{ "type": "text", "text": "Created component 123:456" }] }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to convert. Must be a string in the format '123:456'."),
    },
    async ({ nodeId }) => {
      try {
        const id = ensureNodeIdIsString(nodeId);
        const result = await figmaClient.executeCommand("create_component_from_node", { nodeId: id });
        return { content: [{ type: "text", text: `Created component ${result.componentId}` }] };
      } catch (err) {
        return handleToolError(err, "component-creation-tools", "create_component_from_node") as any;
      }
    }
  );
}
