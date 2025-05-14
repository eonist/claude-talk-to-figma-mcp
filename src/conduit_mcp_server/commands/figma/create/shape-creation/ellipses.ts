import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { v4 as uuidv4 } from "uuid";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers ellipse creation commands:
 * - create_ellipse
 * - create_ellipses
 */
export function registerEllipsesTools(server: McpServer, figmaClient: FigmaClient) {
  // Create Ellipse
  server.tool(
    "create_ellipse",
    `Create a new ellipse in Figma.

Parameters:
  - x (number, required): X coordinate for the top-left corner.
  - y (number, required): Y coordinate for the top-left corner.
  - width (number, required): Width in pixels.
  - height (number, required): Height in pixels.
  - name (string, optional): Name for the ellipse node.
  - parentId (string, optional): Figma node ID of the parent.
  - fillColor (any, optional): Fill color for the ellipse.
  - strokeColor (any, optional): Stroke color for the ellipse.
  - strokeWeight (number, optional): Stroke weight for the ellipse.

Returns:
  - content: Array containing a text message with the created ellipse's node ID.
    Example: { "content": [{ "type": "text", "text": "Created ellipse 123:456" }] }
`,
    {
      x: z.number(), y: z.number(),
      width: z.number(), height: z.number(),
      name: z.string().optional(), parentId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" }).optional(),
      fillColor: z.any().optional(), strokeColor: z.any().optional(),
      strokeWeight: z.number().optional()
    },
    async (args) => {
      try {
        const params = { commandId: uuidv4(), ...args };
        const node = await figmaClient.createEllipse(params);
        return { content: [{ type: "text", text: `Created ellipse ${node.id}` }] };
      } catch (err) {
        return handleToolError(err, "shape-creation-tools", "create_ellipse") as any;
      }
    }
  );

  // Create Ellipses (Batch)
  server.tool(
    "create_ellipses",
    `Create multiple ellipses in Figma.

Parameters:
  - ellipses (array, required): An array of ellipse configuration objects. Each object should include:
      - x (number, required): X coordinate for the top-left corner.
      - y (number, required): Y coordinate for the top-left corner.
      - width (number, required): Width in pixels.
      - height (number, required): Height in pixels.
      - name (string, optional): Name for the ellipse node.
      - parentId (string, optional): Figma node ID of the parent.
      - fillColor (any, optional): Fill color for the ellipse.
      - strokeColor (any, optional): Stroke color for the ellipse.
      - strokeWeight (number, optional): Stroke weight for the ellipse.

Returns:
  - content: Array containing a text message with the number of ellipses created.
    Example: { "content": [{ "type": "text", "text": "Created 3/3 ellipses." }] }
`,
    { ellipses: z.array(z.object({
        x: z.number(), y: z.number(),
        width: z.number(), height: z.number(),
        name: z.string().optional(), parentId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" }).optional(),
        fillColor: z.any().optional(), strokeColor: z.any().optional(),
        strokeWeight: z.number().optional()
      }))
    },
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
