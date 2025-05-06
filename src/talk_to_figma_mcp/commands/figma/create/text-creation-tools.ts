import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";

/**
 * Registers text-creation-related commands:
 * - create_text
 * - create_bounded_text
 */
export function registerTextCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  // Create Text Tool
  server.tool(
    "create_text",
    "Create a new text element in Figma",
    {
      x: z.number(), y: z.number(),
      text: z.string(),
      fontSize: z.number().optional(),
      fontWeight: z.number().optional(),
      fontColor: z.any().optional(),
      name: z.string().optional(),
      parentId: z.string().optional()
    },
    async ({ x, y, text, fontSize, fontWeight, fontColor, name, parentId }) => {
      const params: any = { x, y, text, fontSize, fontWeight, fontColor, name, parentId };
      const node = await figmaClient.createText(params);
      return { content: [{ type: "text", text: `Created text ${node.id}` }] };
    }
  );

  // Create Bounded Text Tool
  server.tool(
    "create_bounded_text",
    "Create a bounded text box in Figma",
    {
      x: z.number(), y: z.number(),
      width: z.number(), height: z.number(),
      text: z.string(),
      fontSize: z.number().optional(),
      fontWeight: z.number().optional(),
      fontColor: z.any().optional(),
      name: z.string().optional(),
      parentId: z.string().optional()
    },
    async ({ x, y, width, height, text, fontSize, fontWeight, fontColor, name, parentId }) => {
      const params: any = { x, y, width, height, text, fontSize, fontWeight, fontColor, name, parentId };
      const node = await figmaClient.executeCommand("create_bounded_text", params);
      return { content: [{ type: "text", text: `Created bounded text ${node.id}` }] };
    }
  );
}
