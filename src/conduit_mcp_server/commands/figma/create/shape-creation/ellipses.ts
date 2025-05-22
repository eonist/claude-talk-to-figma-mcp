import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { EllipseSchema, SingleEllipseSchema, BatchEllipsesSchema } from "./schema/ellipse-schema.js";
import { MCP_COMMANDS } from "../../../../types/commands.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { v4 as uuidv4 } from "uuid";
import { handleToolError } from "../../../../utils/error-handling.js";

/**
 * Registers ellipse creation commands with the MCP server.
 * 
 * @param {McpServer} server - The MCP server instance to register tools on.
 * @param {FigmaClient} figmaClient - The Figma client for executing commands.
 * 
 * Adds:
 * - create_ellipse: Create one or more ellipses in Figma.
 */
export function registerEllipsesTools(server: McpServer, figmaClient: FigmaClient) {
  /**
   * MCP Tool: create_ellipse
   *
   * Creates one or more ellipse nodes in the specified Figma document.
   * Accepts either a single ellipse config (via the 'ellipse' property) or an array of configs (via the 'ellipses' property).
   * Optionally, you can provide a name, a parent node ID, fill color, stroke color, and stroke weight.
   *
   * This tool is useful for programmatically generating circles, ovals, or design primitives in Figma via MCP.
   *
   * @param {object} args - The input object. Must provide either:
   *   - ellipse: A single ellipse config object (x, y, width, height, name?, parentId?, fillColor?, strokeColor?, strokeWeight?)
   *   - ellipses: An array of ellipse config objects (same shape as above)
   *
   * @returns {Promise<object>} Returns a promise resolving to an object containing a text message with the created ellipse node ID(s).
   *
   * @example
   * // Single ellipse
   * {
   *   ellipse: {
   *     x: 60,
   *     y: 80,
   *     width: 120,
   *     height: 90,
   *     name: "Ellipse1"
   *   }
   * }
   *
   * // Multiple ellipses
   * {
   *   ellipses: [
   *     { x: 10, y: 20, width: 100, height: 50, name: "Ellipse1" },
   *     { x: 120, y: 20, width: 80, height: 40 }
   *   ]
   * }
   */
  server.tool(
    MCP_COMMANDS.CREATE_ELLIPSE,
    `Creates one or more ellipse nodes in the specified Figma document. Accepts either a single ellipse config (via 'ellipse') or an array of configs (via 'ellipses'). Optionally, you can provide a name, a parent node ID, fill color, stroke color, and stroke weight.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created ellipse node ID(s).
`,
    {
      ellipse: SingleEllipseSchema
        .describe("A single ellipse configuration object. Each object should include coordinates, dimensions, and optional properties for an ellipse.")
        .optional(),
      ellipses: BatchEllipsesSchema
        .describe("An array of ellipse configuration objects. Each object should include coordinates, dimensions, and optional properties for an ellipse.")
        .optional(),
    },
    {
      title: "Create Ellipse(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          ellipse: {
            x: 60,
            y: 80,
            width: 120,
            height: 90,
            name: "Ellipse1"
          }
        },
        {
          ellipses: [
            { x: 10, y: 20, width: 100, height: 50, name: "Ellipse1" },
            { x: 120, y: 20, width: 80, height: 40 }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "Width and height must be greater than zero.",
        "If parentId is invalid, the ellipse will be added to the root.",
        "Fill and stroke colors must be valid color objects."
      ],
      extraInfo: "Useful for generating circles, ovals, or design primitives programmatically. Batch creation is efficient for generating multiple ellipses or circles at once."
    },
    // Tool handler: supports both single object and array input via 'ellipse' or 'ellipses'.
    async (args) => {
      try {
        let ellipsesArr;
        if (args.ellipses) {
          ellipsesArr = args.ellipses;
        } else if (args.ellipse) {
          ellipsesArr = [args.ellipse];
        } else {
          throw new Error("You must provide either 'ellipse' or 'ellipses' as input.");
        }
        const results = await processBatch(
          ellipsesArr,
          async cfg => {
            const params = { ...cfg, commandId: uuidv4() };
            const result = await figmaClient.createEllipse(params);
            // Support both { id } and { ids: [...] } return shapes
            if (result && typeof result.id === "string") {
              return result.id;
            } else if (result && Array.isArray(result.ids) && result.ids.length > 0) {
              return result.ids[0];
            } else {
              throw new Error("Failed to create ellipse: missing node ID from figmaClient.createEllipse");
            }
          }
        );
        const nodeIds = results.map(r => r.result).filter(Boolean);
        return {
          success: true,
          message: nodeIds.length === 1
            ? `Ellipse created successfully.`
            : `Ellipses created successfully.`,
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

  // The batch tool 'create_ellipses' is now replaced by the unified 'create_ellipse' tool above.
}
