import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { MCP_COMMANDS } from "../../../../types/commands";
import { FrameSchema, SingleFrameSchema, BatchFramesSchema } from "./frame-schema.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { v4 as uuidv4 } from "uuid";
import { handleToolError } from "../../../../utils/error-handling.js";

/**
 * Registers frame creation commands with the MCP server.
 * 
 * @param {McpServer} server - The MCP server instance to register tools on.
 * @param {FigmaClient} figmaClient - The Figma client for executing commands.
 * 
 * Adds:
 * - create_frame: Create one or more frames in Figma.
 */
export function registerFramesTools(server: McpServer, figmaClient: FigmaClient) {
  /**
   * MCP Tool: create_frame
   *
   * Creates one or more frame nodes in the specified Figma document.
   * Accepts either a single frame config (via the 'frame' property) or an array of configs (via the 'frames' property).
   * Optionally, you can provide a name, a parent node ID, fill color, stroke color, and stroke weight.
   *
   * This tool is useful for programmatically generating UI containers, artboards, or design primitives in Figma via MCP.
   *
   * @param {object} args - The input object. Must provide either:
   *   - frame: A single frame config object (x, y, width, height, name?, parentId?, fillColor?, strokeColor?, strokeWeight?)
   *   - frames: An array of frame config objects (same shape as above)
   *
   * @returns {Promise<object>} Returns a promise resolving to an object containing a text message with the created frame node ID(s).
   *
   * @example
   * // Single frame
   * {
   *   frame: {
   *     x: 50,
   *     y: 100,
   *     width: 400,
   *     height: 300,
   *     name: "Main Frame"
   *   }
   * }
   *
   * // Multiple frames
   * {
   *   frames: [
   *     { x: 10, y: 20, width: 100, height: 50, name: "Frame1" },
   *     { x: 120, y: 20, width: 80, height: 40 }
   *   ]
   * }
   */
  server.tool(
    MCP_COMMANDS.CREATE_FRAME,
    `Creates one or more frame nodes in the specified Figma document. Accepts either a single frame config (via 'frame') or an array of configs (via 'frames'). Optionally, you can provide a name, a parent node ID, fill color, stroke color, and stroke weight.

Input:
  - frame: A single frame configuration object.
  - frames: An array of frame configuration objects.

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
      try {
        let framesArr;
        if (args.frames) {
          framesArr = args.frames;
        } else if (args.frame) {
          framesArr = [args.frame];
        } else {
          throw new Error("You must provide either 'frame' or 'frames' as input.");
        }
        const results = await processBatch(
          framesArr,
          async cfg => {
            const params = { ...cfg, commandId: uuidv4() };
            const result = await figmaClient.createFrame(params);
            // Support both { id } and { ids: [...] } return shapes
            if (result && typeof result.id === "string") {
              return result.id;
            } else if (result && Array.isArray(result.ids) && result.ids.length > 0) {
              return result.ids[0];
            } else {
              throw new Error("Failed to create frame: missing node ID from figmaClient.createFrame");
            }
          }
        );
        const nodeIds = results.map(r => r.result).filter(Boolean);
        return {
          success: true,
          message: nodeIds.length === 1
            ? `Frame created successfully.`
            : `Frames created successfully.`,
          nodeIds
        };
      } catch (err) {
        // Return a structured error response.
        return {
          success: false,
          error: {
            message: err instanceof Error ? err.message : String(err),
            ...(err && typeof err === "object" && "stack" in err ? { stack: (err as Error).stack } : {})
          }
        };
      }
    }
  );
}
