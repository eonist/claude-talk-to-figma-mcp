import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";

/**
 * Registers layer-management-related modify commands:
 * - flatten_selection
 * - union_selection
 * - subtract_selection
 * - intersect_selection
 * - exclude_selection
 * - group_nodes
 * - ungroup_nodes
 */
export function registerLayerManagementCommands(server: McpServer, figmaClient: FigmaClient) {
  // Flatten Selection
  server.tool(
    "flatten_selection",
    "Flatten a selection of nodes in Figma",
    { nodeIds: z.array(z.string()) },
    async ({ nodeIds }) => {
      const ids = nodeIds.map(ensureNodeIdIsString);
      await figmaClient.executeCommand("flatten_selection", { nodeIds: ids });
      return { content: [{ type: "text", text: `Flattened ${ids.length} nodes` }] };
    }
  );

  // Boolean Operations
  server.tool(
    "union_selection",
    "Union selected shapes",
    { nodeIds: z.array(z.string()) },
    async ({ nodeIds }) => {
      await figmaClient.executeCommand("union_selection", { nodeIds });
      return { content: [{ type: "text", text: `Unioned ${nodeIds.length} nodes` }] };
    }
  );

  server.tool(
    "subtract_selection",
    "Subtract top shapes from bottom shape",
    { nodeIds: z.array(z.string()) },
    async ({ nodeIds }) => {
      await figmaClient.executeCommand("subtract_selection", { nodeIds });
      return { content: [{ type: "text", text: `Subtracted ${nodeIds.length} nodes` }] };
    }
  );

  server.tool(
    "intersect_selection",
    "Intersect selected shapes",
    { nodeIds: z.array(z.string()) },
    async ({ nodeIds }) => {
      await figmaClient.executeCommand("intersect_selection", { nodeIds });
      return { content: [{ type: "text", text: `Intersected ${nodeIds.length} nodes` }] };
    }
  );

  server.tool(
    "exclude_selection",
    "Exclude overlapping areas of selected shapes",
    { nodeIds: z.array(z.string()) },
    async ({ nodeIds }) => {
      await figmaClient.executeCommand("exclude_selection", { nodeIds });
      return { content: [{ type: "text", text: `Excluded ${nodeIds.length} nodes` }] };
    }
  );

  // Group Nodes
  server.tool(
    "group_nodes",
    "Group nodes in Figma",
    {
      nodeIds: z.array(z.string()),
      name: z.string().optional(),
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
    "Ungroup a group node in Figma",
    { nodeId: z.string() },
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
  
  // Delete single node
  server.tool(
    "delete_node",
    "Delete a node in Figma",
    { nodeId: z.string() },
    async ({ nodeId }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("delete_node", { nodeId: id });
      return { content: [{ type: "text", text: `Deleted node ${id}` }] };
    }
  );
}
