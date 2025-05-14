import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers image insertion from URL commands:
 * - insert_image
 * - insert_images
 */
export function registerFromUrlImageTools(server: McpServer, figmaClient: FigmaClient) {
  // Single image insertion
  server.tool(
    "insert_image",
    `Insert an image from a URL.

Parameters:
  - url (string, required): The URL of the image to insert.
  - x (number, optional): X coordinate (default 0).
  - y (number, optional): Y coordinate (default 0).
  - width (number, optional): Width of the image.
  - height (number, optional): Height of the image.
  - name (string, optional): Name for the image node.
  - parentId (string, optional): Figma node ID of the parent.

Returns:
  - content: Array containing a text message with the inserted image's node ID.
    Example: { "content": [{ "type": "text", "text": "Inserted image 123:456" }] }
`,
    {
      url: z.string().url(),
      x: z.number().min(-10000).max(10000).optional().default(0),
      y: z.number().min(-10000).max(10000).optional().default(0),
      width: z.number().min(1).max(10000).optional(),
      height: z.number().min(1).max(10000).optional(),
      name: z.string().min(1).max(100).optional(),
      parentId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" }).optional(),
    },
    async ({ url, x, y, width, height, name, parentId }) => {
      try {
        const node = await (figmaClient as any).insertImage({ url, x, y, width, height, name, parentId });
        return { content: [{ type: "text", text: `Inserted image ${node.id}` }] };
      } catch (err) {
        return handleToolError(err, "image-creation-tools", "insert_image") as any;
      }
    }
  );

  // Batch image insertion
  server.tool(
    "insert_images",
    `Insert multiple images from URLs.

Parameters:
  - images (array, required): An array of image configuration objects. Each object should include:
      - url (string, required): The URL of the image to insert.
      - x (number, optional): X coordinate (default 0).
      - y (number, optional): Y coordinate (default 0).
      - width (number, optional): Width of the image.
      - height (number, optional): Height of the image.
      - name (string, optional): Name for the image node.
      - parentId (string, optional): Figma node ID of the parent.

Returns:
  - content: Array containing a text message with the number of images inserted.
    Example: { "content": [{ "type": "text", "text": "Inserted 3/3 images." }] }
`,
    {
      images: z.array(
        z.object({
          url: z.string().url(),
          x: z.number().min(-10000).max(10000).optional().default(0),
          y: z.number().min(-10000).max(10000).optional().default(0),
          width: z.number().min(1).max(10000).optional(),
          height: z.number().min(1).max(10000).optional(),
          name: z.string().min(1).max(100).optional(),
          parentId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" }).optional(),
        })
      ).min(1).max(50),
    },
    async ({ images }) => {
      try {
        const results = await processBatch(
          images,
          cfg => (figmaClient as any).insertImage(cfg).then((node: any) => node.id)
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
