import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
import { NodeIdsArraySchema } from "./node-ids-schema.js";

/**
 * Registers group and ungroup commands on the MCP server.
 *
 * This function adds tools named "group_nodes" and "ungroup_nodes" to the MCP server,
 * enabling grouping and ungrouping of nodes in Figma. It validates inputs, executes
 * corresponding Figma commands, and returns informative results.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerGroupTools(server, figmaClient);
 */
export function registerGroupTools(server: McpServer, figmaClient: FigmaClient) {
  // Group Nodes
  server.tool(
    "group_nodes",
    `Groups nodes in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the group name and ID.
`,
    {
      // Validate nodeIds as simple or complex Figma node IDs, preserving original description
      nodeIds: NodeIdsArraySchema(2, 100),
      // Enforce non-empty string for name if provided
      name: z.string()
        .min(1)
        .max(100)
        .optional()
        .describe("Optional. Name for the group. If provided, must be a non-empty string up to 100 characters."),
    },
    {
      title: "Group Nodes",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeIds: ["123:456", "789:101"], name: "My Group" }
      ]),
      edgeCaseWarnings: [
        "All nodeIds must be valid and belong to the same parent.",
        "Grouping nodes changes their z-order and parent.",
        "Name is optional but must be non-empty if provided."
      ],
      extraInfo: "Grouping is useful for organizing layers and applying transformations collectively."
    },
    async ({ nodeIds, name }) => {
      const ids = nodeIds.map(ensureNodeIdIsString);
      const result = await figmaClient.executeCommand("group_nodes", { nodeIds: ids, name });
      return {
        content: [{
          type: "text",
          text: `Grouped ${ids.length} nodes into "${result.name}" (ID: ${result.id})`
        }]
      };
    }
  );

  // Ungroup Nodes
  server.tool(
    "ungroup_nodes",
    `Ungroups a group node in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the ungrouped node's ID and number of children released.
`,
    {
      // Validate nodeId as simple or complex Figma node ID, preserving original description
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma group node ID to ungroup. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
    },
    {
      title: "Ungroup Nodes",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456" }
      ]),
      edgeCaseWarnings: [
        "Only group nodes can be ungrouped.",
        "Ungrouping releases all children to the parent.",
        "NodeId must be a valid group node."
      ],
      extraInfo: "Ungrouping is useful for breaking apart grouped elements for individual editing."
    },
    async ({ nodeId }) => {
      const id = ensureNodeIdIsString(nodeId);
      const result = await figmaClient.executeCommand("ungroup_nodes", { nodeId: id });
      return {
        content: [{
          type: "text",
          text: `Ungrouped node ${id}, released ${result.ungroupedCount} children.`
        }]
      };
    }
  );
}
