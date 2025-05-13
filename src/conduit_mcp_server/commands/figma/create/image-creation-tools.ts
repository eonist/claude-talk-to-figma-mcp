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

Annotations:
  - title: "Insert Image"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "url": "https://example.com/image.png",
      "x": 10,
      "y": 20
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Inserted image 123:456" }]
    }
`,
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

Annotations:
  - title: "Insert Images (Batch)"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "images": [
        { "url": "https://example.com/image1.png", "x": 10, "y": 20 },
        { "url": "https://example.com/image2.png", "x": 120, "y": 20 }
      ]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Inserted 2/2 images." }]
    }
`,
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

  // Local image insertion command: supports both --imagePath and --imageData flags.
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

Annotations:
  - title: "Insert Local Image"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "imagePath": "/path/to/image.png",
      "x": 10,
      "y": 20
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Inserted local image 123:456" }]
    }
`,
    {
      imagePath: z.string().optional(),
      imageData: z.string().optional(),
      x: z.number().optional().default(0),
      y: z.number().optional().default(0),
      width: z.number().optional(),
      height: z.number().optional(),
      name: z.string().optional(),
      parentId: z.string().optional()
    },
    async ({ imagePath, imageData, x, y, width, height, name, parentId }): Promise<any> => {
      try {
        let data: Uint8Array;
        if (imageData) {
          // If imageData is a data URI, strip the metadata prefix.
          const base64 = imageData.startsWith("data:") ? imageData.split(",")[1] : imageData;
          data = Uint8Array.from(Buffer.from(base64, "base64"));
        } else if (imagePath) {
          // Read file from disk using Node's fs module.
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

Annotations:
  - title: "Insert Local Images (Batch)"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "images": [
        { "imagePath": "/path/to/image1.png", "x": 10, "y": 20 },
        { "imageData": "data:image/png;base64,...", "x": 120, "y": 20 }
      ]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Inserted 2/2 local images." }]
    }
`,
    {
      images: z.array(
        z.object({
          imagePath: z.string().optional(),
          imageData: z.string().optional(),
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
