import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { ImageFromUrlSchema } from "./image-schema.js";

/**
 * Registers image insertion commands:
 * - insert_image
 * - insert_images
 */
export function registerFromUrlImageTools(server: McpServer, figmaClient: FigmaClient) {
  // Single image insertion
  server.tool(
    "insert_image",
    `Inserts an image from a URL into Figma at the specified coordinates. You can customize size, name, and parent node.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the inserted image's node ID.
`,
    ImageFromUrlSchema.shape,
    {
      title: "Insert Image",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false
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
    `Inserts multiple images from URLs into Figma based on the provided array of image configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of images inserted.
`,
    {
      images: z.array(ImageFromUrlSchema)
        .min(1)
        .max(50)
        .describe("Array of image configuration objects. Must contain 1 to 50 items."),
    },
    {
      title: "Insert Images",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false
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
}
