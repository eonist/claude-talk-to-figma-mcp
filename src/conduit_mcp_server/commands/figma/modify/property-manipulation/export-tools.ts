import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers property-manipulation-related modify commands:
 * - export_node_as_image
 */
export function registerExportTools(server: McpServer, figmaClient: FigmaClient) {
  // Export Node As Image
  server.tool(
    "export_node_as_image",
    `
Exports a node as an image from Figma in the specified format and scale.

**Parameters:**
- \`nodeId\` (string, required): **Node ID**. Required. The unique Figma node ID to export. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'. Example: "123:456"
- \`format\` (string, optional): **Image Format**. Optional. The image format to export: "PNG", "JPG", "SVG", or "PDF". Defaults to "PNG" if omitted.
- \`scale\` (number, optional): **Export Scale**. Optional. The export scale factor. Must be a positive number. Defaults to 1 if omitted.

**Returns:**
- \`content\`: Array of objects. Each object contains \`type: "image"\`, \`data\` (image data), and \`mimeType\` (image mime type).

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
  "format": "PNG",
  "scale": 2
}
\`\`\`
Output:
\`\`\`json
{
  "content": [{ "type": "image", "data": "...", "mimeType": "image/png" }]
}
\`\`\`
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to export. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      format: z.enum(["PNG", "JPG", "SVG", "PDF"]).optional()
        .describe('Optional. The image format to export: "PNG", "JPG", "SVG", or "PDF". Defaults to "PNG" if omitted.'),
      scale: z.number().positive().optional()
        .describe("Optional. The export scale factor. Must be a positive number. Defaults to 1 if omitted."),
    },
    async ({ nodeId, format, scale }) => {
      const id = ensureNodeIdIsString(nodeId);
      const result = await figmaClient.executeCommand("export_node_as_image", { nodeId: id, format, scale });
      return { content: [{ type: "image", data: result.imageData, mimeType: result.mimeType }] };
    }
    /*
    Additional Usage Example:
      Input:
        {
          "nodeId": "123:456",
          "format": "SVG",
          "scale": 2
        }
      Output:
        {
          "content": [{ "type": "image", "data": "...", "mimeType": "image/svg+xml" }]
        }

    Error Handling:
      - Returns an error if nodeId is invalid or not found.
      - Returns an error if format is not one of the allowed values.
      - Returns an error if scale is not a positive number.

    Security Notes:
      - All inputs are validated and sanitized. nodeId must match the expected format.
      - Exported image data is limited by Figma's API.

    Output Schema:
      {
        "content": [
          {
            "type": "image",
            "data": "<base64 or binary>",
            "mimeType": "<image mime type>"
          }
        ]
      }
    */
  );
}
