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
   * Set Style Tool
   *
   * Set both fill and stroke properties for a Figma node in a single command
   */
  server.tool(
    "set_style",
    "Set both fill and stroke properties for a Figma node in a single command",
    {
      nodeId: z.string().describe("The ID of the node to modify"),
      fillProps: z
        .object({
          color: z
            .tuple([
              z.number().min(0).max(1),
              z.number().min(0).max(1),
              z.number().min(0).max(1),
              z.number().min(0).max(1),
            ])
            .optional()
            .describe("RGBA fill color"),
          visible: z.boolean().optional().describe("Whether fill is visible"),
          opacity: z.number().min(0).max(1).optional().describe("Fill opacity"),
          gradient: z.any().optional().describe("Optional gradient settings"),
        })
        .optional()
        .describe("Fill properties"),
      strokeProps: z
        .object({
          color: z
            .tuple([
              z.number().min(0).max(1),
              z.number().min(0).max(1),
              z.number().min(0).max(1),
              z.number().min(0).max(1),
            ])
            .optional()
            .describe("RGBA stroke color"),
          weight: z.number().positive().optional().describe("Stroke weight"),
          align: z
            .enum(["INSIDE", "CENTER", "OUTSIDE"])
            .optional()
            .describe("Stroke alignment"),
          dashes: z.array(z.number()).optional().describe("Dash pattern"),
          visible: z.boolean().optional().describe("Whether stroke is visible"),
        })
        .optional()
        .describe("Stroke properties"),
    },
    async ({ nodeId, fillProps, strokeProps }, extra) => {
      try {
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Setting style for node ID: ${nodeIdString}`);
        if (fillProps) {
          const { color, visible, opacity, gradient } = fillProps;
          await figmaClient.setFillColor({
            nodeId: nodeIdString,
            r: color?.[0] ?? 0,
            g: color?.[1] ?? 0,
            b: color?.[2] ?? 0,
            a: color?.[3] ?? 1,
          });
        }
        if (strokeProps) {
          const { color, weight } = strokeProps;
          await figmaClient.setStrokeColor({
            nodeId: nodeIdString,
            r: color?.[0] ?? 0,
            g: color?.[1] ?? 0,
            b: color?.[2] ?? 0,
            a: color?.[3] ?? 1,
            weight,
          });
        }
        return {
          content: [
            {
              type: "text",
              text: `Set style of node "${nodeIdString}" successfully.`,
            },
          ],
          _meta: { nodeId: nodeIdString },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting style: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  /**
   * Set Styles Tool
   *
   * Apply fill and/or stroke styles to multiple nodes in one command
   */
  server.tool(
    "set_styles",
    "Apply fill and/or stroke styles to multiple nodes",
    {
      entries: z
        .array(
          z.object({
            nodeId: z.string().describe("The ID of the node to modify"),
            fillProps: z
              .object({
                color: z
                  .tuple([z.number().min(0).max(1), z.number().min(0).max(1), z.number().min(0).max(1), z.number().min(0).max(1)])
                  .optional()
                  .describe("RGBA fill color"),
                visible: z.boolean().optional().describe("Whether fill is visible"),
                opacity: z.number().min(0).max(1).optional().describe("Fill opacity"),
                gradient: z.any().optional().describe("Optional gradient settings"),
              })
              .optional()
              .describe("Fill properties"),
            strokeProps: z
              .object({
                color: z
                  .tuple([z.number().min(0).max(1), z.number().min(0).max(1), z.number().min(0).max(1), z.number().min(0).max(1)])
                  .optional()
                  .describe("RGBA stroke color"),
                weight: z.number().positive().optional().describe("Stroke weight"),
                align: z
                  .enum(["INSIDE", "CENTER", "OUTSIDE"])
                  .optional()
                  .describe("Stroke alignment"),
                dashes: z.array(z.number()).optional().describe("Dash pattern"),
                visible: z.boolean().optional().describe("Whether stroke is visible"),
              })
              .optional()
              .describe("Stroke properties"),
          })
        )
        .describe("Array of node style entries"),
    },
    async ({ entries }, extra) => {
      const results = [];
      for (const entry of entries) {
        const res = await figmaClient.setStyle(entry);
        results.push(res);
      }
      return {
        content: [
          {
            type: "text",
            text: `Applied styles to ${results.length} nodes successfully.`,
          },
        ],
        _meta: { results },
      };
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

  // Move Multiple Nodes Tool
  server.tool(
    "move_nodes",
    "Move multiple nodes to a new absolute position in Figma",
    {
      nodeIds: z.array(z.string()).describe("Array of node IDs to move"),
      x: z.number().describe("New X position"),
      y: z.number().describe("New Y position"),
    },
    async ({ nodeIds, x, y }) => {
      try {
        const nodeIdStrings = nodeIds.map(id => ensureNodeIdIsString(id));
        logger.debug(`Moving ${nodeIdStrings.length} nodes to position (${x}, ${y})`);
        
        const result = await figmaClient.moveNodes({ nodeIds: nodeIdStrings, x, y });
        const count = result.count ?? nodeIdStrings.length;
        return {
          content: [
            {
              type: "text",
              text: `Moved ${count} nodes to position (${x}, ${y})`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error moving nodes: ${error instanceof Error ? error.message : String(error)}`,
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

  // Resize Multiple Nodes Tool
  server.tool(
    "resize_nodes",
    "Resize multiple nodes in Figma",
    {
      nodeIds: z.array(z.string()).describe("Array of node IDs to resize"),
      dimensions: z
        .array(
          z
            .object({
              width: z.number().positive().describe("Width for node"),
              height: z.number().positive().describe("Height for node"),
            })
        )
        .optional()
        .describe("Specific dimensions per node"),
      targetSize: z
        .object({
          width: z.number().positive().describe("Target width"),
          height: z.number().positive().describe("Target height"),
        })
        .optional()
        .describe("Target size for all nodes"),
      scalePercent: z.number().positive().optional().describe("Scale by percentage"),
      maintainAspectRatio: z.boolean().optional().describe("Whether to preserve aspect ratio"),
      resizeMode: z.enum(["exact", "fit", "longest"]).optional().describe("Resize strategy"),
    },
    async ({ nodeIds, dimensions, targetSize, scalePercent, maintainAspectRatio, resizeMode }) => {
      const results: Array<{
        nodeId: string;
        success: boolean;
        error?: string;
        newWidth?: number;
        newHeight?: number;
      }> = [];
      for (let i = 0; i < nodeIds.length; i++) {
        const rawId = nodeIds[i];
        const nodeId = ensureNodeIdIsString(rawId);
        try {
          const current = await figmaClient.getNodeInfo(nodeId);
          const originalWidth = (current as any).width;
          const originalHeight = (current as any).height;
          const aspectRatio = originalWidth / originalHeight;
          let newWidth: number, newHeight: number;
          const dim = dimensions?.[i] || dimensions?.[0];
          if (resizeMode === "exact" && dim) {
            newWidth = dim.width;
            newHeight = dim.height;
          } else if (resizeMode === "fit" && targetSize) {
            const tw = targetSize.width;
            const th = targetSize.height;
            if (maintainAspectRatio !== false) {
              if (originalWidth / tw > originalHeight / th) {
                newWidth = tw;
                newHeight = tw / aspectRatio;
              } else {
                newHeight = th;
                newWidth = th * aspectRatio;
              }
            } else {
              newWidth = tw;
              newHeight = th;
            }
          } else if (resizeMode === "longest" && targetSize) {
            const t = Math.max(targetSize.width, targetSize.height);
            if (originalWidth >= originalHeight) {
              newWidth = t;
              newHeight = maintainAspectRatio !== false ? t / aspectRatio : originalHeight;
            } else {
              newHeight = t;
              newWidth = maintainAspectRatio !== false ? t * aspectRatio : originalWidth;
            }
          } else if (scalePercent) {
            const s = scalePercent / 100;
            newWidth = originalWidth * s;
            newHeight = originalHeight * s;
          } else if (dim) {
            newWidth = dim.width;
            newHeight = dim.height;
          } else {
            throw new Error("No valid resize parameters provided");
          }
          await figmaClient.resizeNode({ nodeId, width: newWidth, height: newHeight });
          results.push({ nodeId, success: true, newWidth, newHeight });
        } catch (error) {
          results.push({
            nodeId,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
      return {
        content: [
          {
            type: "text",
            text: `Resized ${results.filter(r => r.success).length}/${results.length} nodes successfully.`,
          },
        ],
        _meta: { results },
      };
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
   * Delete Nodes Tool
   * 
   * Deletes multiple nodes from Figma.
   */
  server.tool(
    "delete_nodes",
    "Delete multiple nodes from Figma",
    {
      nodeIds: z.array(z.string()).describe("Array of node IDs to delete"),
    },
    async ({ nodeIds }) => {
      try {
        const { success, failed } = await figmaClient.deleteNodes(nodeIds);
        return {
          content: [
            {
              type: "text",
              text: `Deleted ${success.length} nodes successfully; ${failed.length} failed.`,
            },
          ],
          _meta: { success, failed },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error deleting nodes: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
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
   * Set Font Name Tool
   *
   * Sets the font name and style of a text node in Figma.
   */
  server.tool(
    "set_font_name",
    "Set the font name and style of a text node in Figma",
    {
      nodeId: z.string().describe("The ID of the text node to modify"),
      family: z.string().describe("Font family name"),
      style: z.string().optional().describe("Font style (e.g., 'Regular', 'Bold', 'Italic')"),
    },
    async ({ nodeId, family, style }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Setting font name for node ID: ${nodeIdString}`);
        
        const result = await figmaClient.setFontName({
          nodeId: nodeIdString,
          family,
          style
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Updated font of node "${result.name}" to ${result.fontName.family} ${result.fontName.style}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting font name: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Set Font Size Tool
   *
   * Sets the font size of a text node in Figma.
   */
  server.tool(
    "set_font_size",
    "Set the font size of a text node in Figma",
    {
      nodeId: z.string().describe("The ID of the text node to modify"),
      fontSize: z.number().positive().describe("Font size in pixels"),
    },
    async ({ nodeId, fontSize }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Setting font size for node ID: ${nodeIdString}`);
        
        const result = await figmaClient.setFontSize({
          nodeId: nodeIdString,
          fontSize
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Updated font size of node "${result.name}" to ${result.fontSize}px`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting font size: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Set Font Weight Tool
   *
   * Sets the font weight of a text node in Figma.
   */
  server.tool(
    "set_font_weight",
    "Set the font weight of a text node in Figma",
    {
      nodeId: z.string().describe("The ID of the text node to modify"),
      weight: z.number().describe("Font weight (100, 200, 300, 400, 500, 600, 700, 800, 900)"),
    },
    async ({ nodeId, weight }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Setting font weight for node ID: ${nodeIdString}`);
        
        const result = await figmaClient.setFontWeight({
          nodeId: nodeIdString,
          weight
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Updated font weight of node "${result.name}" to ${weight} (${result.fontName.style})`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting font weight: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Set Letter Spacing Tool
   *
   * Sets the letter spacing of a text node in Figma.
   */
  server.tool(
    "set_letter_spacing",
    "Set the letter spacing of a text node in Figma",
    {
      nodeId: z.string().describe("The ID of the text node to modify"),
      letterSpacing: z.number().describe("Letter spacing value"),
      unit: z.enum(["PIXELS", "PERCENT"]).optional().describe("Unit type (PIXELS or PERCENT)"),
    },
    async ({ nodeId, letterSpacing, unit }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Setting letter spacing for node ID: ${nodeIdString}`);
        
        const result = await figmaClient.setLetterSpacing({
          nodeId: nodeIdString,
          letterSpacing,
          unit: unit || "PIXELS"
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Updated letter spacing of node "${result.name}" to ${result.letterSpacing.value} ${result.letterSpacing.unit}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting letter spacing: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Set Line Height Tool
   *
   * Sets the line height of a text node in Figma.
   */
  server.tool(
    "set_line_height",
    "Set the line height of a text node in Figma",
    {
      nodeId: z.string().describe("The ID of the text node to modify"),
      lineHeight: z.number().describe("Line height value"),
      unit: z.enum(["PIXELS", "PERCENT", "AUTO"]).optional().describe("Unit type (PIXELS, PERCENT, or AUTO)"),
    },
    async ({ nodeId, lineHeight, unit }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Setting line height for node ID: ${nodeIdString}`);
        
        const result = await figmaClient.setLineHeight({
          nodeId: nodeIdString,
          lineHeight,
          unit: unit || "PIXELS"
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Updated line height of node "${result.name}" to ${result.lineHeight.value} ${result.lineHeight.unit}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting line height: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Set Paragraph Spacing Tool
   *
   * Sets the paragraph spacing of a text node in Figma.
   */
  server.tool(
    "set_paragraph_spacing",
    "Set the paragraph spacing of a text node in Figma",
    {
      nodeId: z.string().describe("The ID of the text node to modify"),
      paragraphSpacing: z.number().describe("Paragraph spacing value in pixels"),
    },
    async ({ nodeId, paragraphSpacing }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Setting paragraph spacing for node ID: ${nodeIdString}`);
        
        const result = await figmaClient.setParagraphSpacing({
          nodeId: nodeIdString,
          paragraphSpacing
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Updated paragraph spacing of node "${result.name}" to ${paragraphSpacing}px`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting paragraph spacing: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Set Text Case Tool
   *
   * Sets the text case of a text node in Figma.
   */
  server.tool(
    "set_text_case",
    "Set the text case of a text node in Figma",
    {
      nodeId: z.string().describe("The ID of the text node to modify"),
      textCase: z.enum(["ORIGINAL", "UPPER", "LOWER", "TITLE"]).describe("Text case type"),
    },
    async ({ nodeId, textCase }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Setting text case for node ID: ${nodeIdString}`);
        
        const result = await figmaClient.setTextCase({
          nodeId: nodeIdString,
          textCase
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Updated text case of node "${result.name}" to ${textCase}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting text case: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Set Text Decoration Tool
   *
   * Sets the text decoration of a text node in Figma.
   */
  server.tool(
    "set_text_decoration",
    "Set the text decoration of a text node in Figma",
    {
      nodeId: z.string().describe("The ID of the text node to modify"),
      textDecoration: z.enum(["NONE", "UNDERLINE", "STRIKETHROUGH"]).describe("Text decoration type"),
    },
    async ({ nodeId, textDecoration }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Setting text decoration for node ID: ${nodeIdString}`);
        
        const result = await figmaClient.setTextDecoration({
          nodeId: nodeIdString,
          textDecoration
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Updated text decoration of node "${result.name}" to ${textDecoration}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting text decoration: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Load Font Async Tool
   *
   * Loads a font asynchronously in Figma.
   */
  server.tool(
    "load_font_async",
    "Load a font asynchronously in Figma",
    {
      family: z.string().describe("Font family name"),
      style: z.string().optional().describe("Font style (e.g., 'Regular', 'Bold', 'Italic')"),
    },
    async ({ family, style }) => {
      try {
        logger.debug(`Loading font ${family} ${style || 'Regular'}`);
        
        const result = await figmaClient.loadFontAsync({
          family,
          style
        });
        
        return {
          content: [
            {
              type: "text",
              text: result.message || `Loaded font ${family} ${style || "Regular"}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error loading font: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Set Effects Tool
   *
   * Sets the visual effects of a node in Figma.
   */
  server.tool(
    "set_effects",
    "Set the visual effects of a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to modify"),
      effects: z.array(
        z.object({
          type: z.enum(["DROP_SHADOW", "INNER_SHADOW", "LAYER_BLUR", "BACKGROUND_BLUR"]).describe("Effect type"),
          color: z.object({
            r: z.number().min(0).max(1).describe("Red (0-1)"),
            g: z.number().min(0).max(1).describe("Green (0-1)"),
            b: z.number().min(0).max(1).describe("Blue (0-1)"),
            a: z.number().min(0).max(1).describe("Alpha (0-1)")
          }).optional().describe("Effect color (for shadows)"),
          offset: z.object({
            x: z.number().describe("X offset"),
            y: z.number().describe("Y offset")
          }).optional().describe("Offset (for shadows)"),
          radius: z.number().optional().describe("Effect radius"),
          spread: z.number().optional().describe("Shadow spread (for shadows)"),
          visible: z.boolean().optional().describe("Whether the effect is visible"),
          blendMode: z.string().optional().describe("Blend mode")
        })
      ).describe("Array of effects to apply")
    },
    async ({ nodeId, effects }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Setting effects for node ID: ${nodeIdString}`);
        
        const result = await figmaClient.setEffects({
          nodeId: nodeIdString,
          effects
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Successfully applied ${effects.length} effect(s) to node "${result.name}"`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting effects: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Set Effect Style ID Tool
   *
   * Applies an effect style to a node in Figma.
   */
  server.tool(
    "set_effect_style_id",
    "Apply an effect style to a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to modify"),
      effectStyleId: z.string().describe("The ID of the effect style to apply")
    },
    async ({ nodeId, effectStyleId }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Setting effect style for node ID: ${nodeIdString}`);
        
        const result = await figmaClient.setEffectStyleId({
          nodeId: nodeIdString,
          effectStyleId
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Successfully applied effect style to node "${result.name}"`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting effect style: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Set Auto Layout Tool
   *
   * Configure auto layout properties for a node in Figma.
   */
  server.tool(
    "set_auto_layout",
    "Configure auto layout properties for a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to configure auto layout"),
      layoutMode: z.enum(["HORIZONTAL", "VERTICAL", "NONE"]).describe("Layout direction"),
      paddingTop: z.number().optional().describe("Top padding in pixels"),
      paddingBottom: z.number().optional().describe("Bottom padding in pixels"),
      paddingLeft: z.number().optional().describe("Left padding in pixels"),
      paddingRight: z.number().optional().describe("Right padding in pixels"),
      itemSpacing: z.number().optional().describe("Spacing between items in pixels"),
      primaryAxisAlignItems: z.enum(["MIN", "CENTER", "MAX", "SPACE_BETWEEN"]).optional().describe("Alignment along primary axis"),
      counterAxisAlignItems: z.enum(["MIN", "CENTER", "MAX"]).optional().describe("Alignment along counter axis"),
      layoutWrap: z.enum(["WRAP", "NO_WRAP"]).optional().describe("Whether items wrap to new lines"),
      strokesIncludedInLayout: z.boolean().optional().describe("Whether strokes are included in layout calculations")
    },
    async ({ nodeId, layoutMode, paddingTop, paddingBottom, paddingLeft, paddingRight, 
             itemSpacing, primaryAxisAlignItems, counterAxisAlignItems, layoutWrap, strokesIncludedInLayout }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Setting auto layout for node ID: ${nodeIdString}`);
        
        const result = await figmaClient.setAutoLayout({ 
          nodeId: nodeIdString, 
          layoutMode, 
          paddingTop, 
          paddingBottom, 
          paddingLeft, 
          paddingRight, 
          itemSpacing, 
          primaryAxisAlignItems, 
          counterAxisAlignItems, 
          layoutWrap, 
          strokesIncludedInLayout 
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Applied auto layout to node "${result.name}" with mode: ${layoutMode}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting auto layout: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Set Auto Layout Resizing Tool
   *
   * Set hug or fill sizing mode on an auto layout frame or child node.
   */
  server.tool(
    "set_auto_layout_resizing",
    "Set hug or fill sizing mode on an auto layout frame or child node",
    {
      nodeId: z.string().describe("The ID of the node to modify sizing for"),
      axis: z.enum(["horizontal", "vertical"]).describe("Which axis to apply sizing mode"),
      mode: z.enum(["FIXED", "HUG", "FILL"]).describe("Sizing mode to apply")
    },
    async ({ nodeId, axis, mode }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Setting auto layout resizing for node ID: ${nodeIdString}`);
        
        const result = await figmaClient.setAutoLayoutResizing({
          nodeId: nodeIdString,
          axis,
          mode
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Set ${axis} sizing mode of node "${result.name}" to ${mode}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting resizing mode: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
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

  /**
   * Set Bulk Font Tool
   *
   * Apply font settings to multiple text nodes at once.
   */
  server.tool(
    "set_bulk_font",
    "Apply font settings to multiple text nodes at once",
    {
      targets: z.array(z.object({
        nodeIds: z.array(z.string()).optional()
          .describe("Array of node IDs to update"),
        parentId: z.string().optional()
          .describe("Optional parent node ID to scan for text nodes"),
        inherit: z.boolean().optional().default(true)
          .describe("Whether to cascade font changes to all descendant text nodes (default: true)"),
        font: z.object({
          family: z.string().optional()
            .describe("Font family name"),
          style: z.string().optional()
            .describe("Font style (e.g., 'Regular', 'Bold', 'Italic')"),
          size: z.number().optional()
            .describe("Font size in pixels"),
          weight: z.number().optional()
            .describe("Font weight (100-900)")
        }).describe("Font settings to apply")
      })).describe("Array of target configurations for font updates")
    },
    async ({ targets }) => {
      try {
        // Convert node IDs to strings
        const processedTargets = targets.map(target => ({
          ...target,
          nodeIds: target.nodeIds?.map(id => ensureNodeIdIsString(id)),
          parentId: target.parentId ? ensureNodeIdIsString(target.parentId) : undefined
        }));

        const result = await figmaClient.setBulkFont({ targets: processedTargets });

        return {
          content: [
            {
              type: "text",
              text: `Bulk font update complete: ${result.successCount} of ${result.totalNodes} nodes updated successfully across ${targets.length} configurations${result.failureCount > 0 ? `, ${result.failureCount} failed` : ''}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error applying bulk font update: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );
}
