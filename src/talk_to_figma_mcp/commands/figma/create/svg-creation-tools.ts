import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "./utils.js";
import { processBatch } from "../../../utils/batch-processor.js";
import { handleToolError } from "../../../utils/error-handling.js";

/**
 * Registers SVG insertion commands:
 * - insert_svg_vector
 * - insert_svg_vectors
 */
export function registerSvgCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  // Insert single SVG vector
  server.tool(
    "insert_svg_vector",
    "Insert an SVG from a URL as vector in Figma",
    {
      url: z.string(),
      x: z.number().optional().default(0),
      y: z.number().optional().default(0),
      name: z.string().optional(),
      parentId: z.string().optional()
    },
    async ({ url, x, y, name, parentId }): Promise<any> => {
      try {
        const svg = await fetch(url).then(res => res.text());
        const node = await (figmaClient as any).insertSvgVector({
          svg,
          x,
          y,
          name,
          parentId: parentId ? ensureNodeIdIsString(parentId) : undefined
        });
        return { content: [{ type: "text", text: `Inserted SVG vector ${node.id}` }] };
      } catch (err) {
        return handleToolError(err, "svg-creation-tools", "insert_svg_vector") as any;
      }
    }
  );

  // Insert multiple SVG vectors
  server.tool(
    "insert_svg_vectors",
    "Insert multiple SVG vectors in Figma",
    {
      svgs: z.array(
        z.object({
          url: z.string(),
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
          cfg => fetch(cfg.url)
            .then(res => res.text())
            .then(svgStr => (figmaClient as any)
              .insertSvgVector({
                svg: svgStr,
                x: cfg.x,
                y: cfg.y,
                name: cfg.name,
                parentId: cfg.parentId ? ensureNodeIdIsString(cfg.parentId) : undefined
              })
              .then((node: any) => node.id)
            )
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
