import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers delete node command:
 * - delete_node
 */
export function registerDeleteTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "delete_node",
    `Delete a node in Figma.`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID." }),
    },
    async ({ nodeId }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("delete_node", { nodeId: id });
      return { content: [{ type: "text", text: `Deleted node ${id}` }] };
    }
  );
}
