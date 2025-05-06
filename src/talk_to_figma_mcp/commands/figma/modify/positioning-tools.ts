import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";

/**
 * Registers positioning-related modify commands:
 * - move_node
 * - move_nodes
 */
export function registerPositioningCommands(server: McpServer, figmaClient: FigmaClient) {
  // Move Node Tool
  server.tool(
    "move_node",
    "Move a node to a new position in Figma",
    {
      nodeId: z.string().describe("The ID of the node to move"),
      x: z.number().describe("New X position"),
      y: z.number().describe("New Y position"),
    },
    async ({ nodeId, x, y }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.moveNode({ nodeId: id, x, y });
      return { content: [{ type: "text", text: `Moved ${id} to (${x},${y})` }] };
    }
  );

  // Move Multiple Nodes Tool
  server.tool(
    "move_nodes",
    "Move multiple nodes to a new absolute position in Figma",
    {
      nodeIds: z.array(z.string()).describe("Array of node IDs to move"),
      x: z.number().describe("New X position"),
      y: z.number().describe("New Y position"),
    },
    async ({ nodeIds, x, y }) => {
      const ids = nodeIds.map(ensureNodeIdIsString);
      await figmaClient.moveNodes({ nodeIds: ids, x, y });
      return { content: [{ type: "text", text: `Moved ${ids.length} nodes to (${x},${y})` }] };
    }
  );
}
