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
    `Insert an SVG as vector in Figma.

Parameters:
  - svg (string, required): The SVG content (raw SVG text or URL).
  - x (number, optional): X coordinate (default 0).
  - y (number, optional): Y coordinate (default 0).
  - name (string, optional): Name for the SVG node.
  - parentId (string, optional): Figma node ID of the parent.

Returns:
  - content: Array containing a text message with the inserted SVG vector's node ID.
    Example: { "content": [{ "type": "text", "text": "Inserted SVG vector 123:456" }] }

Annotations:
  - title: "Insert SVG Vector"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "svg": "<svg>...</svg>",
      "x": 10,
      "y": 20
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Inserted SVG vector 123:456" }]
    }
`,
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
    `Insert multiple SVG vectors in Figma.

Parameters:
  - svgs (array, required): An array of SVG configuration objects. Each object should include:
      - svg (string, required): The SVG content (raw SVG text or URL).
      - x (number, optional): X coordinate (default 0).
      - y (number, optional): Y coordinate (default 0).
      - name (string, optional): Name for the SVG node.
      - parentId (string, optional): Figma node ID of the parent.

Returns:
  - content: Array containing a text message with the number of SVG vectors inserted.
    Example: { "content": [{ "type": "text", "text": "Inserted 3/3 SVG vectors." }] }

Annotations:
  - title: "Insert SVG Vectors (Batch)"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "svgs": [
        { "svg": "<svg>...</svg>", "x": 10, "y": 20 },
        { "svg": "<svg>...</svg>", "x": 120, "y": 20 }
      ]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Inserted 2/2 SVG vectors." }]
    }
`,
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
