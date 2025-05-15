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
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456" }
      ]),
      edgeCaseWarnings: [
        "Cloning a node duplicates all its children.",
        "Cloned nodes may overlap with originals if no position/offset is specified.",
        "Ensure nodeId is valid to avoid errors."
      ],
      extraInfo: "Cloning is useful for duplicating components or layouts. Adjust positions to avoid overlap."
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
    `Clone multiple nodes in Figma by node IDs, with optional positions, offsets, and parent.

Parameters:
  - nodeIds: Array of node IDs to clone.
  - positions (optional): Array of {x, y} positions for each clone.
  - offsetX, offsetY (optional): Uniform X/Y offset for all clones.
  - parentId (optional): Parent node to place clones in.

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
      positions: z.array(
        z.object({
          x: z.number(),
          y: z.number()
        })
      ).optional().describe("Optional array of positions for each clone."),
      offsetX: z.number().optional().describe("Optional uniform X offset for all clones."),
      offsetY: z.number().optional().describe("Optional uniform Y offset for all clones."),
      parentId: z.string().optional().describe("Optional parent node ID to place clones in."),
    },
    {
      title: "Clone Nodes (Batch)",
      idempotentHint: false,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeIds: ["123:456", "789:101"], offsetX: 100, offsetY: 0 }
      ]),
      edgeCaseWarnings: [
        "All nodeIds must be valid to avoid partial failures.",
        "If positions/offsets are not set, clones may overlap originals.",
        "Batch cloning large numbers of nodes may impact performance."
      ],
      extraInfo: "Batch cloning is efficient for duplicating multiple elements. Use offsets or positions for layout control."
    },
    async ({ nodeIds, positions, offsetX, offsetY, parentId }) => {
      const ids = nodeIds.map(ensureNodeIdIsString);
      const params: any = { nodeIds: ids };
      if (positions) params.positions = positions;
      if (offsetX !== undefined) params.offsetX = offsetX;
      if (offsetY !== undefined) params.offsetY = offsetY;
      if (parentId) params.parentId = parentId;
      const result = await figmaClient.executeCommand("clone_nodes", params);
      return {
        content: [{
          type: "text",
          text: `Cloned ${ids.length} nodes. New node IDs: ${result.newNodeIds ? result.newNodeIds.join(", ") : "(unknown)"}`
        }]
      };
    }
  );
}
