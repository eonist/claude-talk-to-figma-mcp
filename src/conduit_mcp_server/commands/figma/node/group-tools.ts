import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { NodeIdsArraySchema } from "./schema/node-ids-schema.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { GroupSchema } from "./schema/group-schema.js";

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
    MCP_COMMANDS.GROUP_NODE,
    `Groups or ungroups nodes in Figma, depending on the 'group' flag.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the result.
`,
    GroupSchema.shape,
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
      try {
        if (group) {
          if (!nodeIds || nodeIds.length < 2) {
            const response = {
              success: false,
              error: {
                message: "When grouping, 'nodeIds' (min 2) is required.",
                results: [],
                meta: {
                  operation: "group_nodes",
                  params: { group, nodeIds, name }
                }
              }
            };
            return { content: [{ type: "text", text: JSON.stringify(response) }] };
          }
          const ids = nodeIds.map(ensureNodeIdIsString);
          const result = await figmaClient.groupOrUngroupNodes({ group: true, nodeIds: ids, name });
          const response = {
            success: true,
            results: [{
              groupId: result.id,
              name: result.name,
              nodeIds: ids,
              grouped: true
            }]
          };
          return { content: [{ type: "text", text: JSON.stringify(response) }] };
        } else {
          if (!nodeId) {
            const response = {
              success: false,
              error: {
                message: "When ungrouping, 'nodeId' is required.",
                results: [],
                meta: {
                  operation: "ungroup_nodes",
                  params: { group, nodeId }
                }
              }
            };
            return { content: [{ type: "text", text: JSON.stringify(response) }] };
          }
          const id = ensureNodeIdIsString(nodeId);
          const result = await figmaClient.groupOrUngroupNodes({ group: false, nodeId: id });
          const response = {
            success: true,
            results: [{
              nodeId: id,
              ungroupedCount: result.ungroupedCount,
              ungrouped: true
            }]
          };
          return { content: [{ type: "text", text: JSON.stringify(response) }] };
        }
      } catch (error) {
        const response = {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
            results: [],
            meta: {
              operation: group ? "group_nodes" : "ungroup_nodes",
              params: { group, nodeIds, name, nodeId }
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
    }
  );
}
