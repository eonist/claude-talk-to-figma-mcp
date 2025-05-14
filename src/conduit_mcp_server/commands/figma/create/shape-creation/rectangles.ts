import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { CreateRectangleParams } from "../../../../types/command-params.js";
import { v4 as uuidv4 } from "uuid";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers rectangle creation commands:
 * - create_rectangle
 * - create_rectangles
 */
export function registerRectanglesTools(server: McpServer, figmaClient: FigmaClient) {
  // Create Rectangle
  server.tool(
    "create_rectangle",
    `Creates a new rectangle shape node in the specified Figma document at the given coordinates, with the specified width and height.
Optionally, you can provide a name, a parent node ID to attach the rectangle to, and a corner radius for rounded corners.
This tool is useful for programmatically generating UI elements, backgrounds, or design primitives in Figma via MCP.

Parameters:
  - x (number, required): The X coordinate (in Figma canvas units, pixels) for the top-left corner of the rectangle. Must be >= 0. Example: 100
  - y (number, required): The Y coordinate (in Figma canvas units, pixels) for the top-left corner of the rectangle. Must be >= 0. Example: 200
  - width (number, required): The width of the rectangle in pixels. Must be > 0. Example: 300
  - height (number, required): The height of the rectangle in pixels. Must be > 0. Example: 150
  - name (string, optional): The name to assign to the rectangle node in Figma. Example: "Button Background"
  - parentId (string, optional): The Figma node ID of the parent to attach the rectangle to. If omitted, the rectangle is added to the root.
  - cornerRadius (number, optional): The corner radius (in pixels) for rounded corners. Must be >= 0. Example: 8

Returns:
  - content: Array containing a text message with the created rectangle's node ID.
    Example: { "content": [{ "type": "text", "text": "Created rectangle 123:456" }] }
`,
    {
      x: z.number().min(0),
      y: z.number().min(0),
      width: z.number().positive(),
      height: z.number().positive(),
      name: z.string().optional(),
      parentId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" }).optional(),
      cornerRadius: z.number().min(0).optional()
    },
    async (args) => {
      try {
        const params: CreateRectangleParams = { commandId: uuidv4(), ...args };
        const node = await figmaClient.createRectangle(params);
        if (args.cornerRadius != null) {
          await figmaClient.executeCommand("set_corner_radius", {
            commandId: uuidv4(),
            nodeId: node.id,
            radius: args.cornerRadius
          });
        }
        return { content: [{ type: "text", text: `Created rectangle ${node.id}` }] };
      } catch (err) {
        return handleToolError(err, "shape-creation-tools", "create_rectangle") as any;
      }
    }
  );

  // Create Rectangles (Batch)
  server.tool(
    "create_rectangles",
    `Create multiple rectangles in Figma.

Parameters:
  - rectangles (array, required): An array of rectangle configuration objects. Each object should include:
      - x (number, required): X coordinate for the top-left corner.
      - y (number, required): Y coordinate for the top-left corner.
      - width (number, required): Width in pixels.
      - height (number, required): Height in pixels.
      - name (string, optional): Name for the rectangle node.
      - parentId (string, optional): Figma node ID of the parent.
      - cornerRadius (number, optional): Corner radius in pixels.

Returns:
  - content: Array containing a text message with the number of rectangles created.
    Example: { "content": [{ "type": "text", "text": "Created 3/3 rectangles." }] }
`,
    { rectangles: z.array(z.object({
        x: z.number(), y: z.number(),
        width: z.number(), height: z.number(),
        name: z.string().optional(), parentId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" }).optional(),
        cornerRadius: z.number().min(0).optional()
      }))
    },
    async ({ rectangles }) => {
      const results = await processBatch(
        rectangles,
        async cfg => {
          const node = await figmaClient.createRectangle(cfg);
          if (cfg.cornerRadius != null) {
            await figmaClient.executeCommand("set_corner_radius", { 
              commandId: uuidv4(),
              nodeId: node.id, 
              radius: cfg.cornerRadius 
            });
          }
          return node.id;
        }
      );
      const successCount = results.filter(r => r.result).length;
      return {
        content: [{ type: "text", text: `Created ${successCount}/${rectangles.length} rectangles.` }],
        _meta: { results }
      };
    }
  );
}
