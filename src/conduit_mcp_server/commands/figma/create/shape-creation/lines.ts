import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { LineSchema, SingleLineSchema, BatchLinesSchema } from "./line-schema.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { MCP_COMMANDS } from "../../../../types/commands.js";

/**
 * Registers line creation commands with the MCP server.
 *
 * This function adds a tool named "create_line" to the MCP server,
 * enabling creation of single or multiple line nodes in Figma. It validates inputs,
 * executes corresponding Figma commands, and returns informative results.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerLinesTools(server, figmaClient);
 */
export function registerLinesTools(server: McpServer, figmaClient: FigmaClient) {
  /**
   * MCP Tool: create_line
   *
   * Creates one or more line nodes in the specified Figma document.
   * Accepts either a single line config (via the 'line' property) or an array of configs (via the 'lines' property).
   * Optionally, you can provide a parent node ID, stroke color, and stroke weight.
   *
   * This tool is useful for programmatically generating connectors, dividers, or design primitives in Figma via MCP.
   *
   * @param {object} args - The input object. Must provide either:
   *   - line: A single line config object (x1, y1, x2, y2, parentId?, strokeColor?, strokeWeight?)
   *   - lines: An array of line config objects (same shape as above)
   *
   * @returns {Promise<object>} Returns a promise resolving to an object containing a text message with the created line node ID(s).
   *
   * @example
   * // Single line
   * {
   *   line: {
   *     x1: 10,
   *     y1: 20,
   *     x2: 110,
   *     y2: 20
   *   }
   * }
   *
   * // Multiple lines
   * {
   *   lines: [
   *     { x1: 10, y1: 20, x2: 110, y2: 20 },
   *     { x1: 20, y1: 30, x2: 120, y2: 30 }
   *   ]
   * }
   */
  server.tool(
    MCP_COMMANDS.CREATE_LINE,
    `Creates one or more line nodes in the specified Figma document. Accepts either a single line config (via 'line') or an array of configs (via 'lines'). Optionally, you can provide a parent node ID, stroke color, and stroke weight.

Input:
  - line: A single line configuration object.
  - lines: An array of line configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created line node ID(s).
`,
    {
      line: SingleLineSchema
        .describe("A single line configuration object. Each object should include coordinates, dimensions, and optional properties for a line.")
        .optional(),
      lines: BatchLinesSchema
        .describe("An array of line configuration objects. Each object should include coordinates, dimensions, and optional properties for a line.")
        .optional(),
    },
    {
      title: "Create Line(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          line: {
            x1: 10,
            y1: 20,
            x2: 110,
            y2: 20
          }
        },
        {
          lines: [
            { x1: 10, y1: 20, x2: 110, y2: 20 },
            { x1: 20, y1: 30, x2: 120, y2: 30 }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "Start and end points must not be identical.",
        "If parentId is invalid, the line will be added to the root.",
        "Stroke color must be a valid color object."
      ],
      extraInfo: "Useful for generating connectors, dividers, or design primitives programmatically. Batch creation is efficient for generating multiple lines or connectors at once."
    },
    // Tool handler: supports both single object and array input via 'line' or 'lines'.
    async (args) => {
      let linesArr;
      if (args.lines) {
        linesArr = args.lines;
      } else if (args.line) {
        linesArr = [args.line];
      } else {
        throw new Error("You must provide either 'line' or 'lines' as input.");
      }
      const results = await processBatch(
        linesArr,
        async cfg => {
          const result = await figmaClient.createLine(cfg);
          // Support both { id } and { ids: [...] } return shapes
          if (result && typeof result.id === "string") {
            return result.id;
          } else if (result && Array.isArray(result.ids) && result.ids.length > 0) {
            return result.ids[0];
          } else {
            throw new Error("Failed to create line: missing node ID from figmaClient.createLine");
          }
        }
      );
      const nodeIds = results.map(r => r.result).filter(Boolean);
      return {
        success: true,
        message: nodeIds.length === 1
          ? `Line created successfully.`
          : `Lines created successfully.`,
        nodeIds
      };
    }
  );
}
