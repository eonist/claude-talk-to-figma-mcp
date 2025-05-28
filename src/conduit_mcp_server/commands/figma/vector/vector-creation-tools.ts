import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { vectorSchema, vectorsSchema } from "./schema/vector-schema.js";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { processBatch } from "../../../utils/batch-processor.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers vector-related MCP tools with the server.
 * 
 * This function sets up two main tools:
 * - CREATE_VECTOR: Creates one or more vector nodes in Figma
 * - GET_VECTOR: Retrieves vector node information by ID(s)
 * 
 * Both tools support single and batch operations for efficiency.
 * 
 * @param server - The MCP server instance to register tools with
 * @param figmaClient - The Figma client for executing API commands
 * @returns void
 * 
 * @example
 * ```
 * const server = new McpServer();
 * const figmaClient = new FigmaClient(apiKey);
 * registerVectorTools(server, figmaClient);
 * ```
 */
export function registerVectorTools(server: McpServer, figmaClient: FigmaClient) {
  /**
   * Tool for creating vector nodes in Figma.
   * 
   * Supports both single vector creation (using 'vector' parameter) and
   * batch creation (using 'vectors' parameter). Vector paths must include
   * valid SVG path data and winding rules.
   * 
   * @param vector - Single vector configuration object
   * @param vectors - Array of vector configuration objects for batch creation
   * @returns Promise resolving to an object containing created node IDs
   * 
   * @throws {Error} When vector path data is invalid or Figma API errors occur
   */
  server.tool(
    MCP_COMMANDS.CREATE_VECTOR,
    `Creates one or more vector nodes in Figma. Use 'vector' for single or 'vectors' for batch.`,
    {
      vector: vectorSchema.optional(),
      vectors: vectorsSchema
    },
    {
      title: "Create Vector(s)",
      idempotentHint: false,
      readOnlyHint: false
    },
    async ({ vector, vectors }) => {
      const configs = vectors ?? (vector ? [vector] : []);
      const results = await processBatch(configs, cfg =>
        figmaClient.executeCommand(MCP_COMMANDS.CREATE_VECTOR, cfg)
      );
      
      // Flatten id arrays
      const nodeIds = results.flat();
      return {
        content: [
          { type: "text", text: JSON.stringify({ nodeIds }) }
        ]
      };
    }
  );

  /**
   * Tool for retrieving vector node information from Figma.
   * 
   * Fetches vector node properties including position, dimensions, and
   * vector path data. Supports both single node retrieval (using 'nodeId')
   * and batch retrieval (using 'nodeIds').
   * 
   * @param nodeId - Single node ID to retrieve
   * @param nodeIds - Array of node IDs for batch retrieval
   * @returns Promise resolving to vector node data or array of vector data
   * 
   * @throws {Error} When no node ID is provided or when nodes don't exist
   * 
   * @example
   * ```
   * // Single vector retrieval
   * const result = await tool({ nodeId: "123:456" });
   * 
   * // Batch vector retrieval
   * const results = await tool({ nodeIds: ["123:456", "789:012"] });
   * ```
   */
  server.tool(
    MCP_COMMANDS.GET_VECTOR,
    `Retrieves one or more vector nodes by ID(s). Accepts 'nodeId' or 'nodeIds'.`,
    {
      nodeId: z.string().optional(),
      nodeIds: z.array(z.string()).optional()
    },
    {
      title: "Get Vector(s)",
      idempotentHint: true,
      readOnlyHint: true
    },
    async ({ nodeId, nodeIds }) => {
      const ids = nodeIds ?? (nodeId ? [nodeId] : []);
      if (ids.length === 0) {
        throw new Error("Provide either nodeId or nodeIds.");
      }

      const results = [];
      for (const id of ids) {
        const node = await figmaClient.executeCommand(MCP_COMMANDS.GET_NODE_INFO, { nodeId: id });
        if (!node || node.type !== "VECTOR") {
          results.push({ nodeId: id, error: "Not a vector node" });
          continue;
        }

        const { x, y, width, height, vectorPaths } = node;
        results.push({ nodeId: id, x, y, width, height, vectorPaths });
      }

      const payload = ids.length === 1 ? { vector: results[0] } : { vectors: results };
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(payload)
          }
        ]
      };
    }
  );
}
