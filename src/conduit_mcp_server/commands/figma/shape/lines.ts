import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { /*LineSchema, */SingleLineSchema, BatchLinesSchema } from "./schema/line-schema.js";
import { processBatch } from "../../../utils/batch-processor.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers line creation commands with the MCP server.
 * 
 * Lines are fundamental design elements used for creating connectors, dividers,
 * borders, and other linear graphics in Figma designs.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API
 * 
 * @returns {void} This function does not return a value but registers the tools asynchronously
 * 
 * @example
 * registerLinesTools(server, figmaClient);
 * 
 * @see {@link MCP_COMMANDS.CREATE_LINE}
 * @since 1.0.0
 */
export function registerLinesTools(server: McpServer, figmaClient: FigmaClient) {
  /**
   * MCP Tool: create_line
   *
   * Creates one or more line nodes in the specified Figma document.
   * Lines are defined by start and end coordinates and are useful for creating
   * connectors, dividers, underlines, and other linear design elements.
   * 
   * **Line Properties:**
   * - `x1`, `y1`: Start point coordinates (required)
   * - `x2`, `y2`: End point coordinates (required, must differ from start)
   * - `parentId`: Parent container node ID (optional)
   * - `strokeColor`: Line color as RGBA object (optional)
   * - `strokeWeight`: Line thickness in pixels (optional, default varies)
   *
   * @param {Object} args - The input configuration object
   * @param {Object} [args.line] - Single line configuration
   * @param {number} args.line.x1 - Start point X coordinate
   * @param {number} args.line.y1 - Start point Y coordinate
   * @param {number} args.line.x2 - End point X coordinate  
   * @param {number} args.line.y2 - End point Y coordinate
   * @param {string} [args.line.parentId] - Optional parent node ID
   * @param {Object} [args.line.strokeColor] - Optional RGBA stroke color
   * @param {number} [args.line.strokeWeight] - Optional stroke weight
   * @param {Object[]} [args.lines] - Array of line configurations (alternative to single)
   * 
   * @returns {Promise} Promise resolving to creation result
   * @returns {boolean} returns.success - Whether operation succeeded
   * @returns {string} returns.message - Success/failure message  
   * @returns {string[]} returns.nodeIds - Array of created line node IDs
   * 
   * @throws {Error} When neither 'line' nor 'lines' is provided
   * @throws {Error} When start and end points are identical
   * @throws {Error} When figmaClient.createLine fails or returns invalid data
   * 
   * @example
   * // Create horizontal divider line
   * const result = await createLine({
   *   line: {
   *     x1: 10, y1: 50, x2: 200, y2: 50,
   *     strokeColor: { r: 0.8, g: 0.8, b: 0.8, a: 1.0 },
   *     strokeWeight: 1
   *   }
   * });
   * 
   * @example
   * // Create multiple connector lines
   * const result = await createLine({
   *   lines: [
   *     { x1: 10, y1: 20, x2: 110, y2: 20 },
   *     { x1: 20, y1: 30, x2: 120, y2: 30 }
   *   ]
   * });
   */
  server.tool(
    MCP_COMMANDS.CREATE_LINE,
    `Creates one or more line nodes in the specified Figma document. Accepts either a single line config (via 'line') or an array of configs (via 'lines'). Optionally, you can provide a parent node ID, stroke color, and stroke weight.

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
