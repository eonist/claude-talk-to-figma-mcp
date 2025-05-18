import { GetImageParams } from "../../../types/command-params";
import { FigmaClient } from "../../../clients/figma-client";
import { CommandResult } from "../../../types/commands";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * get_image: Extracts image fills or exports nodes as images.
 * Supports single or batch node extraction.
 */
export async function get_image(
  client: FigmaClient,
  params: GetImageParams
): Promise<CommandResult> {
  const { nodeId, nodeIds, fillIndex = 0 } = params;
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

  // TODO: Implement logic to extract image fills or export as PNG/JPG.
  // For each node:
  // - If node has image fill, extract image data and mimeType.
  // - If not, optionally export as PNG/JPG.
  // - Return { nodeId, imageData, mimeType, [fillIndex], [error] }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          ids.map(id => ({
            nodeId: id,
            error: "Not yet implemented"
          }))
        )
      }
    ]
  };
}

/**
 * Registers the get_image tool with the MCP server.
 */
export function registerImageTools(server: McpServer, figmaClient: FigmaClient) {
  server.registerTool("get_image", async (params: GetImageParams) =>
    get_image(figmaClient, params)
  );
}
