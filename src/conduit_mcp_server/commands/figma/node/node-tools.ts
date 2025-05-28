import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FigmaClient } from "../../../clients/figma-client.js";//index
import { MCP_COMMANDS } from "../../../types/commands.js";
import { logger } from "../../../utils/logger.js";
//import { filterFigmaNode } from "../../../utils/figma/filter-node.js";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { NodeIdsArraySchema } from "./schema/node-ids-schema.js";
import { GetNodeInfoSchema } from "./schema/node-info-schema.js";

/**
 * Registers comprehensive node information retrieval and matrix transformation tools on the MCP server.
 * 
 * This function adds two powerful tools: one for retrieving detailed node information and metadata,
 * and another for applying matrix transformations to nodes. Both tools support single node operations
 * and batch processing, providing extensive capabilities for node inspection, property analysis,
 * and geometric transformations within Figma documents.
 * 
 * @param {McpServer} server - The MCP server instance to register the node tools on
 * @param {FigmaClient} figmaClient - The Figma client instance for API communication
 * 
 * @returns {void} This function has no return value but registers the tools asynchronously
 * 
 * @throws {Error} Throws an error if node IDs are invalid, transformation matrices are malformed, or nodes are not found
 * 
 * @example
 * ```
 * // Get single node information
 * const result = await nodeInfoTool({ nodeId: "123:456" });
 * 
 * // Get multiple nodes information
 * const result = await nodeInfoTool({ 
 *   nodeIds: ["123:456", "789:101", "abc:def"] 
 * });
 * 
 * // Apply matrix transformation to single node
 * const result = await matrixTool({
 *   entry: { 
 *     nodeId: "123:456", 
 *     matrix: [1][1] // [scaleX, skewY, skewX, scaleY, translateX, translateY]
 *   }
 * });
 * 
 * // Batch matrix transformations with error handling
 * const result = await matrixTool({
 *   entries: [
 *     { nodeId: "123:456", matrix: [2][2] }, // 2x scale
 *     { nodeId: "789:101", matrix: [1][1] } // translate
 *   ],
 *   options: { skipErrors: true }
 * });
 * ```
 * 
 * @note Matrix transformations use a 6-element array representing 2D affine transformation: [scaleX, skewY, skewX, scaleY, translateX, translateY]
 * @note Node info includes comprehensive properties: dimensions, fills, strokes, effects, constraints, positioning, and hierarchy data
 * @note Large batch requests may impact performance; consider chunking for very large operations
 * @warning Matrix transformations are destructive and will overwrite existing node transforms
 * @since 1.0.0
 * @see {@link https://www.figma.com/developers/api#get-node} Figma Get Node API
 * @see {@link https://www.figma.com/developers/api#matrix-transform} Figma Matrix Transform API
 */
export function registerNodeTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified Get Node Info (single or batch)
  server.tool(
    MCP_COMMANDS.GET_NODE_INFO,
    `Get detailed information about one or more nodes in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the node(s) info as JSON.
`,
    GetNodeInfoSchema.shape,
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
    async (args: { nodeId?: string; nodeIds?: string[] }) => {
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
          const nodeInfoResult = await figmaClient.executeCommand(MCP_COMMANDS.GET_NODE_INFO, { nodeId });
          // nodeInfoResult.content is an array of { type: "text", text: JSON.stringify([node]) }
          let node = null;
          if (
            nodeInfoResult &&
            Array.isArray(nodeInfoResult.content) &&
            nodeInfoResult.content.length > 0 &&
            nodeInfoResult.content[0].type === "text"
          ) {
            try {
              const arr = JSON.parse(nodeInfoResult.content[0].text);
              node = arr && arr.length > 0 ? arr[0] : null;
            } catch (e) {
              node = null;
            }
          }
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

  // Set Matrix Transform (single or batch)
  server.tool(
    MCP_COMMANDS.SET_MATRIX_TRANSFORM,
    `Set a transformation matrix on one or more Figma nodes (single or batch).

Parameters:
  - entry: { nodeId: string, matrix: number[] } (optional, for single)
  - entries: Array<{ nodeId: string, matrix: number[] }> (optional, for batch)
  - options: { skipErrors?: boolean } (optional)

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the result for each node.
`,
    {
      entry: z
        .object({
          nodeId: z.string(),
          matrix: z.array(z.number()).length(6)
        })
        .optional(),
      entries: z
        .array(
          z.object({
            nodeId: z.string(),
            matrix: z.array(z.number()).length(6)
          })
        )
        .optional(),
      options: z
        .object({
          skipErrors: z.boolean().optional()
        })
        .optional()
    },
    {
      title: "Set Matrix Transform (Single or Batch)",
      idempotentHint: false,
      destructiveHint: true,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { entry: { nodeId: "123:456", matrix: [1, 0, 0, 1, 100, 200] } },
        {
          entries: [
            { nodeId: "123:456", matrix: [1, 0, 0, 1, 100, 200] },
            { nodeId: "789:101", matrix: [0.5, 0, 0, 0.5, 0, 0] }
          ],
          options: { skipErrors: true }
        }
      ]),
      edgeCaseWarnings: [
        "Returns an error if any nodeId is invalid or not found (unless skipErrors is true).",
        "Result is an array of result objects (even for single)."
      ],
      extraInfo: "Supports both single and batch matrix transforms. Matrix must be a 6-element array."
    },
    async (args: { entry?: { nodeId: string; matrix: number[] }; entries?: Array<{ nodeId: string; matrix: number[] }>; options?: { skipErrors?: boolean } }) => {
      const results = [];
      const skipErrors = args.options?.skipErrors === true;
      const entries =
        Array.isArray(args.entries) && args.entries.length > 0
          ? args.entries
          : args.entry
          ? [args.entry]
          : [];
      if (entries.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "You must provide either 'entry' or 'entries'."
            }
          ]
        };
      }
      for (const { nodeId, matrix } of entries) {
        try {
          const result = await figmaClient.executeCommand(MCP_COMMANDS.SET_MATRIX_TRANSFORM, { nodeId, matrix });
          results.push({ nodeId, success: true, result });
        } catch (error) {
          if (skipErrors) {
            results.push({
              nodeId,
              success: false,
              error: error instanceof Error ? error.message : String(error)
            });
            continue;
          }
          return {
            content: [
              {
                type: "text",
                text: `Error setting matrix for node ${nodeId}: ${error instanceof Error ? error.message : String(error)}`
              }
            ]
          };
        }
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results)
          }
        ]
      };
    }
  );
}
