/**
 * Figma READ command registrations for the MCP server.
 *
 * Adds tools for retrieving document, selection, node, style, and component data.
 *
 * @module commands/figma/read
 * @param {McpServer} server - The MCP server instance.
 * @param {FigmaClient} figmaClient - The Figma client instance.
 * @example
 * import { registerReadCommands } from './read.js';
 * registerReadCommands(server, figmaClient);
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FigmaClient } from "../../clients/figma-client/index.js";
import { logger } from "../../utils/logger.js";
import { filterFigmaNode } from "../../utils/figma/filter-node.js";
import { ensureNodeIdIsString } from "../../utils/node-utils.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";

/**
 * Registers read commands for the MCP server
 * 
 * These commands handle operations that retrieve data from Figma, including:
 * - Document information
 * - Selection information
 * - Node information
 * - Style information
 * - Component information
 * 
 * @param {McpServer} server - The MCP server instance
 * @param {FigmaClient} figmaClient - The Figma client instance
 */
/**
 * Registers read commands for the MCP server:
 * - get_document_info: Retrieves detailed document metadata
 * - get_selection: Retrieves current selection state
 * - get_node_info: Retrieves details for a specific node
 * - get_nodes_info: Retrieves details for multiple nodes
 * - get_styles: Retrieves all paint and text styles
 * - get_local_components: Retrieves all local components
 * - get_remote_components: Retrieves team library components
 * - get_styled_text_segments: Retrieves styled segments within a text node
 * - scan_text_nodes: Scans all text nodes under a given node with optional chunking
 *
 * @param {McpServer} server - The MCP server instance
 * @param {FigmaClient} figmaClient - The Figma client instance
 */
