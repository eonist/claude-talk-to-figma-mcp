import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";
import { processBatch } from "../../../utils/batch-processor.js";

/**
 * Registers vector-creation-related commands:
 * - create_vector
 * - create_vectors
 */
export function registerVectorCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  // Single vector
  server.tool(
    "create_vector",
    "Create a new vector in Figma",
    {
      x: z.number(), y: z.number(),
      width: z.number(), height: z.number(),
      name: z.string().optional(), parentId: z.string().optional(),
      vectorPaths: z.array(z.object({
        windingRule: z.string().optional(),
        data: z.string()
      })),
      fillColor: z.any().optional(), strokeColor: z.any().optional(),
      strokeWeight: z.number().optional()
    },
    async ({ x, y, width, height, name, parentId, vectorPaths, fillColor, strokeColor, strokeWeight }) => {
      const node = await figmaClient.createVector({ x, y, width, height, name, parentId, vectorPaths, fillColor, strokeColor, strokeWeight });
      return { content: [{ type: "text", text: `Created vector ${node.id}` }] };
    }
  );

  // Batch vectors
  server.tool(
    "create_vectors",
    "Create multiple vectors in Figma",
    { vectors: z.array(z.object({
        x: z.number(), y: z.number(),
        width: z.number(), height: z.number(),
        name: z.string().optional(), parentId: z.string().optional(),
        vectorPaths: z.array(z.object({ data: z.string(), windingRule: z.string().optional() })),
        fillColor: z.any().optional(), strokeColor: z.any().optional(),
        strokeWeight: z.number().optional()
      }))
    },
    async ({ vectors }) => {
      const results = await processBatch(
        vectors,
        cfg => figmaClient.createVector(cfg).then(node => node.id)
      );
      const successCount = results.filter(r => r.result).length;
      return {
        content: [{ type: "text", text: `Created ${successCount}/${vectors.length} vectors.` }],
        _meta: { results }
      };
    }
  );
}
