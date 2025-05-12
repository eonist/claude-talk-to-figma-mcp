import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "./utils.js";
import { processBatch } from "../../../utils/batch-processor.js";
import { handleToolError } from "../../../utils/error-handling.js";
import { logger } from "../../../utils/logger.js";

/**
 * Registers SVG insertion commands:
 * - insert_svg_vector
 * - insert_svg_vectors
 *
 * Both commands expect an 'svg' field, which can be a URL or raw SVG text.
 */
export function registerSvgCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  logger.info("🔧 Loading SVG creation tools");
  // Insert a single SVG vector
  server.tool(
    "insert_svg_vector",
    "Insert an SVG as vector in Figma",
    {
      svg: z.string(),
      x: z.number().optional().default(0),
      y: z.number().optional().default(0),
      name: z.string().optional(),
      parentId: z.string().optional()
    },
    async ({ svg, x, y, name, parentId }): Promise<any> => {
      try {
        const content = svg;
        const node = await (figmaClient as any).insertSvgVector({
          svg: content,
          x,
          y,
          name,
          parentId: parentId ? ensureNodeIdIsString(parentId) : undefined
        });
        return {
          content: [{ type: "text", text: `Inserted SVG vector ${node.id}` }]
        };
      } catch (err) {
        return handleToolError(err, "svg-creation-tools", "insert_svg_vector") as any;
      }
    }
  );

  // Batch insertion of multiple SVG vectors
  server.tool(
    "insert_svg_vectors",
    "Insert multiple SVG vectors in Figma",
    {
      svgs: z.array(
        z.object({
          svg: z.string(),
          x: z.number().optional().default(0),
          y: z.number().optional().default(0),
          name: z.string().optional(),
          parentId: z.string().optional()
        })
      )
    },
    async ({ svgs }): Promise<any> => {
      try {
        const results = await processBatch(
          svgs,
          async (cfg) => {
            const content = cfg.svg;
            const node = await (figmaClient as any).insertSvgVector({
              svg: content,
              x: cfg.x,
              y: cfg.y,
              name: cfg.name,
              parentId: cfg.parentId ? ensureNodeIdIsString(cfg.parentId) : undefined
            });
            return node.id;
          }
        );
        const successCount = results.filter(r => r.result).length;
        return {
          content: [
            { type: "text", text: `Inserted ${successCount}/${svgs.length} SVG vectors.` }
          ],
          _meta: { results }
        };
      } catch (err) {
        return handleToolError(err, "svg-creation-tools", "insert_svg_vectors") as any;
      }
    }
  );
}
