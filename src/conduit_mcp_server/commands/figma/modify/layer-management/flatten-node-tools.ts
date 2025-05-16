import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

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
    "flatten_node",
    `Flatten a single node in Figma, merging all its child vector layers and shapes into a single vector layer.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the node ID and success status.
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("ID of the node to flatten. Must be a Frame, Group, or node that supports flattening."),
    },
    {
      title: "Flatten Node",
      idempotentHint: false,
      destructiveHint: true,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456" }
      ]),
      edgeCaseWarnings: [
        "Flattening is destructive and cannot be undone.",
        "All child layers are merged into a single vector.",
        "Only nodes that support flattening (Frame, Group, etc.) are valid."
      ],
      extraInfo: "Flattening is useful for export and performance, but removes layer structure."
    },
    async ({ nodeId }) => {
      const id = ensureNodeIdIsString(nodeId);
      const result = await figmaClient.executeCommand("flatten_node", { nodeId: id });
      return {
        content: [{
          type: "text",
          text: `Flattened node ${id} (success: ${result.success ?? true})`
        }]
      };
    }
  );
}

/**
 * Registers the flatten_nodes batch command for flattening multiple nodes in Figma.
 *
 * The "flatten_nodes" command merges all child vector layers and shapes within each given node into a single vector layer.
 * This operation is commonly used to reduce complexity, optimize performance, or prepare artwork for export.
 * Flattening is destructive: after flattening, the original child layers are replaced by a single merged vector.
 *
 * Parameters:
 *   - nodeIds (string[]): Array of Figma node IDs to flatten. Each must be a valid node that supports flattening (e.g., Frame, Group, or selection of vector shapes).
 *
 * Returns:
 *   - content: Array of objects. Each object contains a type: "text" and a text field with the number of nodes flattened and their IDs.
 *
 * Example use case:
 *   - Flatten multiple groups of shapes into single vectors before exporting as SVG or PNG.
 *   - Simplify multiple complex groups to make editing or sharing easier.
 */
export function registerFlattenNodesTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "flatten_nodes",
    `Flatten multiple nodes in Figma, merging all child vector layers and shapes within each node into a single vector layer.

This operation is destructive: after flattening, the original child layers are replaced by a single merged vector. 
Flattening is useful for reducing complexity, optimizing performance, or preparing artwork for export.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of nodes flattened and their IDs.

`,
    {
      nodeIds: z.array(
        z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .describe("A Figma node ID to flatten. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'.")
      )
      .min(1)
      .max(100)
      .describe("Array of Figma node IDs to flatten. Must contain 1 to 100 items."),
    },
    {
      title: "Flatten Nodes (Batch)",
      idempotentHint: false,
      destructiveHint: true,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeIds: ["123:456", "789:101"] }
      ]),
      edgeCaseWarnings: [
        "Batch flattening is destructive and cannot be undone.",
        "All child layers in each node are merged into single vectors.",
        "Only nodes that support flattening are valid."
      ],
      extraInfo: "Batch flattening is efficient for preparing multiple groups for export or simplification."
    },
    async ({ nodeIds }) => {
      const ids = nodeIds.map(ensureNodeIdIsString);
      const result = await figmaClient.executeCommand("flatten_nodes", { nodeIds: ids });
      return {
        content: [{
          type: "text",
          text: `Flattened ${ids.length} nodes: ${ids.join(", ")} (success: ${result.success ?? true})`
        }]
      };
    }
  );
}
