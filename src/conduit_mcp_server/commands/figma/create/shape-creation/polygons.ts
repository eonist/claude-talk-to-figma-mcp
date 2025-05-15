import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { PolygonSchema } from "./polygon-schema.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * MCP Tool: create_polygons
 * 
 * Creates multiple polygons in Figma based on the provided array of polygon configuration objects.
 * Each object should specify the coordinates, dimensions, number of sides, and optional properties for a polygon.
 * This tool is useful for batch-generating stars, polygons, or design primitives in Figma via MCP.
 * 
 * Parameters:
 *   - polygons (array, required): An array of polygon configuration objects. Each object should include:
 *       - x (number, required): X coordinate for the top-left corner.
 *       - y (number, required): Y coordinate for the top-left corner.
 *       - width (number, required): Width in pixels.
 *       - height (number, required): Height in pixels.
 *       - sides (number, required): Number of sides (minimum 3).
 *       - name (string, optional): Name for the polygon node.
 *       - parentId (string, optional): Figma node ID of the parent.
 *       - fillColor (any, optional): Fill color for the polygon.
 *       - strokeColor (any, optional): Stroke color for the polygon.
 *       - strokeWeight (number, optional): Stroke weight for the polygon.
 * 
 * Returns:
 *   - content: Array containing a text message with the number of polygons created.
 *     Example: { "content": [{ "type": "text", "text": "Created 3/3 polygons." }] }
 * 
 * Usage Example:
 *   Input:
 *     {
 *       "polygons": [
 *         { "x": 10, "y": 20, "width": 100, "height": 100, "sides": 5 },
 *         { "x": 120, "y": 20, "width": 80, "height": 80, "sides": 6 }
 *       ]
 *     }
 *   Output:
 *     {
 *       "content": [{ "type": "text", "text": "Created 2/2 polygons." }]
 *     }
 */
export function registerPolygonsTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "create_polygons",
    `Creates multiple polygons in Figma based on the provided array of polygon configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of polygons created.
`,
    { polygons: z.array(PolygonSchema)
    },
    {
      title: "Create Polygons",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
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
    // Tool handler: processes each polygon, calls Figma client, and returns batch results.
    async ({ polygons }) => {
      const results = await processBatch(
        polygons,
        cfg => figmaClient.createPolygon(cfg).then(node => node.id)
      );
      const successCount = results.filter(r => r.result).length;
      return {
        content: [{ type: "text", text: `Created ${successCount}/${polygons.length} polygons.` }],
        _meta: { results }
      };
    }
  );
}
