import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { MCP_COMMANDS } from "../../../../types/commands.js";

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

Input:
  - nodeId: (optional) A single node ID to flatten.
  - nodeIds: (optional) An array of node IDs to flatten.
  - selection: (optional) If true, flattens all currently selected nodes.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the results for each node.

Examples:
  { "nodeId": "123:456" }
  { "nodeIds": ["123:456", "789:101"] }
  { "selection": true }
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
          return { content: [{ type: "text", text: "No nodes selected." }] };
        }
      } else if (Array.isArray(args.nodeIds)) {
        ids = args.nodeIds.map(ensureNodeIdIsString);
      } else if (args.nodeId) {
        ids = [ensureNodeIdIsString(args.nodeId)];
      } else {
        return { content: [{ type: "text", text: "You must provide 'nodeId', 'nodeIds', or 'selection: true'." }] };
      }
      // Flatten all nodes
      const result = await figmaClient.executeCommand(MCP_COMMANDS.FLATTEN_NODE, { nodeIds: ids });
      return {
        content: [{
          type: "text",
          text: `Flattened ${ids.length} node(s): ${ids.join(", ")} (success: ${result.success ?? true})`
        }]
      };
    }
  );
}
