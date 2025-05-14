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
 */
export function registerFromUrlImageTools(server: McpServer, figmaClient: FigmaClient) {
  // Single image insertion
  server.tool(
    "insert_image",
    `
Inserts an image from a URL into Figma at the specified coordinates. You can customize size, name, and parent node.

**Parameters:**
- \`url\` (string, required): **Image URL**. Required. The URL of the image to insert. Must be a valid URL. Example: "https://example.com/image.png"
- \`x\` (number, optional): **X Coordinate**. Optional. X coordinate for the image. Must be between -10,000 and 10,000. Defaults to 0.
- \`y\` (number, optional): **Y Coordinate**. Optional. Y coordinate for the image. Must be between -10,000 and 10,000. Defaults to 0.
- \`width\` (number, optional): **Width**. Optional. Width of the image. Must be between 1 and 10,000.
- \`height\` (number, optional): **Height**. Optional. Height of the image. Must be between 1 and 10,000.
- \`name\` (string, optional): **Name**. Optional. Name for the image node. If provided, must be a non-empty string up to 100 characters.
- \`parentId\` (string, optional): **Parent Node ID**. Optional. Figma node ID of the parent. If provided, must be a string in the format '123:456'.

**Returns:**
- \`content\`: Array of objects. Each object contains a \`type: "text"\` and a \`text\` field with the inserted image's node ID.

**Security & Behavior:**
- Idempotent: true
- Destructive: false
- Read-only: false
- Open-world: false

**Usage Example:**
Input:
\`\`\`json
{
  "url": "https://example.com/image.png",
  "x": 10,
  "y": 20
}
\`\`\`
Output:
\`\`\`json
{
  "content": [{ "type": "text", "text": "Inserted image 123:456" }]
}
\`\`\`
`,
    {
      // Enforce valid URL for image
      url: z.string()
        .url()
        .describe("The URL of the image to insert. Must be a valid URL."),
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
    `
Inserts multiple images from URLs into Figma based on the provided array of image configuration objects.

**Parameters:**
- \`images\` (array, required): **Images**. Required. An array of image configuration objects. Each object should include:
  - \`url\` (string, required): The URL of the image to insert. Must be a valid URL. Example: "https://example.com/image1.png"
  - \`x\` (number, optional): X coordinate for the image. Must be between -10,000 and 10,000. Defaults to 0.
  - \`y\` (number, optional): Y coordinate for the image. Must be between -10,000 and 10,000. Defaults to 0.
  - \`width\` (number, optional): Width of the image. Must be between 1 and 10,000.
  - \`height\` (number, optional): Height of the image. Must be between 1 and 10,000.
  - \`name\` (string, optional): Name for the image node. If provided, must be a non-empty string up to 100 characters.
  - \`parentId\` (string, optional): Figma node ID of the parent. If provided, must be a string in the format '123:456'.

**Returns:**
- \`content\`: Array of objects. Each object contains a \`type: "text"\` and a \`text\` field with the number of images inserted.

**Security & Behavior:**
- Idempotent: true
- Destructive: false
- Read-only: false
- Open-world: false

**Usage Example:**
Input:
\`\`\`json
{
  "images": [
    { "url": "https://example.com/image1.png", "x": 10, "y": 20 },
    { "url": "https://example.com/image2.png", "x": 120, "y": 20 }
  ]
}
\`\`\`
Output:
\`\`\`json
{
  "content": [{ "type": "text", "text": "Inserted 2/2 images." }]
}
\`\`\`
`,
    {
      images: z.array(
        z.object({
          // Enforce valid URL for image
          url: z.string()
            .url()
            .describe("The URL of the image to insert. Must be a valid URL."),
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
      .describe("Array of image configuration objects. Must contain 1 to 50 items."),
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
