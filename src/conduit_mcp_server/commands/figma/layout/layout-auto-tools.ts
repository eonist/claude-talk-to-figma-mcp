import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { SetAutoLayoutSchema } from "./schema/layout-auto-schema.js";

export function registerLayoutAutoTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.SET_AUTO_LAYOUT,
    `Set, update, or delete one or more layout grids on Figma nodes (FRAME, COMPONENT, INSTANCE).

Returns: Array of result objects for each operation.`,
    SetAutoLayoutSchema.shape,
    {
      title: "Set Auto Layout",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { 
          layout: { 
            nodeId: "123:456", 
            mode: "HORIZONTAL", 
            layoutWrap: "WRAP",
            itemSpacing: 15,
            padding: { top: 20, right: 20, bottom: 20, left: 20 }
          } 
        }
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma node ID.",
        "mode must be 'HORIZONTAL', 'VERTICAL', or 'NONE'.",
        "layoutWrap must be 'NO_WRAP' or 'WRAP'."
      ],
      extraInfo: "Applies auto-layout settings to Figma frames with support for wrapping."
    },
    async (params: any) => {
      try {
        const response = await figmaClient.executeCommand(MCP_COMMANDS.SET_AUTO_LAYOUT, params);
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      } catch (error: any) {
        const errorResponse = {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
            results: [],
            meta: {
              operation: "set_auto_layout",
              params: params
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(errorResponse) }] };
      }
    }
  );
}
