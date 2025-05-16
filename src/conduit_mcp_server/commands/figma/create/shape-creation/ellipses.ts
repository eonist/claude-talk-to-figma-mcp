import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { EllipseSchema, SingleEllipseSchema, BatchEllipsesSchema } from "./ellipse-schema.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { v4 as uuidv4 } from "uuid";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers ellipse creation commands with the MCP server.
 * 
 * @param {McpServer} server - The MCP server instance to register tools on.
 * @param {FigmaClient} figmaClient - The Figma client for executing commands.
 * 
 * Adds:
 * - create_ellipse, create_ellipses: Create one or more ellipses in Figma.
 */
export function registerEllipsesTools(server: McpServer, figmaClient: FigmaClient) {
  /**
   * MCP Tool: create_ellipse
   * 
   * Creates a new ellipse node in the specified Figma document at the given coordinates, with the specified width and height.
   * Optionally, you can provide a name, a parent node ID, fill color, stroke color, and stroke weight.
   * This tool is useful for programmatically generating circles, ovals, or design primitives in Figma via MCP.
   * 
   * @param {number} x - X coordinate for the top-left corner.
   * @param {number} y - Y coordinate for the top-left corner.
   * @param {number} width - Width in pixels.
   * @param {number} height - Height in pixels.
   * @param {string} [name] - Optional. Name for the ellipse node.
   * @param {string} [parentId] - Optional. Figma node ID of the parent.
   * @param {any} [fillColor] - Optional. Fill color for the ellipse.
   * @param {any} [strokeColor] - Optional. Stroke color for the ellipse.
   * @param {number} [strokeWeight] - Optional. Stroke weight for the ellipse.
   * 
   * @returns {Promise<object>} Returns a promise resolving to an object containing a text message with the created ellipse's node ID.
   * 
   * @example
   * {
   *   x: 60,
   *   y: 80,
   *   width: 120,
   *   height: 90,
   *   name: "Ellipse1"
   * }
   */
  server.tool(
    "create_ellipse",
    `Creates a new ellipse node in the specified Figma document at the given coordinates, with the specified width and height. Optionally, you can provide a name, a parent node ID, fill color, stroke color, and stroke weight.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created ellipse's node ID.
`,
    {
      ellipse: SingleEllipseSchema
        .describe("A single ellipse configuration object. Each object should include coordinates, dimensions, and optional properties for an ellipse.")
        .optional(),
      ellipses: BatchEllipsesSchema
        .describe("An array of ellipse configuration objects. Each object should include coordinates, dimensions, and optional properties for an ellipse.")
        .optional(),
    },
    {
      title: "Create Ellipse(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          ellipse: {
            x: 60,
            y: 80,
            width: 120,
            height: 90,
            name: "Ellipse1"
          }
        },
        {
          ellipses: [
            { x: 10, y: 20, width: 100, height: 50, name: "Ellipse1" },
            { x: 120, y: 20, width: 80, height: 40 }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "Width and height must be greater than zero.",
        "If parentId is invalid, the ellipse will be added to the root.",
        "Fill and stroke colors must be valid color objects."
      ],
      extraInfo: "Useful for generating circles, ovals, or design primitives programmatically. Batch creation is efficient for generating multiple ellipses or circles at once."
    },
    // Tool handler: supports both single object and array input via 'ellipse' or 'ellipses'.
    async (args) => {
      try {
        let ellipsesArr;
        if (args.ellipses) {
          ellipsesArr = args.ellipses;
        } else if (args.ellipse) {
          ellipsesArr = [args.ellipse];
        } else {
          throw new Error("You must provide either 'ellipse' or 'ellipses' as input.");
        }
        const results = await processBatch(
          ellipsesArr,
          async cfg => {
            const params = { ...cfg, commandId: uuidv4() };
            // Only pass commandId if createEllipse supports it, otherwise omit
            const node = await figmaClient.createEllipse(params);
            return node.id;
          }
        );
        const nodeIds = results.map(r => r.result).filter(Boolean);
        if (nodeIds.length === 1) {
          return { content: [{ type: "text", text: `Created ellipse ${nodeIds[0]}` }] };
        } else {
          return { content: [{ type: "text", text: `Created ellipses: ${nodeIds.join(", ")}` }] };
        }
      } catch (err) {
        // Handle errors and return a formatted error response.
        return handleToolError(err, "shape-creation-tools", "create_ellipse") as any;
      }
    }
  );

  /**
   * MCP Tool: create_ellipses
   * 
   * Creates multiple ellipses in Figma based on the provided array of ellipse configuration objects.
   * Each object should specify the coordinates, dimensions, and optional properties for an ellipse.
   * This tool is useful for batch-generating circles, ovals, or design primitives in Figma via MCP.
   * 
   * @param {Array<object>} ellipses - An array of ellipse configuration objects. Each object should include:
   *   - x {number} - X coordinate for the top-left corner.
   *   - y {number} - Y coordinate for the top-left corner.
   *   - width {number} - Width in pixels.
   *   - height {number} - Height in pixels.
   *   - name {string} [optional] - Name for the ellipse node.
   *   - parentId {string} [optional] - Figma node ID of the parent.
   *   - fillColor {any} [optional] - Fill color for the ellipse.
   *   - strokeColor {any} [optional] - Stroke color for the ellipse.
   *   - strokeWeight {number} [optional] - Stroke weight for the ellipse.
   * 
   * @returns {Promise<object>} Returns a promise resolving to an object containing a text message with the number of ellipses created.
   * 
   * @example
   * {
   *   ellipses: [
   *     { x: 10, y: 20, width: 100, height: 50, name: "Ellipse1" },
   *     { x: 120, y: 20, width: 80, height: 40 }
   *   ]
   * }
   */
  // The batch tool 'create_ellipses' is now replaced by the unified 'create_ellipse' tool above.
}
