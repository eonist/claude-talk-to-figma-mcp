import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getStyledTextSegmentsSchema, scanTextNodesSchema } from "./schema/text-analysis-schema.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { logger } from "../../../utils/logger.js";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";


/**
 * Registers advanced text analysis and inspection tools with the MCP server.
 * 
 * Provides comprehensive text node analysis capabilities including style segmentation
 * and hierarchical text node discovery for complex Figma documents.
 * 
 * @param server - The MCP server instance to register analysis tools on
 * @param figmaClient - The Figma client instance for executing read-only analysis commands
 * 
 * @description
 * Registered analysis tools:
 * - `GET_STYLED_TEXT_SEGMENTS`: Analyzes text styling variations within a single text node
 * - `SCAN_TEXT_NODES`: Recursively discovers all text nodes within a container
 * 
 * Both tools are read-only and safe for production use without modification risks.
 * 
 * @example
 * ```
 * // Analyze font size variations in a text node
 * await server.call('GET_STYLED_TEXT_SEGMENTS', {
 *   nodeId: "123:456",
 *   property: "fontSize"
 * });
 * // Returns: segments with different font sizes and their character ranges
 * 
 * // Find all text nodes in a frame
 * await server.call('SCAN_TEXT_NODES', {
 *   nodeId: "789:012"
 * });
 * // Returns: complete inventory of descendant text nodes with metadata
 * ```
 * 
 * @performance
 * - Styled segments analysis: O(n) where n = character count
 * - Text node scanning: O(m) where m = total descendant nodes
 * - Large documents use automatic chunking (10 nodes per chunk)
 * 
 * @throws {Error} When target node doesn't exist or is inaccessible
 * @throws {Error} When style property is unsupported for segmentation
 * 
 * @since 1.0.0
 */
export function registerTextAnalysisTools(server: McpServer, figmaClient: FigmaClient) {
  // Get Styled Text Segments
  server.tool(
    MCP_COMMANDS.GET_STYLED_TEXT_SEGMENTS,
    `Get text segments with specific styling in a text node.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the styled text segments as JSON.
`,
    {
      ...getStyledTextSegmentsSchema,
    },
    {
      title: "Get Styled Text Segments",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456", property: "fontSize" }
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid text node.",
        "property must be a supported style property.",
        "Returns an error if the node is not a text node."
      ],
      extraInfo: "Use this command to analyze style runs within a text node for advanced formatting."
    },
    async ({ nodeId, property }) => {
      try {
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Getting styled text segments for node ID: ${nodeIdString}`);
        const result = await figmaClient.executeCommand(MCP_COMMANDS.GET_STYLED_TEXT_SEGMENTS, {
          nodeId: nodeIdString,
          property
        });
        const resultsArr = Array.isArray(result) ? result : [result];
        const response = { success: true, results: resultsArr };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response)
            }
          ]
        };
      } catch (error) {
        const response = {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
            results: [],
            meta: {
              operation: "get_styled_text_segments",
              params: { nodeId, property }
            }
          }
        };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response)
            }
          ]
        };
      }
    }
  );

  // Scan Text Nodes
  server.tool(
    MCP_COMMANDS.SCAN_TEXT_NODES,
    `Scan all text nodes in the selected Figma node.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the scan status and results.
`,
    {
      ...scanTextNodesSchema,
    },
    {
      title: "Scan Text Nodes",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456" }
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma node ID.",
        "Large nodes may take longer to scan.",
        "Returns a summary and all found text nodes."
      ],
      extraInfo: "Scans all descendant text nodes for content and style analysis."
    },
    async ({ nodeId }) => {
      try {
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Scanning text nodes for node ID: ${nodeIdString}`);
        const result = await figmaClient.executeCommand(MCP_COMMANDS.SCAN_TEXT_NODES, {
          nodeId: nodeIdString,
          useChunking: true,
          chunkSize: 10
        });
        const resultsArr = Array.isArray(result) ? result : [result];
        const response = { success: true, results: resultsArr };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response)
            }
          ]
        };
      } catch (error) {
        const response = {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
            results: [],
            meta: {
              operation: "scan_text_nodes",
              params: { nodeId }
            }
          }
        };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response)
            }
          ]
        };
      }
    }
  );
}
