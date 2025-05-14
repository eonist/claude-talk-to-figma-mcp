import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "./utils.js";
import { processBatch } from "../../../utils/batch-processor.js";
import { handleToolError } from "../../../utils/error-handling.js";
import { logger } from "../../../utils/logger.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

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
    `
Inserts an SVG as a vector in Figma at the specified coordinates. You can customize name and parent node.

**Parameters:**
- \`svg\` (string, required): **SVG Content**. Required. The SVG content (raw SVG text or URL). Must be a non-empty string up to 100,000 characters. Example: "<svg>...</svg>"
- \`x\` (number, optional): **X Coordinate**. Optional. X coordinate for the SVG. Must be between -10,000 and 10,000. Defaults to 0.
- \`y\` (number, optional): **Y Coordinate**. Optional. Y coordinate for the SVG. Must be between -10,000 and 10,000. Defaults to 0.
- \`name\` (string, optional): **Name**. Optional. Name for the SVG node. If provided, must be a non-empty string up to 100 characters.
- \`parentId\` (string, optional): **Parent Node ID**. Optional. Figma node ID of the parent. If provided, must be a string in the format '123:456'.

**Returns:**
- \`content\`: Array of objects. Each object contains a \`type: "text"\` and a \`text\` field with the inserted SVG vector's node ID.

**Security & Behavior:**
- Idempotent: true
- Destructive: false
- Read-only: false
- Open-world: false

**Usage Example:**
Input:
\`\`\`json
{
  "svg": "<svg>...</svg>",
  "x": 10,
  "y": 20
}
\`\`\`
Output:
\`\`\`json
{
  "content": [{ "type": "text", "text": "Inserted SVG vector 123:456" }]
}
\`\`\`
`,
    {
      // Enforce non-empty string for SVG content, reasonable length
      svg: z.string()
        .min(1)
        .max(100000)
        .describe("The SVG content (raw SVG text or URL). Must be a non-empty string up to 100,000 characters."),
      // Enforce reasonable X coordinate
      x: z.number()
        .min(-10000)
        .max(10000)
        .optional()
        .default(0)
        .describe("Optional. X coordinate for the SVG. Must be between -10,000 and 10,000. Defaults to 0."),
      // Enforce reasonable Y coordinate
      y: z.number()
        .min(-10000)
        .max(10000)
        .optional()
        .default(0)
        .describe("Optional. Y coordinate for the SVG. Must be between -10,000 and 10,000. Defaults to 0."),
      // Enforce non-empty string for name if provided
      name: z.string()
        .min(1)
        .max(100)
        .optional()
        .describe("Optional. Name for the SVG node. If provided, must be a non-empty string up to 100 characters."),
      // Enforce Figma node ID format for parentId if provided
      parentId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .optional()
        .describe("Optional. Figma node ID of the parent. If provided, must be a string in the format '123:456'."),
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
    `
Inserts multiple SVG vectors in Figma based on the provided array of SVG configuration objects.

**Parameters:**
- \`svgs\` (array, required): **SVGs**. Required. An array of SVG configuration objects. Each object should include:
  - \`svg\` (string, required): The SVG content (raw SVG text or URL). Must be a non-empty string up to 100,000 characters. Example: "<svg>...</svg>"
  - \`x\` (number, optional): X coordinate for the SVG. Must be between -10,000 and 10,000. Defaults to 0.
  - \`y\` (number, optional): Y coordinate for the SVG. Must be between -10,000 and 10,000. Defaults to 0.
  - \`name\` (string, optional): Name for the SVG node. If provided, must be a non-empty string up to 100 characters.
  - \`parentId\` (string, optional): Figma node ID of the parent. If provided, must be a string in the format '123:456'.

**Returns:**
- \`content\`: Array of objects. Each object contains a \`type: "text"\` and a \`text\` field with the number of SVG vectors inserted.

**Security & Behavior:**
- Idempotent: true
- Destructive: false
- Read-only: false
- Open-world: false

**Usage Example:**
Input:
\`\`\`json
{
  "svgs": [
    { "svg": "<svg>...</svg>", "x": 10, "y": 20 },
    { "svg": "<svg>...</svg>", "x": 120, "y": 20 }
  ]
}
\`\`\`
Output:
\`\`\`json
{
  "content": [{ "type": "text", "text": "Inserted 2/2 SVG vectors." }]
}
\`\`\`
`,
    {
      svgs: z.array(
        z.object({
          // Enforce non-empty string for SVG content, reasonable length
          svg: z.string()
            .min(1)
            .max(100000)
            .describe("The SVG content (raw SVG text or URL). Must be a non-empty string up to 100,000 characters."),
          // Enforce reasonable X coordinate
          x: z.number()
            .min(-10000)
            .max(10000)
            .optional()
            .default(0)
            .describe("Optional. X coordinate for the SVG. Must be between -10,000 and 10,000. Defaults to 0."),
          // Enforce reasonable Y coordinate
          y: z.number()
            .min(-10000)
            .max(10000)
            .optional()
            .default(0)
            .describe("Optional. Y coordinate for the SVG. Must be between -10,000 and 10,000. Defaults to 0."),
          // Enforce non-empty string for name if provided
          name: z.string()
            .min(1)
            .max(100)
            .optional()
            .describe("Optional. Name for the SVG node. If provided, must be a non-empty string up to 100 characters."),
          // Enforce Figma node ID format for parentId if provided
          parentId: z.string()
            .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
            .optional()
            .describe("Optional. Figma node ID of the parent. If provided, must be a string in the format '123:456'."),
        })
      )
      .min(1)
      .max(50)
      .describe("Array of SVG configuration objects. Must contain 1 to 50 items."),
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
