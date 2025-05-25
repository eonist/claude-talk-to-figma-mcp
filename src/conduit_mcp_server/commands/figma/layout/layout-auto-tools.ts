import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Enhanced Zod schema for auto layout configuration with wrap support.
 */
const AutoLayoutConfigSchemaWithWrap = z.object({
  nodeId: z.string()
    .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
    .describe("The unique Figma node ID to update."),
  layoutMode: z.enum(["HORIZONTAL", "VERTICAL", "NONE"])
    .describe('The auto layout mode to set: "HORIZONTAL", "VERTICAL", or "NONE".'),
  layoutWrap: z.enum(["NO_WRAP", "WRAP"]).optional()
    .describe('The layout wrap mode: "NO_WRAP" or "WRAP". Optional.'),
  itemSpacing: z.number().optional()
    .describe("Spacing between items in pixels. Optional."),
  paddingTop: z.number().optional()
    .describe("Top padding in pixels. Optional."),
  paddingRight: z.number().optional()
    .describe("Right padding in pixels. Optional."),
  paddingBottom: z.number().optional()
    .describe("Bottom padding in pixels. Optional."),
  paddingLeft: z.number().optional()
    .describe("Left padding in pixels. Optional."),
});

/**
 * Registers the set_auto_layout tool with the MCP server.
 */
export function registerLayoutAutoTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.SET_AUTO_LAYOUT,
    `Set, update, or delete one or more layout grids on Figma nodes (FRAME, COMPONENT, INSTANCE).

Returns: Array of result objects for each operation.`,
    {
      layout: z.object({
        nodeId: z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID" })
          .describe("The unique Figma node ID to update."),
        mode: z.enum(["HORIZONTAL", "VERTICAL", "NONE"])
          .describe('The auto layout mode to set: "HORIZONTAL", "VERTICAL", or "NONE".'),
        layoutWrap: z.enum(["NO_WRAP", "WRAP"]).optional()
          .describe('The layout wrap mode: "NO_WRAP" or "WRAP". Optional.'),
        itemSpacing: z.number().optional()
          .describe("Spacing between items in pixels. Optional."),
        padding: z.object({
          top: z.number().optional().describe("Top padding in pixels. Optional."),
          right: z.number().optional().describe("Right padding in pixels. Optional."),
          bottom: z.number().optional().describe("Bottom padding in pixels. Optional."),
          left: z.number().optional().describe("Left padding in pixels. Optional."),
        }).optional().describe("Padding object with top, right, bottom, left properties. Optional."),
      }).optional().describe("A single auto-layout configuration. Optional."),
    },
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
    async (params) => {
      try {
        const response = await figmaClient.executeCommand(MCP_COMMANDS.SET_AUTO_LAYOUT, params);
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      } catch (error) {
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
