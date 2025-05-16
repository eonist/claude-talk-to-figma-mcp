import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { EllipseSchema } from "./ellipse-schema.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { v4 as uuidv4 } from "uuid";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * MCP Tool: create_ellipse
 * 
 * Creates a new ellipse node in the specified Figma document at the given coordinates, with the specified width and height.
 * Optionally, you can provide a name, a parent node ID, fill color, stroke color, and stroke weight.
 * This tool is useful for programmatically generating circles, ovals, or design primitives in Figma via MCP.
 * 
 * Parameters:
 *   - x (number, required): X coordinate for the top-left corner. Example: 60
 *   - y (number, required): Y coordinate for the top-left corner. Example: 80
 *   - width (number, required): Width in pixels. Example: 120
 *   - height (number, required): Height in pixels. Example: 90
 *   - name (string, optional): Name for the ellipse node. Example: "Ellipse1"
 *   - parentId (string, optional): Figma node ID of the parent.
 *   - fillColor (any, optional): Fill color for the ellipse.
 *   - strokeColor (any, optional): Stroke color for the ellipse.
 *   - strokeWeight (number, optional): Stroke weight for the ellipse.
 * 
 * Returns:
 *   - content: Array containing a text message with the created ellipse's node ID.
 *     Example: { "content": [{ "type": "text", "text": "Created ellipse 123:456" }] }
 * 
 * Usage Example:
 *   Input:
 *     {
 *       "x": 60,
 *       "y": 80,
 *       "width": 120,
 *       "height": 90,
 *       "name": "Ellipse1"
 *     }
 *   Output:
 *     {
 *       "content": [{ "type": "text", "text": "Created ellipse 123:456" }]
 *     }
 */
export function registerEllipsesTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "create_ellipse",
    `Creates a new ellipse node in the specified Figma document at the given coordinates, with the specified width and height. Optionally, you can provide a name, a parent node ID, fill color, stroke color, and stroke weight.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created ellipse's node ID.
`,
    EllipseSchema.shape,
    {
      title: "Create Ellipse",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false
    },
    // Tool handler: validates input, calls Figma client, and returns result or error.
    async (args) => {
      try {
        const params = { commandId: uuidv4(), ...args };
        const node = await figmaClient.createEllipse(params);
        return { content: [{ type: "text", text: `Created ellipse ${node.id}` }] };
      } catch (err) {
        // Handle errors and return a formatted error response.
        return handleToolError(err, "shape-creation-tools", "create_ellipse") as any;
      }
    }
  );

  /**
   * MCP Tool: create_ellipses
   * 
   * Creates multiple ellipses in Figma based on the provided array of ellipse configuration objects.
   * Each object should specify the coordinates, dimensions, and optional properties for an ellipse.
   * This tool is useful for batch-generating circles, ovals, or design primitives in Figma via MCP.
   * 
   * Parameters:
   *   - ellipses (array, required): An array of ellipse configuration objects. Each object should include:
   *       - x (number, required): X coordinate for the top-left corner.
   *       - y (number, required): Y coordinate for the top-left corner.
   *       - width (number, required): Width in pixels.
   *       - height (number, required): Height in pixels.
   *       - name (string, optional): Name for the ellipse node.
   *       - parentId (string, optional): Figma node ID of the parent.
   *       - fillColor (any, optional): Fill color for the ellipse.
   *       - strokeColor (any, optional): Stroke color for the ellipse.
   *       - strokeWeight (number, optional): Stroke weight for the ellipse.
   * 
   * Returns:
   *   - content: Array containing a text message with the number of ellipses created.
   *     Example: { "content": [{ "type": "text", "text": "Created 3/3 ellipses." }] }
   * 
   * Usage Example:
   *   Input:
   *     {
   *       "ellipses": [
   *         { "x": 10, "y": 20, "width": 100, "height": 50, "name": "Ellipse1" },
   *         { "x": 120, "y": 20, "width": 80, "height": 40 }
   *       ]
   *     }
   *   Output:
   *     {
   *       "content": [{ "type": "text", "text": "Created 2/2 ellipses." }]
   *     }
   */
  server.tool(
    "create_ellipses",
    `Creates multiple ellipses in Figma based on the provided array of ellipse configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of ellipses created.
`,
    { ellipses: z.array(EllipseSchema)
    },
    {
      title: "Create Ellipses",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false
    },
    // Tool handler: processes each ellipse, calls Figma client, and returns batch results.
    async ({ ellipses }) => {
      const results = await processBatch(
        ellipses,
        cfg => figmaClient.createEllipse(cfg).then(node => node.id)
      );
      const successCount = results.filter(r => r.result).length;
      return {
        content: [{ type: "text", text: `Created ${successCount}/${ellipses.length} ellipses.` }],
        _meta: { results }
      };
    }
  );
}
