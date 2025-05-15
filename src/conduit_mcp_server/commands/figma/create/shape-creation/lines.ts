import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { LineSchema } from "./line-schema.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * MCP Tool: create_line
 * 
 * Creates a new line node in the specified Figma document between the given start and end coordinates.
 * Optionally, you can provide a parent node ID, stroke color, and stroke weight.
 * This tool is useful for programmatically generating connectors, dividers, or design primitives in Figma via MCP.
 * 
 * Parameters:
 *   - x1 (number, required): X coordinate for the start point. Example: 10
 *   - y1 (number, required): Y coordinate for the start point. Example: 20
 *   - x2 (number, required): X coordinate for the end point. Example: 110
 *   - y2 (number, required): Y coordinate for the end point. Example: 20
 *   - parentId (string, optional): Figma node ID of the parent.
 *   - strokeColor (any, optional): Stroke color for the line.
 *   - strokeWeight (number, optional): Stroke weight for the line.
 * 
 * Returns:
 *   - content: Array containing a text message with the created line's node ID.
 *     Example: { "content": [{ "type": "text", "text": "Created line 123:456" }] }
 * 
 * Usage Example:
 *   Input:
 *     {
 *       "x1": 10,
 *       "y1": 20,
 *       "x2": 110,
 *       "y2": 20
 *     }
 *   Output:
 *     {
 *       "content": [{ "type": "text", "text": "Created line 123:456" }]
 *     }
 */
export function registerLinesTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "create_line",
    `Creates a new line node in the specified Figma document between the given start and end coordinates. Optionally, you can provide a parent node ID, stroke color, and stroke weight.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created line's node ID.
`,
    LineSchema.shape,
    {
      title: "Create Line",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          x1: 10,
          y1: 20,
          x2: 110,
          y2: 20
        }
      ]),
      edgeCaseWarnings: [
        "Start and end points must not be identical.",
        "If parentId is invalid, the line will be added to the root.",
        "Stroke color must be a valid color object."
      ],
      extraInfo: "Useful for generating connectors, dividers, or design primitives programmatically."
    },
    // Tool handler: validates input, calls Figma client, and returns result.
    async ({ x1, y1, x2, y2, parentId, strokeColor, strokeWeight }) => {
      const node = await figmaClient.createLine({ x1, y1, x2, y2, parentId, strokeColor, strokeWeight });
      return { content: [{ type: "text", text: `Created line ${node.id}` }] };
    }
  );

  /**
   * MCP Tool: create_lines
   * 
   * Creates multiple lines in Figma based on the provided array of line configuration objects.
   * Each object should specify the start and end coordinates, and optional properties for a line.
   * This tool is useful for batch-generating connectors, dividers, or design primitives in Figma via MCP.
   * 
   * Parameters:
   *   - lines (array, required): An array of line configuration objects. Each object should include:
   *       - x1 (number, required): X coordinate for the start point.
   *       - y1 (number, required): Y coordinate for the start point.
   *       - x2 (number, required): X coordinate for the end point.
   *       - y2 (number, required): Y coordinate for the end point.
   *       - parentId (string, optional): Figma node ID of the parent.
   *       - strokeColor (any, optional): Stroke color for the line.
   *       - strokeWeight (number, optional): Stroke weight for the line.
   * 
   * Returns:
   *   - content: Array containing a text message with the number of lines created.
   *     Example: { "content": [{ "type": "text", "text": "Created 3/3 lines." }] }
   * 
   * Usage Example:
   *   Input:
   *     {
   *       "lines": [
   *         { "x1": 10, "y1": 20, "x2": 110, "y2": 20 },
   *         { "x1": 20, "y1": 30, "x2": 120, "y2": 30 }
   *       ]
   *     }
   *   Output:
   *     {
   *       "content": [{ "type": "text", "text": "Created 2/2 lines." }]
   *     }
   */
  server.tool(
    "create_lines",
    `Creates multiple lines in Figma based on the provided array of line configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of lines created.
`,
    { lines: z.array(LineSchema)
    },
    {
      title: "Create Lines",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          lines: [
            { x1: 10, y1: 20, x2: 110, y2: 20 },
            { x1: 20, y1: 30, x2: 120, y2: 30 }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "Each line must have distinct start and end points.",
        "If parentId is invalid, lines will be added to the root.",
        "Stroke color must be a valid color object."
      ],
      extraInfo: "Batch creation is efficient for generating multiple lines or connectors at once."
    },
    // Tool handler: processes each line, calls Figma client, and returns batch results.
    async ({ lines }) => {
      const results = await processBatch(
        lines,
        cfg => figmaClient.createLine(cfg).then(node => node.id)
      );
      const successCount = results.filter(r => r.result).length;
      return {
        content: [{ type: "text", text: `Created ${successCount}/${lines.length} lines.` }],
        _meta: { results }
      };
    }
  );
}
