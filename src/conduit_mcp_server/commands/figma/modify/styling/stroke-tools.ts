import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers stroke color styling command:
 * - set_stroke_color
 */
export function registerStrokeTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "set_stroke_color",
    `
Sets the stroke color of a node in Figma.

**Parameters:**
- \`nodeId\` (string, required): **Node ID**. Required. The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'. Example: "123:456"
- \`r\` (number, required): **Red Channel**. Required. Red channel value (0-1). Example: 0.5
- \`g\` (number, required): **Green Channel**. Required. Green channel value (0-1). Example: 0.5
- \`b\` (number, required): **Blue Channel**. Required. Blue channel value (0-1). Example: 0.5
- \`a\` (number, optional): **Alpha Channel**. Optional. Alpha channel value (0-1). Example: 1
- \`weight\` (number, optional): **Stroke Weight**. Optional. Stroke weight. Must be between 0.1 and 100. Example: 2

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
  "r": 0.5,
  "g": 0.5,
  "b": 0.5,
  "a": 1,
  "weight": 2
}
\`\`\`
Output:
\`\`\`json
{
  "content": [{ "type": "text", "text": "Set stroke 123:456" }]
}
\`\`\`
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      r: z.number().min(0).max(1).describe("Red channel (0-1)"),
      g: z.number().min(0).max(1).describe("Green channel (0-1)"),
      b: z.number().min(0).max(1).describe("Blue channel (0-1)"),
      a: z.number().min(0).max(1).optional().describe("Optional. Alpha channel (0-1)"),
      weight: z.number().min(0.1).max(100).optional().describe("Optional. Stroke weight. Must be between 0.1 and 100."),
    },
    async ({ nodeId, r, g, b, a, weight }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.setStrokeColor({ nodeId: id, r, g, b, a, weight });
      return { content: [{ type: "text", text: `Set stroke ${id}` }] };
    }
  );
}
