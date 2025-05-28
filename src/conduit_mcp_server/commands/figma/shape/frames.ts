import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { /*FrameSchema, */SingleFrameSchema, BatchFramesSchema } from "./schema/frame-schema.js";
// import { processBatch } from "../../../utils/batch-processor.js";
import { v4 as uuidv4 } from "uuid";
// import { handleToolError } from "../../../utils/error-handling.js";

/**
 * Registers frame creation commands with the MCP server.
 * 
 * Frames are container elements in Figma that can hold other design elements.
 * This function enables programmatic creation of UI containers, artboards, and
 * layout structures through the MCP protocol.
 *
 * @param {McpServer} server - The MCP server instance to register tools on
 * @param {FigmaClient} figmaClient - The Figma client for executing API commands
 * 
 * @example
 * registerFramesTools(server, figmaClient);
 * 
 * @see {@link MCP_COMMANDS.CREATE_FRAME}
 * @since 1.0.0
 */
export function registerFramesTools(server: McpServer, figmaClient: FigmaClient) {
  /**
   * MCP Tool: create_frame
   *
   * Creates one or more frame container nodes in the specified Figma document.
   * Frames serve as containers for other design elements and are essential for
   * creating organized, hierarchical designs.
   * 
   * **Frame Properties:**
   * - `x`, `y`: Position coordinates (required)
   * - `width`, `height`: Frame dimensions in pixels (required, must be > 0)
   * - `name`: Human-readable frame name (optional)
   * - `parentId`: Parent container node ID (optional)
   * - `fillColor`: Background fill color as RGBA object (optional)
   * - `strokeColor`: Border color as RGBA object (optional)
   * - `strokeWeight`: Border thickness in pixels (optional)
   *
   * @param {Object} args - The input configuration object
   * @param {Object} [args.frame] - Single frame configuration
   * @param {number} args.frame.x - X coordinate position
   * @param {number} args.frame.y - Y coordinate position
   * @param {number} args.frame.width - Frame width (must be > 0)
   * @param {number} args.frame.height - Frame height (must be > 0)
   * @param {string} [args.frame.name] - Optional frame name
   * @param {string} [args.frame.parentId] - Optional parent node ID
   * @param {Object} [args.frame.fillColor] - Optional RGBA fill color
   * @param {Object} [args.frame.strokeColor] - Optional RGBA stroke color  
   * @param {number} [args.frame.strokeWeight] - Optional stroke weight
   * @param {Object[]} [args.frames] - Array of frame configurations (alternative to single)
   * 
   * @returns {Promise} Promise resolving to MCP response format
   * @returns {Object[]} returns.content - Array of response objects
   * @returns {string} returns.content[].type - Response type ("text")
   * @returns {string} returns.content[].text - JSON string with creation results
   * 
   * @throws {Error} When neither 'frame' nor 'frames' is provided
   * @throws {Error} When figmaClient.createFrame fails or returns invalid data
   * 
   * @example
   * // Create main artboard frame
   * const result = await createFrame({
   *   frame: {
   *     x: 50, y: 100, width: 400, height: 300,
   *     name: "Main Artboard",
   *     fillColor: { r: 0.98, g: 0.98, b: 0.98, a: 1.0 }
   *   }
   * });
   * 
   * @example
   * // Create multiple layout frames
   * const result = await createFrame({
   *   frames: [
   *     { x: 10, y: 20, width: 200, height: 150, name: "Header" },
   *     { x: 10, y: 180, width: 200, height: 300, name: "Content" }
   *   ]
   * });
   */
  server.tool(
    MCP_COMMANDS.CREATE_FRAME,
    `Creates one or more frame nodes in the specified Figma document. Accepts either a single frame config (via 'frame') or an array of configs (via 'frames'). Optionally, you can provide a name, a parent node ID, fill color, stroke color, and stroke weight.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created frame node ID(s).
`,
    {
      frame: SingleFrameSchema
        .describe("A single frame configuration object. Each object should include coordinates, dimensions, and optional properties for a frame.")
        .optional(),
      frames: BatchFramesSchema
        .describe("An array of frame configuration objects. Each object should include coordinates, dimensions, and optional properties for a frame.")
        .optional(),
    },
    {
      title: "Create Frame(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          frame: {
            x: 50,
            y: 100,
            width: 400,
            height: 300,
            name: "Main Frame"
          }
        },
        {
          frames: [
            { x: 10, y: 20, width: 100, height: 50, name: "Frame1" },
            { x: 120, y: 20, width: 80, height: 40 }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "Width and height must be greater than zero.",
        "If parentId is invalid, the frame will be added to the root.",
        "Fill and stroke colors must be valid color objects."
      ],
      extraInfo: "Useful for generating UI containers, artboards, or design primitives programmatically. Batch creation is efficient for generating multiple frames at once."
    },
    // Tool handler: supports both single object and array input via 'frame' or 'frames'.
    async (args) => {
      let framesArr;
      if (args.frames) {
        framesArr = args.frames;
      } else if (args.frame) {
        framesArr = [args.frame];
      } else {
        const response = {
          success: false,
          error: {
            message: "You must provide either 'frame' or 'frames' as input.",
            results: [],
            meta: {
              operation: "create_frame",
              params: args
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
      const results = [];
      for (const cfg of framesArr) {
        try {
          const params = { ...cfg, commandId: uuidv4() };
          const result = await figmaClient.createFrame(params);
          let nodeId;
          if (result && typeof result.id === "string") {
            nodeId = result.id;
          } else if (result && Array.isArray(result.ids) && result.ids.length > 0) {
            nodeId = result.ids[0];
          } else {
            throw new Error("Failed to create frame: missing node ID from figmaClient.createFrame");
          }
          results.push({
            config: cfg,
            nodeId,
            success: true
          });
        } catch (err) {
          results.push({
            config: cfg,
            success: false,
            error: err instanceof Error ? err.message : String(err),
            meta: {
              operation: "create_frame",
              params: cfg
            }
          });
        }
      }
      const anySuccess = results.some(r => r.success);
      let response;
      if (anySuccess) {
        response = { success: true, results };
      } else {
        response = {
          success: false,
          error: {
            message: "All create_frame operations failed",
            results,
            meta: {
              operation: "create_frame",
              params: framesArr
            }
          }
        };
      }
      return { content: [{ type: "text", text: JSON.stringify(response) }] };
    }
  );
}
