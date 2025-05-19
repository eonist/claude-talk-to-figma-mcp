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

Input:
  - nodeId: (optional) The unique Figma vector node ID to extract SVG from (for single).
  - nodeIds: (optional) Array of vector node IDs to extract SVG from (for batch).

At least one of nodeId or nodeIds is required.

Returns:
  - Array of { nodeId, svg } objects, one per node.

Examples:
  // Single
  { nodeId: "123:456" }
  // Batch
  { nodeIds: ["123:456", "789:101"] }
`,
    {
      nodeId: z.string().optional(),
      nodeIds: z.array(z.string()).optional()
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
          const node = await figmaClient.executeCommand("get_node_info", { nodeId: id });
          if (!node) {
            results.push({ nodeId: id, error: "Node not found" });
            continue;
          }
          // Check if node is a vector or compatible type
          if (node.type !== "VECTOR" && node.type !== "LINE" && node.type !== "ELLIPSE" && node.type !== "POLYGON" && node.type !== "STAR" && node.type !== "RECTANGLE") {
            results.push({ nodeId: id, error: `Node type ${node.type} is not a vector-compatible type` });
            continue;
          }
          // Use Figma's export API or plugin helper to get SVG markup
          // Here we assume a backend helper or plugin command exists; otherwise, this is a stub
          const svgResult = await figmaClient.executeCommand("export_node_as_image", { nodeId: id, format: "SVG" });
          if (svgResult && svgResult.imageData) {
            results.push({ nodeId: id, svg: svgResult.imageData });
          } else {
            results.push({ nodeId: id, error: "SVG export failed" });
          }
        } catch (error) {
          results.push({ nodeId: id, error: error instanceof Error ? error.message : String(error) });
        }
      }
      return { content: [{ type: "text", text: JSON.stringify(results) }] };
    }
  );
}
