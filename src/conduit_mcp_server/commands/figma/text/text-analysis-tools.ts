import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getStyledTextSegmentsSchema, scanTextNodesSchema } from "./schema/text-analysis-schema.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { logger } from "../../../utils/logger.js";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";

/**
 * Registers text analysis read commands:
 * - get_styled_text_segments
 * - scan_text_nodes
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
