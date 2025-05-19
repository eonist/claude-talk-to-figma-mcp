import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FigmaClient } from "../../../clients/figma-client/index.js";
import { logger } from "../../../utils/logger.js";
import { filterFigmaNode } from "../../../utils/figma/filter-node.js";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
import { NodeIdsArraySchema } from "../modify/layer-management/node-ids-schema.js";

/**
 * Registers node info read commands on the MCP server.
 *
 * This function adds tools named "get_node_info" and "get_nodes_info" to the MCP server,
 * enabling retrieval of detailed information about single or multiple nodes in Figma.
 * It validates inputs, executes corresponding Figma commands, and returns informative results.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerNodeTools(server, figmaClient);
 */
export function registerNodeTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified Get Node Info (single or batch)
  server.tool(
    "get_node_info",
    `Get detailed information about one or more nodes in Figma.

Input:
  - nodeId: The unique Figma node ID to get information about. (string)
  - nodeIds: An array of Figma node IDs to get information about. (string[]; min 1, max 100)

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the node(s) info as JSON.

Examples:
  // Single node
  { nodeId: "123:456" }
  // Multiple nodes
  { nodeIds: ["123:456", "789:101"] }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to get information about. Must be a string in the format '123:456'.")
        .optional(),
      nodeIds: NodeIdsArraySchema(1, 100)
        .describe("An array of Figma node IDs to get information about. Each must be a string in the format '123:456'.")
        .optional(),
    },
    {
      title: "Get Node Info (Unified)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456" },
        { nodeIds: ["123:456", "789:101"] }
      ]),
      edgeCaseWarnings: [
        "Returns an error if any nodeId is invalid or not found.",
        "Result is an array of node info objects (even for single).",
        "Large requests may impact performance."
      ],
      extraInfo: "Unified version of get_node_info and get_nodes_info. Use this command to inspect properties and metadata of one or more Figma nodes."
    },
    async (args) => {
      try {
        let nodeIdList: string[] = [];
        if (args.nodeIds) {
          nodeIdList = Array.isArray(args.nodeIds) ? args.nodeIds.map(ensureNodeIdIsString) : [];
        } else if (args.nodeId) {
          nodeIdList = [ensureNodeIdIsString(args.nodeId)];
        } else {
          return { content: [{ type: "text", text: "You must provide either 'nodeId' or 'nodeIds'." }] };
        }
        logger.debug(`Getting info for ${nodeIdList.length} node(s)`);
        // Directly fetch node info for each nodeId
        const results = [];
        for (const nodeId of nodeIdList) {
          const node = await figmaClient.getNodeInfo(nodeId);
          results.push(node);
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting node info: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );
}
