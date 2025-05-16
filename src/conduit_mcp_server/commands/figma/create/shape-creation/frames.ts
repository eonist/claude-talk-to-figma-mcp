import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { FrameSchema } from "./frame-schema.js";
import { v4 as uuidv4 } from "uuid";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers frame creation commands with the MCP server.
 * 
 * @param {McpServer} server - The MCP server instance to register tools on.
 * @param {FigmaClient} figmaClient - The Figma client for executing commands.
 * 
 * Adds:
 * - create_frame: Create a new frame node in Figma.
 */
export function registerFramesTools(server: McpServer, figmaClient: FigmaClient) {
  /**
   * MCP Tool: create_frame
   * 
   * Creates a new frame node in the specified Figma document at the given coordinates, with the specified width and height.
   * Optionally, you can provide a name, a parent node ID to attach the frame to, and fill/stroke properties.
   * This tool is useful for programmatically generating UI containers, artboards, or design primitives in Figma via MCP.
   * 
   * @param {number} x - X coordinate for the top-left corner.
   * @param {number} y - Y coordinate for the top-left corner.
   * @param {number} width - Width in pixels.
   * @param {number} height - Height in pixels.
   * @param {string} [name] - Optional. Name for the frame node.
   * @param {string} [parentId] - Optional. Figma node ID of the parent.
   * @param {any} [fillColor] - Optional. Fill color for the frame.
   * @param {any} [strokeColor] - Optional. Stroke color for the frame.
   * @param {number} [strokeWeight] - Optional. Stroke weight for the frame.
   * 
   * @returns {Promise<object>} Returns a promise resolving to an object containing a text message with the created frame's node ID.
   * 
   * @example
   * {
   *   x: 50,
   *   y: 100,
   *   width: 400,
   *   height: 300,
   *   name: "Main Frame"
   * }
   */
  server.tool(
    "create_frame",
    `Creates a new frame node in the specified Figma document at the given coordinates, with the specified width and height. Optionally, you can provide a name, a parent node ID, and fill/stroke properties.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created frame's node ID.
`,
    FrameSchema.shape,
    {
      title: "Create Frame",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          x: 50,
          y: 100,
          width: 400,
          height: 300,
          name: "Main Frame"
        }
      ]),
      edgeCaseWarnings: [
        "Width and height must be greater than zero.",
        "If parentId is invalid, the frame will be added to the root.",
        "Fill and stroke colors must be valid color objects."
      ],
      extraInfo: "Useful for generating UI containers, artboards, or design primitives programmatically."
    },
    // Tool handler: validates input, calls Figma client, and returns result or error.
    async (args) => {
      try {
        const params = { commandId: uuidv4(), ...args };
        const node = await figmaClient.createFrame(params);
        return { content: [{ type: "text", text: `Created frame ${node.id}` }] };
      } catch (err) {
        // Handle errors and return a formatted error response.
        return handleToolError(err, "shape-creation-tools", "create_frame") as any;
      }
    }
  );
}
