import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { PolygonSchema, SinglePolygonSchema, BatchPolygonsSchema } from "./polygon-schema.js";
import { processBatch } from "../../../../utils/batch-processor.js";

/**
/**
 * Registers polygon creation commands with the MCP server.
 *
 * @param {McpServer} server - The MCP server instance to register tools on.
 * @param {FigmaClient} figmaClient - The Figma client for executing commands.
 *
 * Adds:
 * - create_polygon: Create one or more polygons in Figma.
 */
export function registerPolygonsTools(server: McpServer, figmaClient: FigmaClient) {
  /**
   * MCP Tool: create_polygon
   *
   * Creates one or more polygon nodes in the specified Figma document.
   * Accepts either a single polygon config (via the 'polygon' property) or an array of configs (via the 'polygons' property).
   * Optionally, you can provide a name, a parent node ID, fill color, stroke color, and stroke weight.
   *
   * This tool is useful for programmatically generating stars, polygons, or design primitives in Figma via MCP.
   *
   * @param {object} args - The input object. Must provide either:
   *   - polygon: A single polygon config object (x, y, width, height, sides, name?, parentId?, fillColor?, strokeColor?, strokeWeight?)
   *   - polygons: An array of polygon config objects (same shape as above)
   *
   * @returns {Promise<object>} Returns a promise resolving to an object containing a text message with the created polygon node ID(s).
   *
   * @example
   * // Single polygon
   * {
   *   polygon: {
   *     x: 10,
   *     y: 20,
   *     width: 100,
   *     height: 100,
   *     sides: 5
   *   }
   * }
   *
   * // Multiple polygons
   * {
   *   polygons: [
   *     { x: 10, y: 20, width: 100, height: 100, sides: 5 },
   *     { x: 120, y: 20, width: 80, height: 80, sides: 6 }
   *   ]
   * }
   */
  server.tool(
    "create_polygon",
    `Creates one or more polygons in Figma. Accepts either a single polygon config (via 'polygon') or an array of configs (via 'polygons'). Optionally, you can provide a name, a parent node ID, fill color, stroke color, and stroke weight.

Input:
  - polygon: A single polygon configuration object.
  - polygons: An array of polygon configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created polygon node ID(s).
`,
    {
      polygon: SinglePolygonSchema
        .describe("A single polygon configuration object. Each object should include coordinates, dimensions, and optional properties for a polygon.")
        .optional(),
      polygons: BatchPolygonsSchema
        .describe("An array of polygon configuration objects. Each object should include coordinates, dimensions, and optional properties for a polygon.")
        .optional(),
    },
    {
      title: "Create Polygon(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          polygon: {
            x: 10,
            y: 20,
            width: 100,
            height: 100,
            sides: 5
          }
        },
        {
          polygons: [
            { x: 10, y: 20, width: 100, height: 100, sides: 5 },
            { x: 120, y: 20, width: 80, height: 80, sides: 6 }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "Each polygon must have at least 3 sides.",
        "Width and height must be greater than zero.",
        "If parentId is invalid, polygons will be added to the root.",
        "Fill and stroke colors must be valid color objects."
      ],
      extraInfo: "Batch creation is efficient for generating multiple polygons or stars at once."
    },
    // Tool handler: supports both single object and array input via 'polygon' or 'polygons'.
    async (args) => {
      let polygonsArr;
      if (args.polygons) {
        polygonsArr = args.polygons;
      } else if (args.polygon) {
        polygonsArr = [args.polygon];
      } else {
        throw new Error("You must provide either 'polygon' or 'polygons' as input.");
      }
      const results = await processBatch(
        polygonsArr,
        async cfg => {
          const node = await figmaClient.createPolygon(cfg);
          return node.id;
        }
      );
      const nodeIds = results.map(r => r.result).filter(Boolean);
      if (nodeIds.length === 1) {
        return { content: [{ type: "text", text: `Created polygon ${nodeIds[0]}` }] };
      } else {
        return { content: [{ type: "text", text: `Created polygons: ${nodeIds.join(", ")}` }] };
      }
    }
  );
}
