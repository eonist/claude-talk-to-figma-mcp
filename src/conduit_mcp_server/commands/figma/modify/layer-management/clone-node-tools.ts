import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers the clone_node and clone_nodes commands for duplicating nodes in Figma.
 *
 * - clone_node: Clones a single node by ID.
 * - clone_nodes: Clones multiple nodes by ID.
 *
 * Cloning creates a duplicate of the node(s) at the same position in the Figma document.
 */
export function registerCloneNodeTools(server: McpServer, figmaClient: FigmaClient) {
  // Single node clone
  server.tool(
    "clone_node",
    `Clone a single node in Figma by node ID.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the new node's ID.
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("ID of the node to clone."),
    },
    {
      title: "Clone Node",
      idempotentHint: false,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false
    },
    async ({ nodeId }) => {
      const id = ensureNodeIdIsString(nodeId);
      const result = await figmaClient.executeCommand("clone_node", { nodeId: id });
      return {
        content: [{
          type: "text",
          text: `Cloned node ${id} to new node ${result.newNodeId ?? "(unknown)"}`
        }]
      };
    }
  );

  // Batch node clone
  server.tool(
    "clone_nodes",
    `Clone multiple nodes in Figma by node IDs.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the new node IDs.
`,
    {
      nodeIds: z.array(
        z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .describe("A Figma node ID to clone.")
      )
      .min(1)
      .max(100)
      .describe("Array of Figma node IDs to clone. Must contain 1 to 100 items."),
    },
    {
      title: "Clone Nodes (Batch)",
      idempotentHint: false,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false
    },
    async ({ nodeIds }) => {
      const ids = nodeIds.map(ensureNodeIdIsString);
      const result = await figmaClient.executeCommand("clone_nodes", { nodeIds: ids });
      return {
        content: [{
          type: "text",
          text: `Cloned ${ids.length} nodes. New node IDs: ${result.newNodeIds ? result.newNodeIds.join(", ") : "(unknown)"}`
        }]
      };
    }
  );
}
