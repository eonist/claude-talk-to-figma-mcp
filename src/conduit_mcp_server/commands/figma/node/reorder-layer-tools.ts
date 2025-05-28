import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { ReorderSchema } from "./schema/reorder-layer-schema.js";

/**
 * Registers layer reordering tools on the MCP server for managing node z-order and stacking positions.
 * 
 * This function adds a comprehensive tool for changing the stacking order of nodes within their 
 * parent containers. It supports directional movements (up, down, front, back), specific index 
 * positioning, and batch reordering operations with configurable error handling strategies for 
 * complex layer management and visual hierarchy adjustments.
 * 
 * @param {McpServer} server - The MCP server instance to register the reordering tools on
 * @param {FigmaClient} figmaClient - The Figma client instance for API communication
 * 
 * @returns {void} This function has no return value but registers the tools asynchronously
 * 
 * @throws {Error} Throws an error if nodes lack valid parents, index positions are out of bounds, or nodes are not found
 * 
 * @example
 * ```
 * // Move node up one position in layer order
 * const result = await reorderTool({
 *   reorder: { nodeId: "123:456", direction: "up" }
 * });
 * 
 * // Move node to front of all siblings
 * const result = await reorderTool({
 *   reorder: { nodeId: "123:456", direction: "front" }
 * });
 * 
 * // Set specific index position (zero-based)
 * const result = await reorderTool({
 *   reorder: { nodeId: "123:456", index: 2 }
 * });
 * 
 * // Batch reorder with error handling
 * const result = await reorderTool({
 *   reorders: [
 *     { nodeId: "123:456", direction: "front" },
 *     { nodeId: "789:101", direction: "back" },
 *     { nodeId: "abc:def", index: 1 }
 *   ],
 *   options: { skip_errors: true }
 * });
 * ```
 * 
 * @note Direction options include: "up" (move one position forward), "down" (move one position back), "front" (move to top), "back" (move to bottom)
 * @note Index-based positioning uses zero-based indexing within the parent's children array
 * @note skip_errors option allows batch operations to continue despite individual failures
 * @note Each node must have a valid parent container to be reordered
 * @warning Reordering affects visual stacking and may impact design layout and user interactions
 * @since 1.0.0
 * @see {@link https://www.figma.com/developers/api#reorder-node} Figma Reorder Node API
 */
export function registerReorderLayerTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified reorder_node tool (single or batch)
  server.tool(
    MCP_COMMANDS.REORDER_NODE,
    `Reorders one or more nodes in their parents' children arrays. Accepts either a single reorder config (via 'reorder') or an array of configs (via 'reorders'). Optionally, you can provide options such as skip_errors.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the results and any errors.
`,
    ReorderSchema.shape,
    {
      title: "Reorder Nodes",
      idempotentHint: false,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { reorder: { nodeId: "123:456", direction: "up" } },
        { reorders: [{ nodeId: "123:456", direction: "up" }, { nodeId: "789:101", index: 1 }] },
        { reorders: [{ nodeId: "123:456", direction: "front" }], options: { skip_errors: true } }
      ]),
      edgeCaseWarnings: [
        "Index out of bounds will throw an error unless skip_errors is set.",
        "Each node must have a valid parent with children array.",
        "You must provide either 'reorder' or 'reorders' as input."
      ],
      extraInfo: "Reordering is useful for changing the stacking order of layers, and batch reordering is useful for complex layer management."
    },
    async (args) => {
      let reordersArr;
      if (args.reorders) {
        reordersArr = args.reorders;
      } else if (args.reorder) {
        reordersArr = [args.reorder];
      } else {
        const response = {
          success: false,
          error: {
            message: "Error: You must provide either 'reorder' or 'reorders' as input.",
            results: [],
            meta: {
              operation: "reorder_node",
              params: args
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
      try {
        const result = await figmaClient.executeCommand(MCP_COMMANDS.REORDER_NODE, {
          reorders: reordersArr,
          options: args.options
        });
        const results: Array<{ nodeId: string; success: boolean; error?: any; meta?: any; newIndex?: number }> = [];
        if (result && Array.isArray(result.results)) {
          for (let i = 0; i < reordersArr.length; i++) {
            const r = result.results[i];
            if (r && r.error) {
              results.push({
                nodeId: reordersArr[i].nodeId,
                success: false,
                error: r.error,
                meta: {
                  operation: "reorder_node",
                  params: reordersArr[i]
                }
              });
            } else {
              results.push({
                nodeId: reordersArr[i].nodeId,
                newIndex: r && typeof r.newIndex !== "undefined" ? r.newIndex : undefined,
                success: true
              });
            }
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
              message: "All reorder_node operations failed",
              results,
              meta: {
                operation: "reorder_node",
                params: reordersArr
              }
            }
          };
        }
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      } catch (err) {
        const response = {
          success: false,
          error: {
            message: err instanceof Error ? err.message : String(err),
            results: [],
            meta: {
              operation: "reorder_node",
              params: args
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
    }
  );
}
