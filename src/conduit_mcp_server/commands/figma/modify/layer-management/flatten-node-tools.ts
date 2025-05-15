import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers the flatten_node command for flattening a single node in Figma.
 *
 * The "flatten_node" command merges all child vector layers and shapes within a given node into a single vector layer.
 * This operation is commonly used to reduce complexity, optimize performance, or prepare artwork for export.
 * Flattening is destructive: after flattening, the original child layers are replaced by a single merged vector.
 *
 * Parameters:
 *   - nodeId (string): The Figma node ID to flatten. Must be a valid node that supports flattening (e.g., a Frame, Group, or selection of vector shapes).
 *
 * Returns:
 *   - content: Array of objects. Each object contains a type: "text" and a text field with the node ID and success status.
 *
 * Example use case:
 *   - Flatten a group of shapes into a single vector before exporting as SVG or PNG.
 *   - Simplify a complex group to make editing or sharing easier.
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
      openWorldHint: false
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
      openWorldHint: false
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
