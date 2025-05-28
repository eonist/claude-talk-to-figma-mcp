import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { getSvgVectorSchema } from "./schema/svg-vector-schema.js";

/**
 * Registers SVG vector extraction tools on the MCP server.
 * 
 * This function adds the "get_svg_vector" tool to the MCP server, enabling extraction
 * of SVG markup from existing vector nodes in Figma. Supports both single node and
 * batch extraction operations. The tool validates node types and ensures only
 * vector-compatible nodes are processed.
 * 
 * @param {McpServer} server - The MCP server instance where the tool will be registered
 * @param {FigmaClient} figmaClient - The Figma client instance for API communication
 * 
 * @returns {void} This function does not return a value
 * 
 * @example
 * ```
 * // Register the SVG vector extraction tool
 * registerSvgVectorTool(server, figmaClient);
 * 
 * // Extract SVG from a single node
 * const result = await server.callTool('get_svg_vector', {
 *   nodeId: '123:456'
 * });
 * 
 * // Extract SVG from multiple nodes
 * const batchResult = await server.callTool('get_svg_vector', {
 *   nodeIds: ['123:456', '789:101', '112:131']
 * });
 * ```
 * 
 * @throws {Error} When provided node IDs are invalid or malformed
 * @throws {Error} When nodes are not found in the Figma document
 * @throws {Error} When nodes are not vector-compatible types
 * @throws {Error} When SVG export operations fail
 * 
 * @see {@link MCP_COMMANDS.GET_SVG_VECTOR} for the command constant
 * @see {@link getSvgVectorSchema} for input validation schema
 * 
 * @since 1.0.0
 */
export function registerSvgVectorTool(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.GET_SVG_VECTOR,
    `Get SVG markup for one or more vector nodes.

Returns:
  - Array of { nodeId, svg } objects, one per node.
`,
    {
      ...getSvgVectorSchema,
      ...getSvgVectorSchema,
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
