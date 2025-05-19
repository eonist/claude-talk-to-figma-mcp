import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { NodeIdsArraySchema } from "./node-ids-schema.js";
import { MCP_COMMANDS } from "../../../../types/commands.js";

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
  // Group or Ungroup Nodes (merged command)
  server.tool(
    MCP_COMMANDS.GROUP_OR_UNGROUP_NODES,
    `Groups or ungroups nodes in Figma, depending on the 'group' flag.

Parameters:
  - group (boolean, required): If true, groups nodes; if false, ungroups a group node.
  - nodeIds (array of string, min 2, required if grouping): The nodes to group.
  - name (string, optional): Name for the group (only if grouping).
  - nodeId (string, required if ungrouping): The group node to ungroup.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the result.
`,
    {
      group: z.boolean().describe("If true, group nodes; if false, ungroup a group node."),
      nodeIds: NodeIdsArraySchema(2, 100).optional(),
      name: z.string()
        .min(1)
        .max(100)
        .optional()
        .describe("Optional. Name for the group. If provided, must be a non-empty string up to 100 characters."),
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .optional()
        .describe("The unique Figma group node ID to ungroup. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
    },
    {
      title: "Group or Ungroup Nodes",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { group: true, nodeIds: ["123:456", "789:101"], name: "My Group" },
        { group: false, nodeId: "123:456" }
      ]),
      edgeCaseWarnings: [
        "If grouping, all nodeIds must be valid and belong to the same parent.",
        "Grouping nodes changes their z-order and parent.",
        "Name is optional but must be non-empty if provided.",
        "If ungrouping, only group nodes can be ungrouped.",
        "Ungrouping releases all children to the parent.",
        "nodeId must be a valid group node."
      ],
      extraInfo: "Grouping is useful for organizing layers and applying transformations collectively. Ungrouping is useful for breaking apart grouped elements for individual editing."
    },
    async ({ group, nodeIds, name, nodeId }) => {
      if (group) {
        if (!nodeIds || nodeIds.length < 2) {
          throw new Error("When grouping, 'nodeIds' (min 2) is required.");
        }
        const ids = nodeIds.map(ensureNodeIdIsString);
        const result = await figmaClient.executeCommand(MCP_COMMANDS.GROUP_OR_UNGROUP_NODES, { nodeIds: ids, name });
        return {
          content: [{
            type: "text",
            text: `Grouped ${ids.length} nodes into "${result.name}" (ID: ${result.id})`
          }]
        };
      } else {
        if (!nodeId) {
          throw new Error("When ungrouping, 'nodeId' is required.");
        }
        const id = ensureNodeIdIsString(nodeId);
        const result = await figmaClient.executeCommand(MCP_COMMANDS.GROUP_OR_UNGROUP_NODES, { nodeId: id });
        return {
          content: [{
            type: "text",
            text: `Ungrouped node ${id}, released ${result.ungroupedCount} children.`
          }]
        };
      }
    }
  );
}
