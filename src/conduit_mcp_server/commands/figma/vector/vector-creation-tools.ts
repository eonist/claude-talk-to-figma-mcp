import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { vectorSchema, vectorsSchema } from "./schema/vector-schema.js";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { processBatch } from "../../../utils/batch-processor.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers vector-related commands:
 * - create_vector
 * - get_vector (single or batch)
 */
export function registerVectorTools(server: McpServer, figmaClient: FigmaClient) {
  // Create vector(s)
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

  // Get vector(s)
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
