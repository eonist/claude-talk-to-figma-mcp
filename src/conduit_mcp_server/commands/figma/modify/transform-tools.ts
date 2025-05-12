import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";

/**
 * Registers transformation-related modify commands:
 * - resize_node
 * - resize_nodes
 * - (future: rotation, scaling, flipping)
 */
export function registerTransformCommands(server: McpServer, figmaClient: FigmaClient) {
  // Resize Node Tool
  server.tool(
    "resize_node",
    "Resize a node in Figma",
    {
      nodeId: z.string(),
      width: z.number().positive(),
      height: z.number().positive(),
    },
    async ({ nodeId, width, height }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.resizeNode({ nodeId: id, width, height });
      return { content: [{ type: "text", text: `Resized ${id} to ${width}x${height}` }] };
    }
  );

  // Resize Multiple Nodes Tool
  server.tool(
    "resize_nodes",
    "Resize multiple nodes in Figma",
    {
      nodeIds: z.array(z.string()),
      targetSize: z.object({ width: z.number().positive(), height: z.number().positive() }),
    },
    async ({ nodeIds, targetSize }) => {
      const ids = nodeIds.map(ensureNodeIdIsString);
      await figmaClient.executeCommand("resize_nodes", { nodeIds: ids, targetSize });
      return { content: [{ type: "text", text: `Resized ${ids.length} nodes` }] };
    }
  );
}
