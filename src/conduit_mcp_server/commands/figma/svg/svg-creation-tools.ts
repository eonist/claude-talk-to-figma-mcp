import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { setSvgVectorSchema } from "./schema/svg-creation-schema.js";
import { processBatch } from "../../../utils/batch-processor.js";
// import { handleToolError } from "../../../utils/error-handling.js";
import { logger } from "../../../utils/logger.js";
import { fetchTextResource } from "../../../utils/fetch-resource.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers SVG creation and insertion commands on the MCP server.
 * 
 * This function adds the "set_svg_vector" tool to the MCP server, enabling the creation
 * and insertion of single or multiple SVG vectors into Figma documents. The tool supports
 * both raw SVG content and URL-based SVG resources, with automatic fetching for URLs.
 * 
 * @param {McpServer} server - The MCP server instance to register the tools on
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API
 * 
 * @returns {void} This function does not return a value but registers the tools asynchronously
 * 
 * @example
 * ```
 * // Register SVG creation tools
 * registerSvgCreationCommands(server, figmaClient);
 * 
 * // Tool usage examples:
 * // Single SVG insertion
 * await server.callTool('set_svg_vector', {
 *   svg: {
 *     svg: '...',
 *     x: 100,
 *     y: 200,
 *     name: 'My Icon'
 *   }
 * });
 * 
 * // Batch SVG insertion
 * await server.callTool('set_svg_vector', {
 *   svgs: [
 *     { svg: '...', x: 0, y: 0 },
 *     { svg: 'https://example.com/icon.svg', x: 100, y: 0 }
 *   ]
 * });
 * ```
 * 
 * @throws {Error} When neither 'svg' nor 'svgs' parameters are provided
 * @throws {Error} When SVG content cannot be fetched from a provided URL
 * @throws {Error} When Figma API calls fail or return invalid responses
 * 
 * @since 1.0.0
 */
export function registerSvgCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  logger.info("🔧 Loading SVG creation tools");
  // Unified single/batch SVG vector insertion
  server.tool(
    MCP_COMMANDS.SET_SVG_VECTOR,
    `Sets or inserts one or more SVG vectors in Figma. Accepts either a single SVG config (via 'svg') or an array of configs (via 'svgs').

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the inserted SVG vector node ID(s).
`,
    {
      svg: z.object({
        svg: z.string()
          .min(1)
          .max(100000)
          .describe("The SVG content (raw SVG text or URL). Must be a non-empty string up to 100,000 characters."),
        x: z.number()
          .min(-10000)
          .max(10000)
          .optional()
          .default(0)
          .describe("Optional. X coordinate for the SVG. Must be between -10,000 and 10,000. Defaults to 0."),
        y: z.number()
          .min(-10000)
          .max(10000)
          .optional()
          .default(0)
          .describe("Optional. Y coordinate for the SVG. Must be between -10,000 and 10,000. Defaults to 0."),
        name: z.string()
          .min(1)
          .max(100)
          .optional()
          .describe("Optional. Name for the SVG node. If provided, must be a non-empty string up to 100 characters."),
        parentId: z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .optional()
          .describe("Optional. Figma node ID of the parent. If provided, must be a string in the format '123:456'."),
      }).optional().describe("A single SVG vector configuration. Optional."),
      svgs: z.array(
        z.object({
          svg: z.string()
            .min(1)
            .max(100000)
            .describe("The SVG content (raw SVG text or URL). Must be a non-empty string up to 100,000 characters."),
          x: z.number()
            .min(-10000)
            .max(10000)
            .optional()
            .default(0)
            .describe("Optional. X coordinate for the SVG. Must be between -10,000 and 10,000. Defaults to 0."),
          y: z.number()
            .min(-10000)
            .max(10000)
            .optional()
            .default(0)
            .describe("Optional. Y coordinate for the SVG. Must be between -10,000 and 10,000. Defaults to 0."),
          name: z.string()
            .min(1)
            .max(100)
            .optional()
            .describe("Optional. Name for the SVG node. If provided, must be a non-empty string up to 100 characters."),
          parentId: z.string()
            .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
            .optional()
            .describe("Optional. Figma node ID of the parent. If provided, must be a string in the format '123:456'."),
        })
      ).optional().describe("An array of SVG vector configurations for batch insertion. Optional."),
    },
    {
      title: "Insert SVG Vector(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          svg: {
            svg: "<svg>...</svg>",
            x: 0,
            y: 0,
            name: "My SVG"
          }
        },
        {
          svgs: [
            {
              svg: "<svg>...</svg>",
              x: 0,
              y: 0,
              name: "My SVG"
            }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "SVG content must be valid SVG markup or a valid URL.",
        "Coordinates must be within the canvas bounds.",
        "If parentId is invalid, the SVG will be added to the root."
      ],
      extraInfo: "Use this command to insert one or more SVG vectors into the Figma document."
    },
    async (args): Promise<any> => {
      try {
        let svgsArr;
        if (args.svgs) {
          svgsArr = args.svgs;
        } else if (args.svg) {
          svgsArr = [args.svg];
        } else {
          throw new Error("You must provide either 'svg' or 'svgs' as input.");
        }
        const results = await processBatch(
          svgsArr,
          async (cfg) => {
            let content = cfg.svg;
            logger.info(`[SVG MCP] Received svg property: ${content}`);
            // If content looks like a URL, fetch it server-side (match plugin logic: startsWith('http'))
            if (typeof content === "string" && content.startsWith("http")) {
              logger.info(`[SVG MCP] Detected URL, fetching SVG from: ${content}`);
              try {
                content = await fetchTextResource(content);
                logger.info(`[SVG MCP] Fetched SVG content length: ${content.length}`);
              } catch (fetchErr) {
                const errMsg = (fetchErr && typeof fetchErr === "object" && "message" in fetchErr)
                  ? (fetchErr as any).message
                  : String(fetchErr);
                logger.error(`[SVG MCP] Failed to fetch SVG from URL (${cfg.svg}): ${errMsg}`);
                throw new Error(`Failed to fetch SVG from URL (${cfg.svg}): ${errMsg}`);
              }
            }
            logger.info(`[SVG MCP] Sending to plugin, SVG content starts with: ${typeof content === "string" ? content.slice(0, 100) : ""}`);
            const result = await (figmaClient as any).insertSvgVector({
              svg: content,
              x: cfg.x,
              y: cfg.y,
              name: cfg.name,
              parentId: cfg.parentId ? ensureNodeIdIsString(cfg.parentId) : undefined
            });
            // Support both { id } and { ids: [...] } return shapes
            if (result && typeof result.id === "string") {
              return result.id;
            } else if (result && Array.isArray(result.ids) && result.ids.length > 0) {
              return result.ids[0];
            } else {
              throw new Error("Failed to insert SVG vector: missing node ID from figmaClient.insertSvgVector");
            }
          }
        );
        const nodeIds = results.map(r => r.result).filter(Boolean);
        return {
          success: true,
          message: nodeIds.length === 1
            ? `SVG vector inserted successfully.`
            : `SVG vectors inserted successfully.`,
          nodeIds
        };
      } catch (err) {
        // Return a structured error response.
        return {
          success: false,
          error: {
            message: err instanceof Error ? err.message : String(err),
            ...(err && typeof err === "object" && "stack" in err ? { stack: (err as Error).stack } : {})
          }
        };
      }
    }
  );
}
