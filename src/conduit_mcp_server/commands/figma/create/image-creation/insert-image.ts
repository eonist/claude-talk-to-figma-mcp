import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { handleToolError } from "../../../../utils/error-handling.js";
import { SingleUnifiedImageSchema, BatchUnifiedImagesSchema } from "./image-schema.js";

/**
 * Registers the unified image insertion command on the MCP server.
 *
 * This function adds a tool named "insert_image" to the MCP server,
 * enabling insertion of single or multiple images from URLs, local file paths, or base64 data into Figma.
 * It validates inputs, executes corresponding Figma commands, and returns informative results.
 *
 * @param {McpServer} server - The MCP server instance to register the tool on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tool asynchronously.
 *
 * @example
 * registerUnifiedImageTool(server, figmaClient);
 */
export function registerUnifiedImageTool(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "insert_image",
    `Inserts one or more images into Figma. Each image can be specified by a remote URL, a local file path, or a base64 data URI. Accepts either a single image config (via 'image') or an array of configs (via 'images'). You can customize size, name, and parent node.

Input:
  - image: A single image configuration object.
  - images: An array of image configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the inserted image node ID(s).
`,
    {
      image: SingleUnifiedImageSchema
        .describe("A single image configuration object. Each object should include at least one of url, imagePath, or imageData, plus optional coordinates and properties.")
        .optional(),
      images: BatchUnifiedImagesSchema
        .describe("An array of image configuration objects. Each object should include at least one of url, imagePath, or imageData, plus optional coordinates and properties.")
        .optional(),
    },
    {
      title: "Insert Image(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          image: {
            url: "https://example.com/image.png",
            x: 100,
            y: 200,
            width: 300,
            height: 150,
            name: "Remote Image"
          }
        },
        {
          image: {
            imagePath: "/Users/youruser/Pictures/photo.jpg",
            x: 50,
            y: 60,
            width: 200,
            height: 200,
            name: "Local File Image"
          }
        },
        {
          image: {
            imageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
            x: 10,
            y: 20,
            width: 100,
            height: 100,
            name: "Base64 Image"
          }
        },
        {
          images: [
            { url: "https://example.com/image1.png", x: 0, y: 0, width: 100, height: 100, name: "Remote 1" },
            { imagePath: "/Users/youruser/Pictures/photo2.jpg", x: 120, y: 0, width: 100, height: 100, name: "Local 2" },
            { imageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...", x: 240, y: 0, width: 100, height: 100, name: "Base64 3" }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "Each image must have at least one of url, imagePath, or imageData.",
        "Width and height must be positive if specified.",
        "If parentId is invalid, the image will be added to the root.",
        "Network errors, invalid URLs, or invalid file paths will cause failure.",
        "Base64 data must be a valid image string."
      ],
      extraInfo: "Supports inserting images from remote URLs, local files, or base64 data. Batch insertion is efficient for adding multiple images at once."
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
            if (config.url) {
              // Remote image
              const node = await (figmaClient as any).insertImage(config);
              return node.id;
            } else if (config.imagePath || config.imageData) {
              // Local image
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
            } else {
              throw new Error("Each image must have at least one of url, imagePath, or imageData.");
            }
          }
        );
        const nodeIds = results.map(r => r.result).filter(Boolean);
        if (nodeIds.length === 1) {
          return { content: [{ type: "text", text: `Inserted image ${nodeIds[0]}` }] };
        } else {
          return { content: [{ type: "text", text: `Inserted images: ${nodeIds.join(", ")}` }] };
        }
      } catch (err) {
        return handleToolError(err, "image-creation-tools", "insert_image") as any;
      }
    }
  );
}
