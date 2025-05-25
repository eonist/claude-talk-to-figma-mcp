import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { CloneNodeSchema } from "./schema/clone-node-schema.js";

/**
 * Registers clone node commands on the MCP server.
 *
 * This function adds tools named "clone_node" and "clone_nodes" to the MCP server,
 * enabling cloning of single or multiple nodes in Figma. It validates inputs,
 * executes corresponding Figma commands, and returns informative results.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerCloneNodeTools(server, figmaClient);
 */
export function registerCloneNodeTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified single/batch node clone
  server.tool(
    MCP_COMMANDS.DUPLICATE_NODE,
    `Clones one or more nodes in Figma. Accepts either a single node config (via 'node') or an array of configs (via 'nodes'). Optionally, you can specify positions, offsets, and parent.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the new node ID(s).
`,
    CloneNodeSchema.shape,
    async (args) => {
      let nodesArr;
      if (args.nodes) {
        nodesArr = args.nodes;
      } else if (args.node) {
        nodesArr = [args.node];
      } else {
        const response = {
          success: false,
          error: {
            message: "You must provide either 'node' or 'nodes' as input.",
            results: [],
            meta: {
              operation: "clone_node",
              params: args
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
      const results = [];
      for (const cfg of nodesArr) {
        try {
          const id = ensureNodeIdIsString(cfg.nodeId);
          const params: any = { nodeId: id };
          if (cfg.position) params.position = cfg.position;
          if (cfg.offsetX !== undefined) params.offsetX = cfg.offsetX;
          if (cfg.offsetY !== undefined) params.offsetY = cfg.offsetY;
          if (cfg.parentId) params.parentId = cfg.parentId;
          const result = await figmaClient.cloneNode(params);
          results.push({
            nodeId: id,
            newNodeId: result.newNodeId ?? "(unknown)",
            success: true
          });
        } catch (err) {
          results.push({
            nodeId: cfg.nodeId,
            success: false,
            error: err instanceof Error ? err.message : String(err),
            meta: {
              operation: "clone_node",
              params: cfg
            }
          });
        }
      }
      const anySuccess = results.some(r => r.success);
      let response;
      if (anySuccess) {
        response = { success: true, results };
      } else {
        response = {
          success: false,
          error: {
            message: "All clone_node operations failed",
            results,
            meta: {
              operation: "clone_node",
              params: nodesArr
            }
          }
        };
      }
      return { content: [{ type: "text", text: JSON.stringify(response) }] };
    }
  );
}
