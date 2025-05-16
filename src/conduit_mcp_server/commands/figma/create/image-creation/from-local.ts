import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { handleToolError } from "../../../../utils/error-handling.js";
import { LocalImageSchema, SingleLocalImageSchema, BatchLocalImagesSchema } from "./image-schema.js";

/**
 * Registers image insertion commands on the MCP server.
 *
 * This function adds tools named "insert_local_image" and "insert_local_images" to the MCP server,
 * enabling insertion of single or multiple local images via file paths or Base64 data URIs into Figma.
 * It validates inputs, executes corresponding Figma commands, and returns informative results.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerFromLocalImageTools(server, figmaClient);
 */
export function registerFromLocalImageTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified local image insertion (single or batch)
  server.tool(
    "insert_local_image",
    `Inserts one or more local images into Figma via a file path or a Base64 data URI. Accepts either a single image config (via 'image') or an array of configs (via 'images'). You can customize size, name, and parent node.

Input:
  - image: A single local image configuration object.
  - images: An array of local image configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the inserted local image node ID(s).
`,
    {
      image: SingleLocalImageSchema
        .describe("A single local image configuration object. Each object should include imagePath or imageData, coordinates, and optional properties for an image.")
        .optional(),
      images: BatchLocalImagesSchema
        .describe("An array of local image configuration objects. Each object should include imagePath or imageData, coordinates, and optional properties for an image.")
        .optional(),
    },
    {
      title: "Insert Local Image(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          image: {
            imagePath: "/path/to/image.png",
            x: 100,
            y: 200,
            width: 300,
            height: 150,
            name: "Sample Image"
          }
        },
        {
          images: [
            { imagePath: "/path/to/image1.png", x: 10, y: 20 },
            { imageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...", x: 50, y: 60 }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "Each image must have either imagePath or imageData.",
        "Width and height must be positive if specified.",
        "If parentId is invalid, the image will be added to the root.",
        "Image data must be a valid file or base64 string."
      ],
      extraInfo: "Supports both file path and base64 data URI for local image insertion. Batch insertion is efficient for adding multiple local images at once."
    },
    async (args): Promise<any> => {
      try {
        let imagesArr;
        if (args.images) {
          imagesArr = args.images;
        } else if (args.image) {
          imagesArr = [args.image];
        } else {
          throw new Error("You must provide either 'image' or 'images' as input.");
        }
        const results = await processBatch(
          imagesArr,
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
        const nodeIds = results.map(r => r.result).filter(Boolean);
        if (nodeIds.length === 1) {
          return { content: [{ type: "text", text: `Inserted local image ${nodeIds[0]}` }] };
        } else {
          return { content: [{ type: "text", text: `Inserted local images: ${nodeIds.join(", ")}` }] };
        }
      } catch (err) {
        return handleToolError(err, "image-creation-tools", "insert_local_image") as any;
      }
    }
  );
}
