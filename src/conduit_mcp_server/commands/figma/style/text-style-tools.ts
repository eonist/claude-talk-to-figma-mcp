import { GetTextStyleParams } from "../../../types/command-params.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * get_text_style: Extracts text style properties from one or more nodes.
 * Supports single or batch node extraction.
 */
export async function get_text_style(
  client: FigmaClient,
  params: GetTextStyleParams
): Promise<any> {
  const { nodeId, nodeIds } = params;
  const ids: string[] = [];
  if (nodeId) ids.push(nodeId);
  if (nodeIds && Array.isArray(nodeIds)) ids.push(...nodeIds);

  if (ids.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify([
            { error: "At least one of nodeId or nodeIds is required." }
          ])
        }
      ]
    };
  }

  const results: any[] = [];
  for (const nodeId of ids) {
    try {
      const nodeInfo = await client.executeCommand(MCP_COMMANDS.GET_NODE_INFO, { nodeId });
      if (!nodeInfo || !nodeInfo.node) {
        results.push({
          nodeId,
          success: false,
          error: "Node not found",
          meta: { operation: MCP_COMMANDS.GET_TEXT_STYLE, params: { nodeId } }
        });
        continue;
      }
      const node = nodeInfo.node;
      if (node.type !== "TEXT") {
        results.push({
          nodeId,
          success: false,
          error: "Node is not a text node",
          meta: { operation: MCP_COMMANDS.GET_TEXT_STYLE, params: { nodeId } }
        });
        continue;
      }
      // Extract text style properties
      const textStyle: any = {};
      if ("fontName" in node) textStyle.fontName = node.fontName;
      if ("fontSize" in node) textStyle.fontSize = node.fontSize;
      if ("fontWeight" in node) textStyle.fontWeight = node.fontWeight;
      if ("letterSpacing" in node) textStyle.letterSpacing = node.letterSpacing;
      if ("lineHeight" in node) textStyle.lineHeight = node.lineHeight;
      if ("paragraphSpacing" in node) textStyle.paragraphSpacing = node.paragraphSpacing;
      if ("textCase" in node) textStyle.textCase = node.textCase;
      if ("textDecoration" in node) textStyle.textDecoration = node.textDecoration;
      if ("textStyleId" in node) textStyle.textStyleId = node.textStyleId;
      // Add more as needed

      results.push({
        nodeId,
        success: true,
        textStyle
      });
    } catch (err: any) {
      results.push({
        nodeId,
        success: false,
        error: "Unexpected error: " + (err && err.message ? err.message : String(err)),
        meta: { operation: "get_text_style", params: { nodeId } }
      });
    }
  }

  const anySuccess = results.some(r => r.success);
  if (anySuccess) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ success: true, results })
        }
      ]
    };
  } else {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: false,
            error: {
              message: "All " + MCP_COMMANDS.GET_TEXT_STYLE + " operations failed",
              results,
              meta: {
                operation: MCP_COMMANDS.GET_TEXT_STYLE,
                params: ids
              }
            }
          })
        }
      ]
    };
  }
}

/**
 * Registers the get_text_style tool with the MCP server.
 */
import { z } from "zod";

export function registerTextStyleTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.GET_TEXT_STYLE,
    {
      nodeId: z.string().optional().describe("The ID of a single node to extract text style from. Optional."),
      nodeIds: z.array(z.string()).optional().describe("An array of node IDs to extract text style from in batch. Optional.")
    },
    async ({ nodeId, nodeIds }) => {
      const ids: string[] = [];
      if (nodeId) ids.push(nodeId);
      if (nodeIds && Array.isArray(nodeIds)) ids.push(...nodeIds);

      if (ids.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify([
                { error: "At least one of nodeId or nodeIds is required." }
              ])
            }
          ]
        };
      }

      const results: any[] = [];
      for (const nodeId of ids) {
        try {
          const nodeInfo = await figmaClient.executeCommand(MCP_COMMANDS.GET_NODE_INFO, { nodeId });
          if (!nodeInfo || !nodeInfo.node) {
            results.push({
              nodeId,
              success: false,
              error: "Node not found",
              meta: { operation: "get_text_style", params: { nodeId } }
            });
            continue;
          }
          const node = nodeInfo.node;
          if (node.type !== "TEXT") {
            results.push({
              nodeId,
              success: false,
              error: "Node is not a text node",
              meta: { operation: "get_text_style", params: { nodeId } }
            });
            continue;
          }
          // Extract text style properties
          const textStyle: any = {};
          if ("fontName" in node) textStyle.fontName = node.fontName;
          if ("fontSize" in node) textStyle.fontSize = node.fontSize;
          if ("fontWeight" in node) textStyle.fontWeight = node.fontWeight;
          if ("letterSpacing" in node) textStyle.letterSpacing = node.letterSpacing;
          if ("lineHeight" in node) textStyle.lineHeight = node.lineHeight;
          if ("paragraphSpacing" in node) textStyle.paragraphSpacing = node.paragraphSpacing;
          if ("textCase" in node) textStyle.textCase = node.textCase;
          if ("textDecoration" in node) textStyle.textDecoration = node.textDecoration;
          if ("textStyleId" in node) textStyle.textStyleId = node.textStyleId;
          // Add more as needed

          results.push({
            nodeId,
            success: true,
            textStyle
          });
        } catch (err: any) {
          results.push({
            nodeId,
            success: false,
            error: "Unexpected error: " + (err && err.message ? err.message : String(err)),
            meta: { operation: "get_text_style", params: { nodeId } }
          });
        }
      }

      const anySuccess = results.some(r => r.success);
      if (anySuccess) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, results })
            }
          ]
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                error: {
                  message: "All get_text_style operations failed",
                  results,
                  meta: {
                    operation: "get_text_style",
                    params: ids
                  }
                }
              })
            }
          ]
        };
      }
    }
  );
}
