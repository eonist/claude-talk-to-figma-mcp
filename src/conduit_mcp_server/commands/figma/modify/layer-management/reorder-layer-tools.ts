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
  // Single node reorder
  server.tool(
    "reorder_node",
    `Reorders a single node in its parent's children array. Supports direction ('up', 'down', 'front', 'back') or absolute index.

Input:
  - nodeId: The ID of the node to reorder.
  - direction: (optional) 'up' | 'down' | 'front' | 'back'
  - index: (optional) Absolute index to move the node to (overrides direction if provided).

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the nodeId and newIndex.
`,
    {
      nodeId: z.string().describe("The ID of the node to reorder."),
      direction: z.enum(["up", "down", "front", "back"]).optional(),
      index: z.number().int().optional()
    },
    {
      title: "Reorder Node",
      idempotentHint: false,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456", direction: "up" },
        { nodeId: "123:456", direction: "down" },
        { nodeId: "123:456", direction: "front" },
        { nodeId: "123:456", direction: "back" },
        { nodeId: "123:456", index: 2 }
      ]),
      edgeCaseWarnings: [
        "Index out of bounds will throw an error.",
        "Node must have a valid parent with children array."
      ],
      extraInfo: "Reordering is useful for changing the stacking order of layers."
    },
    async (args) => {
      try {
        const result = await figmaClient.executeCommand("reorder_node", args);
        return {
          content: [{
            type: "text",
            text: `Reordered node ${args.nodeId} to index ${result.newIndex}`
          }]
        };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }] };
      }
    }
  );

  // Batch node reorder
  server.tool(
    "reorder_nodes",
    `Batch reorders multiple nodes in their respective parents' children arrays. Each reorder config supports direction or absolute index.

Input:
  - reorders: Array of reorder configs ({nodeId, direction?, index?}).
  - options: (optional) { skip_errors?: boolean }

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the results and any errors.
`,
    {
      reorders: z.array(z.object({
        nodeId: z.string().describe("The ID of the node to reorder."),
        direction: z.enum(["up", "down", "front", "back"]).optional(),
        index: z.number().int().optional()
      })),
      options: z.object({
        skip_errors: z.boolean().optional()
      }).optional()
    },
    {
      title: "Batch Reorder Nodes",
      idempotentHint: false,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { reorders: [{ nodeId: "123:456", direction: "up" }, { nodeId: "789:101", index: 1 }] },
        { reorders: [{ nodeId: "123:456", direction: "front" }], options: { skip_errors: true } }
      ]),
      edgeCaseWarnings: [
        "Index out of bounds will throw an error unless skip_errors is set.",
        "Each node must have a valid parent with children array."
      ],
      extraInfo: "Batch reordering is useful for complex layer management."
    },
    async (args) => {
      try {
        const result = await figmaClient.executeCommand("reorder_nodes", args);
        return {
          content: [{
            type: "text",
            text: `Batch reorder complete. Results: ${JSON.stringify(result.results)}${result.errors ? " Errors: " + result.errors.join("; ") : ""}`
          }]
        };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }] };
      }
    }
  );
}
