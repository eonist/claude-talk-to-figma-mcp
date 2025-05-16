import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { ImageFromUrlSchema, SingleImageFromUrlSchema, BatchImagesFromUrlSchema } from "./image-schema.js";

/**
 * Registers image insertion commands on the MCP server.
 *
 * This function adds tools named "insert_image" and "insert_images" to the MCP server,
 * enabling insertion of single or multiple images from URLs into Figma.
 * It validates inputs, executes corresponding Figma commands, and returns informative results.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerFromUrlImageTools(server, figmaClient);
 */
export function registerFromUrlImageTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified image insertion (single or batch)
  server.tool(
    "insert_image",
    `Inserts one or more images from URLs into Figma. Accepts either a single image config (via 'image') or an array of configs (via 'images'). You can customize size, name, and parent node.

Input:
  - image: A single image configuration object.
  - images: An array of image configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the inserted image node ID(s).
`,
    {
      image: SingleImageFromUrlSchema
        .describe("A single image configuration object. Each object should include URL, coordinates, and optional properties for an image.")
        .optional(),
      images: BatchImagesFromUrlSchema
        .describe("An array of image configuration objects. Each object should include URL, coordinates, and optional properties for an image.")
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
            name: "Sample Image"
          }
        },
        {
          images: [
            { url: "https://example.com/image1.png", x: 10, y: 20 },
            { url: "https://example.com/image2.png", x: 50, y: 60 }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "URL must point to a valid image file.",
        "Width and height must be positive if specified.",
        "If parentId is invalid, the image will be added to the root.",
        "Network errors or invalid URLs will cause failure."
      ],
      extraInfo: "Supports inserting images from remote URLs with custom size and position. Batch insertion is efficient for adding multiple remote images at once."
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
          async (cfg) => (figmaClient as any).insertImage(cfg).then((node: any) => node.id)
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
