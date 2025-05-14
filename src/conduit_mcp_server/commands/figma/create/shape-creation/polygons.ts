import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers polygon creation command:
 * - create_polygons
 */
export function registerPolygonsTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "create_polygons",
    `Create multiple polygons in Figma.

Parameters:
  - polygons (array, required): An array of polygon configuration objects. Each object should include:
      - x (number, required): X coordinate for the top-left corner.
      - y (number, required): Y coordinate for the top-left corner.
      - width (number, required): Width in pixels.
      - height (number, required): Height in pixels.
      - sides (number, required): Number of sides (minimum 3).
      - name (string, optional): Name for the polygon node.
      - parentId (string, optional): Figma node ID of the parent.
      - fillColor (any, optional): Fill color for the polygon.
      - strokeColor (any, optional): Stroke color for the polygon.
      - strokeWeight (number, optional): Stroke weight for the polygon.

Returns:
  - content: Array containing a text message with the number of polygons created.
    Example: { "content": [{ "type": "text", "text": "Created 3/3 polygons." }] }
`,
    { polygons: z.array(z.object({
        x: z.number(), y: z.number(),
        width: z.number(), height: z.number(),
        sides: z.number().min(3),
        name: z.string().optional(), parentId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" }).optional(),
        fillColor: z.any().optional(), strokeColor: z.any().optional(),
        strokeWeight: z.number().optional()
      }))
    },
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
