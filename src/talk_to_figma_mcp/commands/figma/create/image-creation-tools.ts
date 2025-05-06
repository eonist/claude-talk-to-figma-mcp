import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";
import { processBatch } from "../../../utils/batch-processor.js";
import { handleToolError } from "../../../utils/error-handling.js";

/**
 * Registers image insertion commands:
 * - insert_image
 * - insert_images
 */
export function registerImageCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  // Single image insertion
  server.tool(
    "insert_image",
    "Insert an image from a URL",
    {
      url: z.string(),
      x: z.number().optional().default(0),
      y: z.number().optional().default(0),
      width: z.number().optional(),
      height: z.number().optional(),
      name: z.string().optional(),
      parentId: z.string().optional()
    },
    async ({ url, x, y, width, height, name, parentId }): Promise<any> => {
      try {
        const node = await figmaClient.insertImage({ url, x, y, width, height, name, parentId });
        return { content: [{ type: "text", text: `Inserted image ${node.id}` }] };
      } catch (err) {
        return handleToolError(err, "image-creation-tools", "insert_image") as any;
      }
    }
  );

  // Batch image insertion
  server.tool(
    "insert_images",
    "Insert multiple images from URLs",
    {
      images: z.array(
        z.object({
          url: z.string(),
          x: z.number().optional().default(0),
          y: z.number().optional().default(0),
          width: z.number().optional(),
          height: z.number().optional(),
          name: z.string().optional(),
          parentId: z.string().optional()
        })
      )
    },
    async ({ images }): Promise<any> => {
      try {
        const results = await processBatch(
          images,
          cfg => figmaClient.insertImage(cfg).then(node => node.id)
        );
        const successCount = results.filter(r => r.result).length;
        return {
          content: [{ type: "text", text: `Inserted ${successCount}/${images.length} images.` }],
          _meta: { results }
        };
      } catch (err) {
        return handleToolError(err, "image-creation-tools", "insert_images") as any;
      }
    }
  );
}
