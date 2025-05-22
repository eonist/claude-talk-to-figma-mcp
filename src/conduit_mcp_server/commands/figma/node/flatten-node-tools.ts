import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers flatten node commands on the MCP server.
 *
 * This function adds tools named "flatten_node" and "flatten_nodes" to the MCP server,
 * enabling flattening of single or multiple nodes in Figma. It validates inputs,
 * executes corresponding Figma commands, and returns informative results.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerFlattenNodeTools(server, figmaClient);
 */
export function registerFlattenNodeTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.FLATTEN_NODE,
    `Flatten one or more nodes in Figma, or the current selection, merging all child vector layers and shapes into a single vector layer.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the results for each node.
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("ID of the node to flatten. Must be a Frame, Group, or node that supports flattening.")
        .optional(),
      nodeIds: z.array(
        z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
      )
      .min(1)
      .max(100)
      .describe("Array of Figma node IDs to flatten. Must contain 1 to 100 items.")
      .optional(),
      selection: z.boolean().optional()
    },
    {
      title: "Flatten Nodes (Unified)",
      idempotentHint: false,
      destructiveHint: true,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456" },
        { nodeIds: ["123:456", "789:101"] },
        { selection: true }
      ]),
      edgeCaseWarnings: [
        "Flattening is destructive and cannot be undone.",
        "All child layers are merged into a single vector.",
        "Only nodes that support flattening (Frame, Group, etc.) are valid.",
        "If 'selection' is true, nodeId/nodeIds are ignored."
      ],
      extraInfo: "Flattening is useful for export, performance, and simplification."
    },
    async (args, extra) => {
      let ids = [];
      if (args.selection) {
        // Get selected node IDs from Figma via the client
        const selectionResult = await figmaClient.executeCommand(MCP_COMMANDS.GET_SELECTION, {});
        if (
          selectionResult &&
          Array.isArray(selectionResult.nodeIds) &&
          selectionResult.nodeIds.length > 0
        ) {
          ids = selectionResult.nodeIds.map(ensureNodeIdIsString);
        } else {
          const response = {
            success: false,
            error: {
              message: "No nodes selected.",
              results: [],
              meta: {
                operation: "flatten_node",
                params: args
              }
            }
          };
          return { content: [{ type: "text", text: JSON.stringify(response) }] };
        }
      } else if (Array.isArray(args.nodeIds)) {
        ids = args.nodeIds.map(ensureNodeIdIsString);
      } else if (args.nodeId) {
        ids = [ensureNodeIdIsString(args.nodeId)];
      } else {
        const response = {
          success: false,
          error: {
            message: "You must provide 'nodeId', 'nodeIds', or 'selection: true'.",
            results: [],
            meta: {
              operation: "flatten_node",
              params: args
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
      // Flatten all nodes
      try {
        const result = await figmaClient.flattenNode({ nodeIds: ids });
        const results = [];
        if (result && Array.isArray(result.results)) {
          for (let i = 0; i < ids.length; i++) {
            const r = result.results[i];
            if (r && r.error) {
              results.push({
                nodeId: ids[i],
                success: false,
                error: r.error,
                meta: {
                  operation: "flatten_node",
                  params: { nodeId: ids[i] }
                }
              });
            } else {
              results.push({
                nodeId: ids[i],
                success: true
              });
            }
          }
        } else {
          // Fallback: treat as all success if no per-node results
          for (const id of ids) {
            results.push({ nodeId: id, success: true });
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
              message: "All flatten_node operations failed",
              results,
              meta: {
                operation: "flatten_node",
                params: args
              }
            }
          };
        }
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      } catch (error) {
        const response = {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
            results: [],
            meta: {
              operation: "flatten_node",
              params: args
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
    }
  );
}
