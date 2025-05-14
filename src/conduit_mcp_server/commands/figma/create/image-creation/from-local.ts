import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers image insertion from local file/data URI commands:
 * - insert_local_image
 * - insert_local_images
 */
export function registerFromLocalImageTools(server: McpServer, figmaClient: FigmaClient) {
  // Single local image insertion
  server.tool(
    "insert_local_image",
    `Insert a local image via a file path or a Base64 data URI.

Parameters:
  - imagePath (string, optional): Path to the local image file.
  - imageData (string, optional): Base64 data URI of the image.
  - x (number, optional): X coordinate (default 0).
  - y (number, optional): Y coordinate (default 0).
  - width (number, optional): Width of the image.
  - height (number, optional): Height of the image.
  - name (string, optional): Name for the image node.
  - parentId (string, optional): Figma node ID of the parent.

Returns:
  - content: Array containing a text message with the inserted local image's node ID.
    Example: { "content": [{ "type": "text", "text": "Inserted local image 123:456" }] }
`,
    {
      imagePath: z.string().min(1).max(500).optional(),
      imageData: z.string().min(1).max(10000000).optional(),
      x: z.number().min(-10000).max(10000).optional().default(0),
      y: z.number().min(-10000).max(10000).optional().default(0),
      width: z.number().min(1).max(10000).optional(),
      height: z.number().min(1).max(10000).optional(),
      name: z.string().min(1).max(100).optional(),
      parentId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" }).optional(),
    },
    async ({ imagePath, imageData, x, y, width, height, name, parentId }) => {
      try {
        let data: Uint8Array;
        if (imageData) {
          const base64 = imageData.startsWith("data:") ? imageData.split(",")[1] : imageData;
          data = Uint8Array.from(Buffer.from(base64, "base64"));
        } else if (imagePath) {
          const fs = require("fs");
          const fileBuffer = fs.readFileSync(imagePath);
          data = new Uint8Array(fileBuffer);
        } else {
          throw new Error("Either imageData or imagePath must be provided.");
        }
        const node = await (figmaClient as any).insertLocalImage({
          data: Array.from(data),
          x,
          y,
          width,
          height,
          name,
          parentId
        });
        return { content: [{ type: "text", text: `Inserted local image ${node.id}` }] };
      } catch (err) {
        return handleToolError(err, "image-creation-tools", "insert_local_image") as any;
      }
    }
  );

  // Batch local image insertion
  server.tool(
    "insert_local_images",
    `Insert multiple local images via file paths or Base64 data URIs.

Parameters:
  - images (array, required): An array of image configuration objects. Each object should include:
      - imagePath (string, optional): Path to the local image file.
      - imageData (string, optional): Base64 data URI of the image.
      - x (number, optional): X coordinate (default 0).
      - y (number, optional): Y coordinate (default 0).
      - width (number, optional): Width of the image.
      - height (number, optional): Height of the image.
      - name (string, optional): Name for the image node.
      - parentId (string, optional): Figma node ID of the parent.

Returns:
  - content: Array containing a text message with the number of local images inserted.
    Example: { "content": [{ "type": "text", "text": "Inserted 3/3 local images." }] }
`,
    {
      images: z.array(
        z.object({
          imagePath: z.string().min(1).max(500).optional(),
          imageData: z.string().min(1).max(10000000).optional(),
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
          async (config) => {
            let data: Uint8Array;
            if (config.imageData) {
              const base64 = config.imageData.startsWith("data:")
                ? config.imageData.split(",")[1]
                : config.imageData;
              data = Uint8Array.from(Buffer.from(base64, "base64"));
            } else if (config.imagePath) {
              const fs = require("fs");
              const fileBuffer = fs.readFileSync(config.imagePath);
              data = new Uint8Array(fileBuffer);
            } else {
              throw new Error("Either imageData or imagePath must be provided for each image.");
            }
            const node = await (figmaClient as any).insertLocalImage({
              data: Array.from(data),
              x: config.x,
              y: config.y,
              width: config.width,
              height: config.height,
              name: config.name,
              parentId: config.parentId
            });
            return node.id;
          }
        );
        const successCount = results.filter(r => r.result).length;
        return {
          content: [{ type: "text", text: `Inserted ${successCount}/${images.length} local images.` }],
          _meta: { results }
        };
      } catch (err) {
        return handleToolError(err, "image-creation-tools", "insert_local_images") as any;
      }
    }
  );
}
