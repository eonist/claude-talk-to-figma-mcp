import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers property-manipulation-related modify commands:
 * - set_corner_radius
 */
export function registerCornerRadiusTools(server: McpServer, figmaClient: FigmaClient) {
  // Set Corner Radius
  server.tool(
    "set_corner_radius",
    `
Sets the corner radius of a node in Figma.

**Parameters:**
- \`nodeId\` (string, required): **Node ID**. Required. The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'. Example: "123:456"
- \`radius\` (number, required): **Corner Radius**. Required. The new corner radius to set, in pixels. Must be a non-negative number (>= 0). Example: 8
- \`corners\` (array, optional): **Corners Array**. Optional. An array of four booleans indicating which corners to apply the radius to, in the order: [top-left, top-right, bottom-right, bottom-left]. If omitted, applies to all corners. Example: [true, false, true, false]

**Returns:**
- \`content\`: Array of objects. Each object contains a \`type: "text"\` and a \`text\` field with the updated node's ID.

**Security & Behavior:**
- Idempotent: true
- Destructive: false
- Read-only: false
- Open-world: false

**Usage Example:**
Input:
\`\`\`json
{
  "nodeId": "123:456",
  "radius": 8,
  "corners": [true, false, true, false]
}
\`\`\`
Output:
\`\`\`json
{
  "content": [{ "type": "text", "text": "Set corner radius for 123:456" }]
}
\`\`\`
`,
    {
      // Validate nodeId as simple or complex Figma node ID, preserving original description
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      // Enforce non-negative radius for Figma API and user safety
      radius: z.number().min(0)
        .describe("The new corner radius to set, in pixels. Must be a non-negative number (>= 0)."),
      // Enforce array of four booleans for explicit per-corner control (Figma API)
      corners: z.array(z.boolean()).length(4).optional()
        .describe("Optional. An array of four booleans indicating which corners to apply the radius to, in the order: [top-left, top-right, bottom-right, bottom-left]. If omitted, applies to all corners."),
    },
    async ({ nodeId, radius, corners }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_corner_radius", { nodeId: id, radius, corners });
      return { content: [{ type: "text", text: `Set corner radius for ${id}` }] };
    }
    // If the MCP server supports metadata/annotations as a separate argument, add here (non-breaking)
    // {
    //   title: "Set Corner Radius",
    //   idempotentHint: true,
    //   destructiveHint: false,
    //   readOnlyHint: false,
    //   openWorldHint: false
    // }
  );
}
