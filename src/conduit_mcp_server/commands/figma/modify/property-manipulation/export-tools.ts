import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers export-related command:
 * - export_node_as_image
 */
export function registerExportTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "export_node_as_image",
    `Export a node as an image from Figma.

Parameters:
  - nodeId (string, required): The ID of the node to export.
  - format (string, optional): Image format ("PNG", "JPG", "SVG", "PDF").
  - scale (number, optional): Export scale (> 0).

Returns:
  - content: Array containing an image object with the exported image data.
    Example: { "content": [{ "type": "image", "data": "...", "mimeType": "image/png" }] }
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
  );
}
