import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { v4 as uuidv4 } from "uuid";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * MCP Tool: create_frame
 * 
 * Creates a new frame node in the specified Figma document at the given coordinates, with the specified width and height.
 * Optionally, you can provide a name, a parent node ID to attach the frame to, and fill/stroke properties.
 * This tool is useful for programmatically generating UI containers, artboards, or design primitives in Figma via MCP.
 * 
 * Parameters:
 *   - x (number, required): X coordinate for the top-left corner. Example: 50
 *   - y (number, required): Y coordinate for the top-left corner. Example: 100
 *   - width (number, required): Width in pixels. Example: 400
 *   - height (number, required): Height in pixels. Example: 300
 *   - name (string, optional): Name for the frame node. Example: "Main Frame"
 *   - parentId (string, optional): Figma node ID of the parent.
 *   - fillColor (any, optional): Fill color for the frame.
 *   - strokeColor (any, optional): Stroke color for the frame.
 *   - strokeWeight (number, optional): Stroke weight for the frame.
 * 
 * Returns:
 *   - content: Array containing a text message with the created frame's node ID.
 *     Example: { "content": [{ "type": "text", "text": "Created frame 123:456" }] }
 * 
 * Usage Example:
 *   Input:
 *     {
 *       "x": 50,
 *       "y": 100,
 *       "width": 400,
 *       "height": 300,
 *       "name": "Main Frame"
 *     }
 *   Output:
 *     {
 *       "content": [{ "type": "text", "text": "Created frame 123:456" }]
 *     }
 */
export function registerFramesTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "create_frame",
    `
Creates a new frame node in the specified Figma document at the given coordinates, with the specified width and height. Optionally, you can provide a name, a parent node ID, and fill/stroke properties.

**Parameters:**
- \`x\` (number, required): **X Coordinate**. Required. X coordinate for the top-left corner. Example: 50
- \`y\` (number, required): **Y Coordinate**. Required. Y coordinate for the top-left corner. Example: 100
- \`width\` (number, required): **Width**. Required. Width in pixels. Example: 400
- \`height\` (number, required): **Height**. Required. Height in pixels. Example: 300
- \`name\` (string, optional): **Name**. Optional. Name for the frame node. Example: "Main Frame"
- \`parentId\` (string, optional): **Parent Node ID**. Optional. Figma node ID of the parent.
- \`fillColor\` (any, optional): **Fill Color**. Optional. Fill color for the frame.
- \`strokeColor\` (any, optional): **Stroke Color**. Optional. Stroke color for the frame.
- \`strokeWeight\` (number, optional): **Stroke Weight**. Optional. Stroke weight for the frame.

**Returns:**
- \`content\`: Array of objects. Each object contains a \`type: "text"\` and a \`text\` field with the created frame's node ID.

**Security & Behavior:**
- Idempotent: true
- Destructive: false
- Read-only: false
- Open-world: false

**Usage Example:**
Input:
\`\`\`json
{
  "x": 50,
  "y": 100,
  "width": 400,
  "height": 300,
  "name": "Main Frame"
}
\`\`\`
Output:
\`\`\`json
{
  "content": [{ "type": "text", "text": "Created frame 123:456" }]
}
\`\`\`
`,
    {
      x: z.number(), y: z.number(),
      width: z.number(), height: z.number(),
      name: z.string().optional(), parentId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" }).optional(),
      fillColor: z.any().optional(), strokeColor: z.any().optional(),
      strokeWeight: z.number().optional()
    },
    // Tool handler: validates input, calls Figma client, and returns result or error.
    async (args) => {
      try {
        const params = { commandId: uuidv4(), ...args };
        const node = await figmaClient.createFrame(params);
        return { content: [{ type: "text", text: `Created frame ${node.id}` }] };
      } catch (err) {
        // Handle errors and return a formatted error response.
        return handleToolError(err, "shape-creation-tools", "create_frame") as any;
      }
    }
  );
}
