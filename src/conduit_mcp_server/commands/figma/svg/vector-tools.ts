import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers get_svg_vector (single or batch) on the MCP server.
 */
export function registerSvgVectorTool(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.GET_SVG_VECTOR,
    `Get SVG markup for one or more vector nodes.

Returns:
  - Array of { nodeId, svg } objects, one per node.
`,
    {
      nodeId: z.string()
        .optional()
        .describe("The unique Figma node ID to extract SVG from. Provide either nodeId or nodeIds, not both."),
      nodeIds: z.array(z.string())
        .optional()
        .describe("An array of Figma node IDs to extract SVG from. Provide either nodeId or nodeIds, not both.")
    },
    {
      title: "Get SVG Vector (Unified)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456" },
        { nodeIds: ["123:456", "789:101"] }
      ]),
      edgeCaseWarnings: [
        "Returns an error if any nodeId is invalid, not found, or not a vector.",
        "Result is an array of { nodeId, svg } objects (even for single)."
      ],
      extraInfo: "Use this command to extract SVG markup from one or more vector nodes."
    },
    async ({ nodeId, nodeIds }) => {
      let ids: string[] = [];
      if (Array.isArray(nodeIds) && nodeIds.length > 0) {
        ids = nodeIds;
      } else if (nodeId) {
        ids = [nodeId];
      } else {
        return { content: [{ type: "text", text: "You must provide either nodeId or nodeIds." }] };
      }
      const results = [];
      for (const id of ids) {
        try {
          // Fetch node info
          const node = await figmaClient.executeCommand(MCP_COMMANDS.GET_NODE_INFO, { nodeId: id });
          if (!node) {
            results.push({
              nodeId: id,
              success: false,
              error: "Node not found",
              meta: { operation: "get_svg_vector", params: { nodeId: id } }
            });
            continue;
          }
          // Check if node is a vector or compatible type
          if (node.type !== "VECTOR" && node.type !== "LINE" && node.type !== "ELLIPSE" && node.type !== "POLYGON" && node.type !== "STAR" && node.type !== "RECTANGLE") {
            results.push({
              nodeId: id,
              success: false,
              error: `Node type ${node.type} is not a vector-compatible type`,
              meta: { operation: "get_svg_vector", params: { nodeId: id } }
            });
            continue;
          }
          // Use Figma's export API or plugin helper to get SVG markup
          const svgResult = await figmaClient.executeCommand(MCP_COMMANDS.EXPORT_NODE_AS_IMAGE, { nodeId: id, format: "SVG" });
          if (svgResult && svgResult.imageData) {
            results.push({
              nodeId: id,
              success: true,
              svg: svgResult.imageData
            });
          } else {
            results.push({
              nodeId: id,
              success: false,
              error: "SVG export failed",
              meta: { operation: "get_svg_vector", params: { nodeId: id } }
            });
          }
        } catch (error) {
          results.push({
            nodeId: id,
            success: false,
            error: error instanceof Error ? error.message : String(error),
            meta: { operation: "get_svg_vector", params: { nodeId: id } }
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
                  message: "All get_svg_vector operations failed",
                  results,
                  meta: {
                    operation: "get_svg_vector",
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
