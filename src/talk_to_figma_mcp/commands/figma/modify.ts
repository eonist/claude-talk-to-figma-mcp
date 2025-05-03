import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FigmaClient } from "../../clients/figma-client.js";
import { logger } from "../../utils/logger.js";
import { ensureNodeIdIsString } from "../../utils/node-utils.js";

/**
 * Registers modify commands for the MCP server
 * 
 * These commands handle operations that modify existing elements in Figma, including:
 * - Moving nodes
 * - Resizing nodes
 * - Deleting nodes
 * - Setting fill and stroke colors
 * - Setting corner radius
 * - Cloning nodes
 * - Setting text content
 * - Styling operations
 * 
 * @param {McpServer} server - The MCP server instance
 * @param {FigmaClient} figmaClient - The Figma client instance
 */
export function registerModifyCommands(server: McpServer, figmaClient: FigmaClient) {

  /**
   * Set Fill Color Tool
   *
   * Sets the fill color of a node in Figma, which can be a TextNode or FrameNode.
   */
  server.tool(
    "set_fill_color",
    "Set the fill color of a node in Figma can be TextNode or FrameNode",
    {
      nodeId: z.string().describe("The ID of the node to modify"),
      r: z.number().min(0).max(1).describe("Red component (0-1)"),
      g: z.number().min(0).max(1).describe("Green component (0-1)"),
      b: z.number().min(0).max(1).describe("Blue component (0-1)"),
      a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)"),
    },
    async ({ nodeId, r, g, b, a }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Setting fill color for node ID: ${nodeIdString}`);
        
        const result = await figmaClient.setFillColor({
          nodeId: nodeIdString,
          r,
          g,
          b,
          a
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Set fill color of node "${result.name}" to RGBA(${r}, ${g}, ${b}, ${a || 1})`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting fill color: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  /**
   * Set Stroke Color Tool
   *
   * Sets the stroke color of a node in Figma.
   */
  server.tool(
    "set_stroke_color",
    "Set the stroke color of a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to modify"),
      r: z.number().min(0).max(1).describe("Red component (0-1)"),
      g: z.number().min(0).max(1).describe("Green component (0-1)"),
      b: z.number().min(0).max(1).describe("Blue component (0-1)"),
      a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)"),
      weight: z.number().positive().optional().describe("Stroke weight"),
    },
    async ({ nodeId, r, g, b, a, weight }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Setting stroke color for node ID: ${nodeIdString}`);
        
        const result = await figmaClient.setStrokeColor({
          nodeId: nodeIdString,
          r,
          g,
          b,
          a,
          weight
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Set stroke color of node "${result.name}" to RGBA(${r}, ${g}, ${b}, ${a || 1}) with weight ${weight || 1}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting stroke color: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  /**
   * Move Node Tool
   *
   * Moves a node to a new position in Figma.
   */
  server.tool(
    "move_node",
    "Move a node to a new position in Figma",
    {
      nodeId: z.string().describe("The ID of the node to move"),
      x: z.number().describe("New X position"),
      y: z.number().describe("New Y position"),
    },
    async ({ nodeId, x, y }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Moving node with ID: ${nodeIdString} to position (${x}, ${y})`);
        
        const result = await figmaClient.moveNode({ 
          nodeId: nodeIdString, 
          x, 
          y 
        });
        return {
          content: [
            {
              type: "text",
              text: `Moved node "${result.name}" to position (${x}, ${y})`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error moving node: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  /**
   * Clone Node Tool
   * 
   * Clones an existing node in Figma.
   */
  server.tool(
    "clone_node",
    "Clone an existing node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to clone"),
      x: z.number().optional().describe("New X position for the clone"),
      y: z.number().optional().describe("New Y position for the clone")
    },
    async ({ nodeId, x, y }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Cloning node with ID: ${nodeIdString}${x !== undefined && y !== undefined ? ` to position (${x}, ${y})` : ''}`);
        
        const result = await figmaClient.cloneNode({ 
          nodeId: nodeIdString, 
          x, 
          y 
        });
        return {
          content: [
            {
              type: "text",
              text: `Cloned node "${result.name}" with new ID: ${result.id}${x !== undefined && y !== undefined ? ` at position (${x}, ${y})` : ''}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error cloning node: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Resize Node Tool
   * 
   * Resizes a node in Figma.
   */
  server.tool(
    "resize_node",
    "Resize a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to resize"),
      width: z.number().positive().describe("New width"),
      height: z.number().positive().describe("New height"),
    },
    async ({ nodeId, width, height }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Resizing node with ID: ${nodeIdString} to width ${width} and height ${height}`);
        
        const result = await figmaClient.resizeNode({ 
          nodeId: nodeIdString, 
          width, 
          height 
        });
        return {
          content: [
            {
              type: "text",
              text: `Resized node "${result.name}" to width ${width} and height ${height}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error resizing node: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  /**
   * Delete Node Tool
   * 
   * Deletes a node from Figma.
   */
  server.tool(
    "delete_node",
    "Delete a node from Figma",
    {
      nodeId: z.string().describe("The ID of the node to delete"),
    },
    async ({ nodeId }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Deleting node with ID: ${nodeIdString}`);
        
        await figmaClient.deleteNode(nodeIdString);
        return {
          content: [
            {
              type: "text",
              text: `Deleted node with ID: ${nodeIdString}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error deleting node: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  /**
   * Set Text Content Tool
   * 
   * Sets the text content of an existing text node in Figma.
   */
  server.tool(
    "set_text_content",
    "Set the text content of an existing text node in Figma",
    {
      nodeId: z.string().describe("The ID of the text node to modify"),
      text: z.string().describe("New text content"),
    },
    async ({ nodeId, text }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Setting text content for node ID: ${nodeIdString}`);
        
        const result = await figmaClient.setTextContent({ 
          nodeId: nodeIdString, 
          text 
        });
        return {
          content: [
            {
              type: "text",
              text: `Updated text content of node "${result.name}" to "${text}"`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting text content: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  /**
   * Set Multiple Text Contents Tool
   * 
   * Sets multiple text contents in parallel within a node.
   */
  server.tool(
    "set_multiple_text_contents",
    "Set multiple text contents parallelly in a node",
    {
      nodeId: z
        .string()
        .describe("The ID of the node containing the text nodes to replace"),
      text: z
        .array(
          z.object({
            nodeId: z.string().describe("The ID of the text node"),
            text: z.string().describe("The replacement text"),
          })
        )
        .describe("Array of text node IDs and their replacement texts"),
    },
    async ({ nodeId, text }) => {
      try {
        if (!text || text.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No text provided",
              },
            ],
          };
        }

        // Initial response to indicate we're starting the process
        const initialStatus = {
          type: "text" as const,
          text: `Starting text replacement for ${text.length} nodes. This will be processed in batches of 5...`,
        };

        // Ensure parent nodeId is treated as a string and validate it's not an object
        const parentNodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Setting multiple text contents for parent node ID: ${parentNodeIdString}`);
        
        // Also validate all node IDs in the text array
        const validatedTextNodes = text.map(item => ({
          nodeId: ensureNodeIdIsString(item.nodeId),
          text: item.text
        }));
        
        // Track overall progress
        let totalProcessed = 0;
        const totalToProcess = validatedTextNodes.length;

        // Use the plugin's set_multiple_text_contents function with chunking
        const result = await figmaClient.setMultipleTextContents({ 
          nodeId: parentNodeIdString, 
          text: validatedTextNodes 
        });

        // Format the results for display
        const success = result.replacementsApplied && result.replacementsApplied > 0;
        const progressText = `
        Text replacement completed:
        - ${result.replacementsApplied || 0} of ${totalToProcess} successfully updated
        - ${result.replacementsFailed || 0} failed
        - Processed in ${result.completedInChunks || 1} batches
        `;

        // Define type for result items
        interface ResultItem {
          success: boolean;
          nodeId: string;
          error?: string;
          originalText?: string;
          translatedText?: string;
        }

        // Detailed results
        const detailedResults = result.results || [] as ResultItem[];
        const failedResults = detailedResults.filter((item: ResultItem) => !item.success);

        // Create the detailed part of the response
        let detailedResponse = "";
        if (failedResults.length > 0) {
          detailedResponse = `\n\nNodes that failed:\n${failedResults.map((item: ResultItem) =>
            `- ${item.nodeId}: ${item.error || "Unknown error"}`
          ).join('\n')}`;
        }

        return {
          content: [
            initialStatus,
            {
              type: "text" as const,
              text: progressText + detailedResponse,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting multiple text contents: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  /**
   * Set Corner Radius Tool
   * 
   * Sets the corner radius of a node in Figma.
   */
  server.tool(
    "set_corner_radius",
    "Set the corner radius of a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to modify"),
      radius: z.number().min(0).describe("Corner radius value"),
      corners: z
        .array(z.boolean())
        .length(4)
        .optional()
        .describe(
          "Optional array of 4 booleans to specify which corners to round [topLeft, topRight, bottomRight, bottomLeft]"
        ),
    },
    async ({ nodeId, radius, corners }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Setting corner radius for node ID: ${nodeIdString}`);
        
        const result = await figmaClient.executeCommand("set_corner_radius", {
          nodeId: nodeIdString,
          radius,
          corners: corners || [true, true, true, true],
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Set corner radius of node "${result.name}" to ${radius}px`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting corner radius: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  /**
   * Export Node As Image Tool
   * 
   * Exports a node as an image from Figma.
   */
  server.tool(
    "export_node_as_image",
    "Export a node as an image from Figma",
    {
      nodeId: z.string().describe("The ID of the node to export"),
      format: z
        .enum(["PNG", "JPG", "SVG", "PDF"])
        .optional()
        .describe("Export format"),
      scale: z.number().positive().optional().describe("Export scale"),
    },
    async ({ nodeId, format, scale }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Exporting node ID: ${nodeIdString} as image`);
        
        const result = await figmaClient.exportNodeAsImage({
          nodeId: nodeIdString,
          format,
          scale
        });

        return {
          content: [
            {
              type: "image",
              data: result.imageData,
              mimeType: result.mimeType || "image/png",
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error exporting node as image: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  /**
   * Group Nodes Tool
   * 
   * Groups nodes in Figma.
   */
  server.tool(
    "group_nodes",
    "Group nodes in Figma",
    {
      nodeIds: z.array(z.string()).describe("Array of IDs of the nodes to group"),
      name: z.string().optional().describe("Optional name for the group")
    },
    async ({ nodeIds, name }) => {
      try {
        // Ensure all nodeIds are treated as strings and validate they're not objects
        const nodeIdStrings = nodeIds.map(nodeId => ensureNodeIdIsString(nodeId));
        logger.debug(`Grouping ${nodeIdStrings.length} nodes`);
        
        const result = await figmaClient.executeCommand("group_nodes", { 
          nodeIds: nodeIdStrings, 
          name 
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Nodes successfully grouped into "${result.name}" with ID: ${result.id}. The group contains ${result.children.length} elements.`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error grouping nodes: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Ungroup Nodes Tool
   * 
   * Ungroups nodes in Figma.
   */
  server.tool(
    "ungroup_nodes",
    "Ungroup nodes in Figma",
    {
      nodeId: z.string().describe("ID of the node (group or frame) to ungroup"),
    },
    async ({ nodeId }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Ungrouping node ID: ${nodeIdString}`);
        
        const result = await figmaClient.executeCommand("ungroup_nodes", { nodeId: nodeIdString });
        
        return {
          content: [
            {
              type: "text",
              text: `Node successfully ungrouped. ${result.ungroupedCount} elements were released.`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error ungrouping node: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Flatten Node Tool
   * 
   * Flattens a node in Figma (e.g., for boolean operations or converting to path).
   */
  server.tool(
    "flatten_node",
    "Flatten a node in Figma (e.g., for boolean operations or converting to path)",
    {
      nodeId: z.string().describe("ID of the node to flatten"),
    },
    async ({ nodeId }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Flattening node ID: ${nodeIdString}`);
        
        const result = await figmaClient.executeCommand("flatten_node", { nodeId: nodeIdString });
        
        return {
          content: [
            {
              type: "text",
              text: `Node "${result.name}" flattened successfully. The new node has ID: ${result.id} and is of type ${result.type}.`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error flattening node: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Insert Child Tool
   * 
   * Inserts a child node inside a parent node in Figma.
   */
  server.tool(
    "insert_child",
    "Insert a child node inside a parent node in Figma",
    {
      parentId: z.string().describe("ID of the parent node where the child will be inserted"),
      childId: z.string().describe("ID of the child node to insert"),
      index: z.number().optional().describe("Optional index where to insert the child (if not specified, it will be added at the end)")
    },
    async ({ parentId, childId, index }) => {
      try {
        // Ensure parentId and childId are treated as strings and validate they're not objects
        const parentIdString = ensureNodeIdIsString(parentId);
        const childIdString = ensureNodeIdIsString(childId);
        logger.debug(`Inserting child node ID: ${childIdString} into parent node ID: ${parentIdString}`);
        
        const result = await figmaClient.executeCommand("insert_child", { 
          parentId: parentIdString, 
          childId: childIdString,
          index 
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Child node with ID: ${result.childId} successfully inserted into parent node with ID: ${result.parentId}${index !== undefined ? ` at position ${result.index}` : ''}.`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error inserting child node: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );
}
