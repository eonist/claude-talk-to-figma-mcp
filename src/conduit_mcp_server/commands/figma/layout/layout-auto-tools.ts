import { SetAutoLayoutParams } from "../../../types/command-params.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { CommandResult, MCP_COMMANDS } from "../../../types/commands.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * set_auto_layout: Applies auto-layout settings to one or more nodes.
 * Supports single or batch node modification.
 */
export async function set_auto_layout(
  client: FigmaClient,
  params: SetAutoLayoutParams
): Promise<CommandResult> {
  const { layout, layouts, options } = params;
  const configs = [];
  if (layout) configs.push(layout);
  if (layouts && Array.isArray(layouts)) configs.push(...layouts);

  if (configs.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify([
            { error: "At least one of layout or layouts is required." }
          ])
        }
      ]
    };
  }

  const results: any[] = [];
  for (const config of configs) {
    const { nodeId, mode, primaryAxisSizing, counterAxisSizing, itemSpacing, padding, alignItems } = config;
    try {
      const nodeInfo = await client.getNodeInfo(nodeId);
      if (!nodeInfo || !nodeInfo.node) {
        if (options?.skipErrors) {
          results.push({ nodeId, success: false, error: "Node not found" });
          continue;
        } else {
          throw new Error("Node not found");
        }
      }
      const node = nodeInfo.node;
      if (!["FRAME", "COMPONENT", "INSTANCE", "COMPONENT_SET"].includes(node.type)) {
        if (options?.skipErrors) {
          results.push({ nodeId, success: false, error: `Node type ${node.type} doesn't support auto-layout` });
          continue;
        } else {
          throw new Error(`Node type ${node.type} doesn't support auto-layout`);
        }
      }

      // Maintain original position if requested
      const originalPosition = { x: node.x, y: node.y };

      // Set layout mode first
      node.layoutMode = mode;

      // Set sizing modes
      if (primaryAxisSizing) node.primaryAxisSizingMode = primaryAxisSizing;
      if (counterAxisSizing) node.counterAxisSizingMode = counterAxisSizing;

      // Set spacing and padding
      if (typeof itemSpacing === "number") node.itemSpacing = itemSpacing;
      if (padding) {
        if (typeof padding.top === "number") node.paddingTop = padding.top;
        if (typeof padding.right === "number") node.paddingRight = padding.right;
        if (typeof padding.bottom === "number") node.paddingBottom = padding.bottom;
        if (typeof padding.left === "number") node.paddingLeft = padding.left;
      }

      // Set alignment
      if (alignItems) node.primaryAxisAlignItems = alignItems;

      // Maintain original position if requested
      if (options?.maintainPosition) {
        node.x = originalPosition.x;
        node.y = originalPosition.y;
      }

      results.push({ nodeId, success: true });
    } catch (error: any) {
      if (options?.skipErrors) {
        results.push({
          nodeId: config.nodeId,
          success: false,
          error: error && error.message ? error.message : String(error),
          meta: {
            operation: "set_auto_layout",
            params: { ...config }
          }
        });
        continue;
      } else {
        throw error;
      }
    }
  }

  const anySuccess = results.some(r => r.success);
  if (anySuccess) {
    return {
      success: true,
      results
    };
  } else {
    return {
      success: false,
      error: {
        message: "All auto-layout operations failed",
        results,
        meta: {
          operation: "set_auto_layout",
          params: configs
        }
      }
    };
  }
}

/**
 * Registers the set_auto_layout tool with the MCP server.
 */
export function registerLayoutAutoTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(MCP_COMMANDS.SET_AUTO_LAYOUT, async (params: SetAutoLayoutParams) =>
    set_auto_layout(figmaClient, params)
  );
}
