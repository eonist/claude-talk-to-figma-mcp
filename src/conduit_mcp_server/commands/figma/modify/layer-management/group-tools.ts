import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers group/ungroup commands:
 * - group_nodes
 * - ungroup_nodes
 */
export function registerGroupTools(server: McpServer, figmaClient: FigmaClient) {
  // Group Nodes
  server.tool(
    "group_nodes",
    `Group nodes in Figma.`,
    {
      nodeIds: z.array(
        z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID." })
      ).min(2).max(100),
      name: z.string().min(1).max(100).optional(),
    },
    async ({ nodeIds, name }) => {
      const ids = nodeIds.map(ensureNodeIdIsString);
      const result = await figmaClient.executeCommand("group_nodes", { nodeIds: ids, name });
      return {
        content: [{
          type: "text",
          text: `Grouped ${ids.length} nodes into "${result.name}" (ID: ${result.id})`
        }]
      };
    }
  );

  // Ungroup Nodes
  server.tool(
    "ungroup_nodes",
    `Ungroup a group node in Figma.`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID." }),
    },
    async ({ nodeId }) => {
      const id = ensureNodeIdIsString(nodeId);
      const result = await figmaClient.executeCommand("ungroup_nodes", { nodeId: id });
      return {
        content: [{
          type: "text",
          text: `Ungrouped node ${id}, released ${result.ungroupedCount} children.`
        }]
      };
    }
  );
}
