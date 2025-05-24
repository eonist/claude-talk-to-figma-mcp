import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers reorder layer commands on the MCP server.
 *
 * This function adds the unified "reorder_node" tool to the MCP server,
 * enabling reordering of single or multiple nodes in Figma. It validates inputs,
 * executes corresponding Figma commands, and returns informative results.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 */
export function registerReorderLayerTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified reorder_node tool (single or batch)
  server.tool(
    MCP_COMMANDS.REORDER_NODE,
    `Reorders one or more nodes in their parents' children arrays. Accepts either a single reorder config (via 'reorder') or an array of configs (via 'reorders'). Optionally, you can provide options such as skip_errors.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the results and any errors.
`,
    {
      reorder: z.object({
        nodeId: z.string().describe("The ID of the node to reorder."),
        direction: z.enum(["up", "down", "front", "back"])
          .optional()
          .describe("The direction to move the node: 'up', 'down', 'front', or 'back'. Optional."),
        index: z.number().int()
          .optional()
          .describe("The new index to move the node to (0-based). Optional."),
      })
        .describe("A single reorder configuration object. Each object should include nodeId and optional direction or index.")
        .optional(),
      reorders: z.array(z.object({
        nodeId: z.string().describe("The ID of the node to reorder."),
        direction: z.enum(["up", "down", "front", "back"])
          .optional()
          .describe("The direction to move the node: 'up', 'down', 'front', or 'back'. Optional."),
        index: z.number().int()
          .optional()
          .describe("The new index to move the node to (0-based). Optional."),
      }))
        .describe("An array of reorder configuration objects. Each object should include nodeId and optional direction or index.")
        .optional(),
      options: z.object({
        skip_errors: z.boolean()
          .optional()
          .describe("If true, skip errors and continue processing remaining operations in batch mode.")
      })
      .optional()
      .describe("Options for the operation (e.g., skip_errors). Optional.")
    },
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
        const results = [];
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
