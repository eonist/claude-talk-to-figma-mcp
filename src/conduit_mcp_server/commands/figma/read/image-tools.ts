import { GetImageParams } from "../../../types/command-params";
import { FigmaClient } from "../../../clients/figma-client";
import { CommandResult, MCP_COMMANDS } from "../../../types/commands";
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

  // Implement logic to extract image fills or export as PNG/JPG.
  // For each node:
  // - If node has image fill, extract image data and mimeType.
  // - If not, optionally export as PNG/JPG.
  // - Return { nodeId, imageData, mimeType, [fillIndex], [error] }

  const results: any[] = [];
  for (const nodeId of ids) {
    try {
      // Get node info from Figma
      const nodeInfo = await client.getNodeInfo(nodeId);
      if (!nodeInfo || !nodeInfo.node) {
        results.push({ nodeId, error: "Node not found" });
        continue;
      }
      const node = nodeInfo.node;

      // Check for image fill
      if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
        const fills = node.fills;
        const fill = fills[fillIndex] || fills[0];
        if (fill && fill.type === "IMAGE" && fill.imageHash) {
          try {
            const imageBytes = await client.getImageByHash(fill.imageHash);
            const mimeType = "image/png";
            const base64 = Buffer.from(imageBytes).toString("base64");
            results.push({
              nodeId,
              imageData: `data:${mimeType};base64,${base64}`,
              mimeType,
              fillIndex
            });
            continue;
          } catch (err: any) {
            results.push({ nodeId, fillIndex, error: "Failed to extract image fill: " + (err && err.message ? err.message : String(err)) });
            continue;
          }
        }
      }

      // If node is an IMAGE node (rare, but possible)
      if (node.type === "IMAGE" && node.imageHash) {
        try {
          const imageBytes = await client.getImageByHash(node.imageHash);
          const mimeType = "image/png";
          const base64 = Buffer.from(imageBytes).toString("base64");
          results.push({
            nodeId,
            imageData: `data:${mimeType};base64,${base64}`,
            mimeType
          });
          continue;
        } catch (err: any) {
          results.push({ nodeId, error: "Failed to extract IMAGE node: " + (err && err.message ? err.message : String(err)) });
          continue;
        }
      }

      // Fallback: export node as PNG
      try {
        const pngBytes = await client.exportNodeAsImage(nodeId, "PNG");
        const mimeType = "image/png";
        const base64 = Buffer.from(pngBytes).toString("base64");
        results.push({
          nodeId,
          imageData: `data:${mimeType};base64,${base64}`,
          mimeType,
          error: "No image fill found, node rasterized"
        });
      } catch (err: any) {
        results.push({ nodeId, error: "Failed to export node as PNG: " + (err && err.message ? err.message : String(err)) });
      }
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
 * Registers the get_image tool with the MCP server.
 */
export function registerImageTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(MCP_COMMANDS.GET_IMAGE, async (params: GetImageParams) =>
    get_image(figmaClient, params)
  );
}
