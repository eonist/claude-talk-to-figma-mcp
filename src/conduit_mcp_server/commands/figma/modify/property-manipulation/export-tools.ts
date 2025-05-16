import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";
import { ExportOptionsSchema } from "./export-schema.js";

/**
 * Registers property-manipulation-related modify commands:
 * - export_node_as_image
 */
export function registerExportTools(server: McpServer, figmaClient: FigmaClient) {
  // Export Node As Image
  server.tool(
    "export_node_as_image",
    `Exports a node as an image from Figma in the specified format and scale.

Returns:
  - content: Array of objects. Each object contains type: "image", data (image data), and mimeType (image mime type).
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to export. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      ...ExportOptionsSchema.shape,
    },
    {
      title: "Export Node As Image",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false
    },
    async ({ nodeId, format, scale }) => {
      const id = ensureNodeIdIsString(nodeId);
      const result = await figmaClient.executeCommand("export_node_as_image", { nodeId: id, format, scale });
      return { content: [{ type: "image", data: result.imageData, mimeType: result.mimeType }] };
    }
  );
}
