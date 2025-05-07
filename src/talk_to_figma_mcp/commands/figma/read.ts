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
import { FigmaClient } from "../../clients/figma-client.js";
import { logger } from "../../utils/logger.js";
import { filterFigmaNode } from "../../utils/node-filter.js";
import { ensureNodeIdIsString } from "../../utils/node-utils.js";

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
    "Get detailed information about the current Figma document",
    {},
    async () => {
      try {
        const result = await figmaClient.getDocumentInfo();
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
    "Get information about the current selection in Figma",
    {},
    async () => {
      try {
        const result = await figmaClient.getSelection();
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
    "Get detailed information about a specific node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to get information about"),
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
    "Get detailed information about multiple nodes in Figma",
    {
      nodeIds: z.array(z.string()).describe("Array of node IDs to get information about")
    },
    async ({ nodeIds }) => {
      try {
        // Ensure all nodeIds are treated as strings and validate they're not objects
        const nodeIdStrings = nodeIds.map(nodeId => ensureNodeIdIsString(nodeId));
        logger.debug(`Getting info for ${nodeIdStrings.length} nodes`);
        
        const results = await figmaClient.getNodesInfo(nodeIdStrings);
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
    "Get all styles from the current Figma document",
    {},
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
    "Get all local components from the Figma document",
    {},
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
    "Get available components from team libraries in Figma",
    {},
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
    "Get text segments with specific styling in a text node",
    {
      nodeId: z.string().describe("The ID of the text node to analyze"),
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
      ]).describe("The style property to analyze segments by"),
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
    "Scan all text nodes in the selected Figma node",
    {
      nodeId: z.string().describe("ID of the node to scan"),
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

}
