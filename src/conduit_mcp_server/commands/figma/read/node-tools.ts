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
  // Get Node Info
  server.tool(
    "get_node_info",
    `Get detailed information about a specific node in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the node info as JSON.
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to get information about. Must be a string in the format '123:456'."),
    },
    {
      title: "Get Node Info",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456" }
      ]),
      edgeCaseWarnings: [
        "Returns an error if nodeId is invalid or not found.",
        "Result includes all properties of the node.",
        "Large nodes may return a large JSON object."
      ],
      extraInfo: "Use this command to inspect properties and metadata of a specific Figma node."
    },
    async ({ nodeId }) => {
      try {
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Getting node info for ID: ${nodeIdString}`);
        const result = await figmaClient.executeCommand("get_node_info", { nodeId: nodeIdString });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting node info: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Get Nodes Info
  server.tool(
    "get_nodes_info",
    `Get detailed information about multiple nodes in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the nodes info as JSON.
`,
    {
      nodeIds: NodeIdsArraySchema(1, 100),
    },
    {
      title: "Get Nodes Info",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeIds: ["123:456", "789:101"] }
      ]),
      edgeCaseWarnings: [
        "Returns an error if any nodeId is invalid or not found.",
        "Result is an array of node info objects.",
        "Large requests may impact performance."
      ],
      extraInfo: "Batch version of get_node_info for inspecting multiple nodes at once."
    },
    async (args: { nodeIds?: unknown }, extra: any) => {
      try {
        if (!args.nodeIds) {
          return { content: [{ type: "text", text: "No nodeIds provided" }] };
        }
        const nodeIds = Array.isArray(args.nodeIds) ? args.nodeIds as string[] : [];
        const nodeIdStrings = nodeIds.map((nodeId: string) => ensureNodeIdIsString(nodeId));
        logger.debug(`Getting info for ${nodeIdStrings.length} nodes`);
        const results = await figmaClient.executeCommand("get_nodes_info", { nodeIds: nodeIdStrings });
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
              text: `Error getting nodes info: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );
}
