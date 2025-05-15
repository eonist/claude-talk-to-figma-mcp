import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FigmaClient } from "../../../clients/figma-client/index.js";
import { logger } from "../../../utils/logger.js";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers text analysis read commands:
 * - get_styled_text_segments
 * - scan_text_nodes
 */
export function registerTextAnalysisTools(server: McpServer, figmaClient: FigmaClient) {
  // Get Styled Text Segments
  server.tool(
    "get_styled_text_segments",
    `Get text segments with specific styling in a text node.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the styled text segments as JSON.
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma text node ID to analyze. Must be a string in the format '123:456'."),
      property: z.enum([
        "fillStyleId", 
        "fontName", 
        "fontSize", 
        "textCase", 
        "textDecoration", 
        "textStyleId", 
        "fills", 
        "letterSpacing", 
        "lineHeight", 
        "fontWeight"
      ]).describe("The style property to analyze segments by. Must be one of the allowed style property names."),
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
        const result = await figmaClient.executeCommand("get_styled_text_segments", {
          nodeId: nodeIdString,
          property
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting styled text segments: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Scan Text Nodes
  server.tool(
    "scan_text_nodes",
    `Scan all text nodes in the selected Figma node.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the scan status and results.
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to scan. Must be a string in the format '123:456'."),
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
        const initialStatus = {
          type: "text" as const,
          text: "Starting text node scanning. This may take a moment for large designs...",
        };
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Scanning text nodes for node ID: ${nodeIdString}`);
        const result = await figmaClient.executeCommand("scan_text_nodes", {
          nodeId: nodeIdString,
          useChunking: true,
          chunkSize: 10
        });
        if (result && typeof result === 'object' && 'chunks' in result) {
          const typedResult = result as {
            success: boolean,
            totalNodes: number,
            processedNodes: number,
            chunks: number,
            textNodes: Array<any>
          };
          const summaryText = `
          Scan completed:
          - Found ${typedResult.totalNodes} text nodes
          - Processed in ${typedResult.chunks} chunks
          `;
          return {
            content: [
              initialStatus,
              {
                type: "text" as const,
                text: summaryText
              },
              {
                type: "text" as const,
                text: JSON.stringify(typedResult.textNodes, null, 2)
              }
            ],
          };
        }
        return {
          content: [
            initialStatus,
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error scanning text nodes: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}
