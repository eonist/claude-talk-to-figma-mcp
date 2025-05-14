import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers image insertion commands:
 * - insert_image
 * - insert_images
 * - insert_local_image
 * - insert_local_images
 * 
 * @module commands/figma/create/image-creation-tools
 */

/**
 * Registers image insertion commands:
 * - insert_image
 * - insert_images
 */
export function registerFromLocalImageTools(server: McpServer, figmaClient: FigmaClient) {
  // Local image insertion command: supports both --imagePath and --imageData flags.
  server.tool(
    "insert_local_image",
    `Inserts a local image into Figma via a file path or a Base64 data URI at the specified coordinates. You can customize size, name, and parent node.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the inserted local image's node ID.

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
      // Enforce non-empty string for imagePath if provided
      imagePath: z.string()
        .min(1)
        .max(500)
        .optional()
        .describe("Optional. Path to the local image file. If provided, must be a non-empty string up to 500 characters."),
      // Enforce non-empty string for imageData if provided
      imageData: z.string()
        .min(1)
        .max(10000000)
        .optional()
        .describe("Optional. Base64 data URI of the image. If provided, must be a non-empty string."),
      // Enforce reasonable X coordinate
      x: z.number()
        .min(-10000)
        .max(10000)
        .optional()
        .default(0)
        .describe("Optional. X coordinate for the image. Must be between -10,000 and 10,000. Defaults to 0."),
      // Enforce reasonable Y coordinate
      y: z.number()
        .min(-10000)
        .max(10000)
        .optional()
        .default(0)
        .describe("Optional. Y coordinate for the image. Must be between -10,000 and 10,000. Defaults to 0."),
      // Enforce positive width, reasonable upper bound
      width: z.number()
        .min(1)
        .max(10000)
        .optional()
        .describe("Optional. Width of the image. Must be between 1 and 10,000."),
      // Enforce positive height, reasonable upper bound
      height: z.number()
        .min(1)
        .max(10000)
        .optional()
        .describe("Optional. Height of the image. Must be between 1 and 10,000."),
      // Enforce non-empty string for name if provided
      name: z.string()
        .min(1)
        .max(100)
        .optional()
        .describe("Optional. Name for the image node. If provided, must be a non-empty string up to 100 characters."),
      // Enforce Figma node ID format for parentId if provided
      parentId: z.string()
        .regex(/^\d+:\d+$/)
        .optional()
        .describe("Optional. Figma node ID of the parent. If provided, must be a string in the format '123:456'."),
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
    `Inserts multiple local images into Figma via file paths or Base64 data URIs based on the provided array of image configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of local images inserted.

Annotations:
  - title: "Insert Local Images"
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
          // Enforce non-empty string for imagePath if provided
          imagePath: z.string()
            .min(1)
            .max(500)
            .optional()
            .describe("Optional. Path to the local image file. If provided, must be a non-empty string up to 500 characters."),
          // Enforce non-empty string for imageData if provided
          imageData: z.string()
            .min(1)
            .max(10000000)
            .optional()
            .describe("Optional. Base64 data URI of the image. If provided, must be a non-empty string."),
          // Enforce reasonable X coordinate
          x: z.number()
            .min(-10000)
            .max(10000)
            .optional()
            .default(0)
            .describe("Optional. X coordinate for the image. Must be between -10,000 and 10,000. Defaults to 0."),
          // Enforce reasonable Y coordinate
          y: z.number()
            .min(-10000)
            .max(10000)
            .optional()
            .default(0)
            .describe("Optional. Y coordinate for the image. Must be between -10,000 and 10,000. Defaults to 0."),
          // Enforce positive width, reasonable upper bound
          width: z.number()
            .min(1)
            .max(10000)
            .optional()
            .describe("Optional. Width of the image. Must be between 1 and 10,000."),
          // Enforce positive height, reasonable upper bound
          height: z.number()
            .min(1)
            .max(10000)
            .optional()
            .describe("Optional. Height of the image. Must be between 1 and 10,000."),
          // Enforce non-empty string for name if provided
          name: z.string()
            .min(1)
            .max(100)
            .optional()
            .describe("Optional. Name for the image node. If provided, must be a non-empty string up to 100 characters."),
          // Enforce Figma node ID format for parentId if provided
          parentId: z.string()
            .regex(/^\d+:\d+$/)
            .optional()
            .describe("Optional. Figma node ID of the parent. If provided, must be a string in the format '123:456'."),
        })
      )
      .min(1)
      .max(50)
      .describe("Array of local image configuration objects. Must contain 1 to 50 items."),
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
