import { GetTextStyleParams } from "../../../types/command-params";
import { FigmaClient } from "../../../clients/figma-client";
import { CommandResult } from "../../../types/commands";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * get_text_style: Extracts text style properties from one or more nodes.
 * Supports single or batch node extraction.
 */
export async function get_text_style(
  client: FigmaClient,
  params: GetTextStyleParams
): Promise<CommandResult> {
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
      const nodeInfo = await client.getNodeInfo(nodeId);
      if (!nodeInfo || !nodeInfo.node) {
        results.push({ nodeId, error: "Node not found" });
        continue;
      }
      const node = nodeInfo.node;
      if (node.type !== "TEXT") {
        results.push({ nodeId, error: "Node is not a text node" });
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

      results.push({ nodeId, textStyle });
    } catch (err: any) {
      results.push({ nodeId, error: "Unexpected error: " + (err && err.message ? err.message : String(err)) });
    }
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(results)
      }
    ]
  };
}

/**
 * Registers the get_text_style tool with the MCP server.
 */
export function registerTextStyleTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool("get_text_style", async (params: GetTextStyleParams) =>
    get_text_style(figmaClient, params)
  );
}
