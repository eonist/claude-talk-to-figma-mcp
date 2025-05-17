import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";

/**
 * Registers reorder layer commands on the MCP server.
 *
 * This function adds tools named "reorder_node" and "reorder_nodes" to the MCP server,
 * enabling reordering of single or multiple nodes in Figma. It validates inputs,
 * executes corresponding Figma commands, and returns informative results.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 */
export function registerReorderLayerTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified reorder_nodes tool (single or batch)
  server.tool(
    "reorder_nodes",
    `Reorders one or more nodes in their parents' children arrays. Accepts either a single reorder config (via 'reorder') or an array of configs (via 'reorders'). Optionally, you can provide options such as skip_errors.

Input:
  - reorder: A single reorder configuration object ({ nodeId, direction?, index? }).
  - reorders: An array of reorder configuration objects (same shape as above).
  - options: (optional) { skip_errors?: boolean }

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the results and any errors.
`,
    {
      reorder: z.object({
        nodeId: z.string().describe("The ID of the node to reorder."),
        direction: z.enum(["up", "down", "front", "back"]).optional(),
        index: z.number().int().optional()
      })
        .describe("A single reorder configuration object. Each object should include nodeId and optional direction or index.")
        .optional(),
      reorders: z.array(z.object({
        nodeId: z.string().describe("The ID of the node to reorder."),
        direction: z.enum(["up", "down", "front", "back"]).optional(),
        index: z.number().int().optional()
      }))
        .describe("An array of reorder configuration objects. Each object should include nodeId and optional direction or index.")
        .optional(),
      options: z.object({
        skip_errors: z.boolean().optional()
      }).optional()
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
        return { content: [{ type: "text", text: "Error: You must provide either 'reorder' or 'reorders' as input." }] };
      }
      try {
        const result = await figmaClient.executeCommand("reorder_nodes", {
          reorders: reordersArr,
          options: args.options
        });
        if (reordersArr.length === 1) {
          // Single result
          return {
            content: [{
              type: "text",
              text: `Reordered node ${reordersArr[0].nodeId}${result.results && result.results[0] && typeof result.results[0].newIndex !== "undefined" ? " to index " + result.results[0].newIndex : ""}${result.errors ? " Errors: " + result.errors.join("; ") : ""}`
            }]
          };
        } else {
          // Batch result
          return {
            content: [{
              type: "text",
              text: `Batch reorder complete. Results: ${JSON.stringify(result.results)}${result.errors ? " Errors: " + result.errors.join("; ") : ""}`
            }]
          };
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }] };
      }
    }
  );
}