export function registerReadCommands(server: McpServer, figmaClient: FigmaClient) {
  /**
   * Get Document Info Tool
   *
   * Retrieves detailed information about the current Figma document.
   */
  server.tool(
    "get_document_info",
    `Get detailed information about the current Figma document.

Returns:
  - content: Array containing a text message with the document info as JSON.
`,
    {},
    {
      title: "Get Document Info",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {}
      ]),
      edgeCaseWarnings: [
        "Returns a large JSON object for complex documents.",
        "May include document-level metadata, pages, and settings.",
        "If the document is empty, the result may be minimal."
      ],
      extraInfo: "Use this command to retrieve the full structure and metadata of the current Figma document."
    },
    async () => {
      try {
        const result = await figmaClient.executeCommand("get_document_info");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting document info: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  /**
   * Get Selection Tool
   *
   * Retrieves information about the current selection in Figma.
   */
  server.tool(
    "get_selection",
    `Get information about the current selection in Figma.

Returns:
  - content: Array containing a text message with the selection info as JSON.
`,
    {},
    {
      title: "Get Selection",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {}
      ]),
      edgeCaseWarnings: [
        "Returns an empty array if nothing is selected.",
        "Selection info may include node IDs, types, and properties.",
        "If multiple nodes are selected, the result is an array."
      ],
      extraInfo: "Use this command to inspect the current selection context in the Figma document."
    },
    async () => {
      try {
        const result = await figmaClient.executeCommand("get_selection");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting selection: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  /**
   * Get Node Info Tool
   *
   * Retrieves detailed information about a specific node in Figma.
   */
  server.tool(
    "get_node_info",
    `Retrieves detailed information about a specific node in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the node info as JSON.
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("Node ID. Required. The unique Figma node ID to get information about. Must be a string in the format '123:456'. Example: '123:456'."),
    },
    {
      title: "Get Node Info",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456" }
      ]),
      edgeCaseWarnings: [
        "Returns an error if nodeId is invalid or not found.",
        "Result includes all properties of the node.",
        "Large nodes may return a large JSON object."
      ],
      extraInfo: "Use this command to inspect properties and metadata of a specific Figma node."
    },
    async ({ nodeId }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Getting node info for ID: ${nodeIdString}`);
        
        const result = await figmaClient.executeCommand("get_node_info", { nodeId: nodeIdString });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(filterFigmaNode(result))
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting node info: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  /**
   * Get Nodes Info Tool
   * 
   * Retrieves detailed information about multiple nodes in Figma.
   */
  server.tool(
    "get_nodes_info",
    `Retrieves detailed information about multiple nodes in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the nodes info as JSON.
`,
    {
      // Enforce array of Figma node IDs, each must match format
      nodeIds: z.array(
        z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .describe("Node ID. Each must be a string in the format '123:456'. Example: '123:456'.")
      )
      .min(1)
      .max(100)
      .describe("Node IDs. Required. Array of Figma node IDs to get information about. Must contain 1 to 100 items. Example: ['123:456', '789:101']."),
    },
    {
      title: "Get Nodes Info",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeIds: ["123:456", "789:101"] }
      ]),
      edgeCaseWarnings: [
        "Returns an error if any nodeId is invalid or not found.",
        "Result is an array of node info objects.",
        "Large requests may impact performance."
      ],
      extraInfo: "Batch version of get_node_info for inspecting multiple nodes at once."
    },
    async ({ nodeIds }) => {
      try {
        // Ensure all nodeIds are treated as strings and validate they're not objects
        const nodeIdStrings = nodeIds.map(nodeId => ensureNodeIdIsString(nodeId));
        logger.debug(`Getting info for ${nodeIdStrings.length} nodes`);
        
        const results = await figmaClient.executeCommand("get_nodes_info", { nodeIds: nodeIdStrings });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting nodes info: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Get Styles Tool
   *
   * Retrieves all styles from the current Figma document.
   */
  server.tool(
    "get_styles",
    `Retrieves all styles from the current Figma document.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the styles info as JSON.
`,
    {},
    {
      title: "Get Styles",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {}
      ]),
      edgeCaseWarnings: [
        "Returns an empty array if no styles exist.",
        "Result includes all color, text, and effect styles.",
        "Large documents may return a large JSON object."
      ],
      extraInfo: "Use this command to list all shared styles in the current Figma document."
    },
    async () => {
      try {
        const result = await figmaClient.executeCommand("get_styles");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting styles: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  /**
   * Get Local Components Tool
   *
   * Retrieves all local components from the current Figma document.
   */
  server.tool(
    "get_local_components",
    `Retrieves all local components from the current Figma document.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the local components info as JSON.
`,
    {},
    {
      title: "Get Local Components",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {}
      ]),
      edgeCaseWarnings: [
        "Returns an empty array if no local components exist.",
        "Result includes all local components in the document.",
        "Large documents may return a large JSON object."
      ],
      extraInfo: "Use this command to list all components defined in the current Figma document."
    },
    async () => {
      try {
        const result = await figmaClient.executeCommand("get_local_components");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting local components: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  /**
   * Get Remote Components Tool
   * 
   * Retrieves available components from team libraries in Figma.
   */
  server.tool(
    "get_remote_components",
    `Retrieves available components from team libraries in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the remote components info as JSON.
`,
    {},
    {
      title: "Get Team Components",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { team_id: "123456" }
      ]),
      edgeCaseWarnings: [
        "team_id is required.",
        "Pagination may be needed for large teams.",
        "Returns an error if the team ID is invalid."
      ],
      extraInfo: "Retrieves components from a Figma team library, supporting pagination."
    },
    async () => {
      try {
        const result = await figmaClient.executeCommand("get_remote_components");
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
              text: `Error getting remote components: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Get Styled Text Segments Tool
   *
   * Retrieves text segments with specific styling in a text node.
   */
  server.tool(
    "get_styled_text_segments",
    `Retrieves text segments with specific styling in a text node.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the styled text segments as JSON.
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("Node ID. Required. The unique Figma text node ID to analyze. Must be a string in the format '123:456'. Example: '123:456'."),
      // Restrict property to allowed style properties
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
      ]).describe("Style Property. Required. The style property to analyze segments by. Must be one of: fillStyleId, fontName, fontSize, textCase, textDecoration, textStyleId, fills, letterSpacing, lineHeight, fontWeight. Example: 'fontSize'."),
    },
    {
      title: "Get Remote Components",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {}
      ]),
      edgeCaseWarnings: [
        "Returns an empty array if no remote components are available.",
        "Result includes components from all linked team libraries.",
        "Network or permission errors may cause failure."
      ],
      extraInfo: "Lists components available from team libraries linked to the current document."
    },
    async ({ nodeId, property }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
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

  /**
   * Scan Text Nodes Tool
   * 
   * Scans all text nodes in the selected Figma node.
   */
  server.tool(
    "scan_text_nodes",
    `Scans all text nodes in the selected Figma node.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the scan status and results as JSON.
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("Node ID. Required. The unique Figma node ID to scan. Must be a string in the format '123:456'. Example: '123:456'."),
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
    async ({ nodeId }) => {
      try {
        // Initial response to indicate we're starting the process
        const initialStatus = {
          type: "text" as const,
          text: "Starting text node scanning. This may take a moment for large designs...",
        };

        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Scanning text nodes for node ID: ${nodeIdString}`);
        
        // Use the plugin's scan_text_nodes function with chunking flag
        const result = await figmaClient.executeCommand("scan_text_nodes", {
          nodeId: nodeIdString,
          useChunking: true,  // Enable chunking on the plugin side
          chunkSize: 10       // Process 10 nodes at a time
        });

        // If the result indicates chunking was used, format the response accordingly
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

        // If chunking wasn't used or wasn't reported in the result format, return the result as is
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

  /**
   * Get CSS Async Tool
   *
   * Retrieves CSS properties from a Figma node in various formats.
   */
  server.tool(
    "get_css_async",
    `Retrieves CSS properties from a Figma node in various formats.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the CSS properties as JSON.
`,
    {
      // Enforce Figma node ID format if provided
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .optional()
        .describe("Node ID. Optional. The unique Figma node ID to get CSS from. If provided, must be a string in the format '123:456'. Example: '123:456'."),
      // Restrict format to allowed CSS output types
      format: z.enum(["object","string","inline"])
        .optional()
        .describe('Format. Optional. The format to return CSS in: "object", "string", or "inline". Example: "string".'),
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
    async ({ nodeId, format }) => {
      try {
        const params: any = {};
        if (nodeId !== undefined) params.nodeId = ensureNodeIdIsString(nodeId);
        if (format !== undefined) params.format = format;
        const result = await figmaClient.executeCommand("get_css_async", params);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting CSS: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

}
