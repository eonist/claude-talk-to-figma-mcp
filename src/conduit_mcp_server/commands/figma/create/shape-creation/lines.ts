import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers line creation commands:
 * - create_line
 * - create_lines
 */
export function registerLinesTools(server: McpServer, figmaClient: FigmaClient) {
  // Create Line
  server.tool(
    "create_line",
    `Create a new line in Figma.

Parameters:
  - x1 (number, required): X coordinate for the start point.
  - y1 (number, required): Y coordinate for the start point.
  - x2 (number, required): X coordinate for the end point.
  - y2 (number, required): Y coordinate for the end point.
  - parentId (string, optional): Figma node ID of the parent.
  - strokeColor (any, optional): Stroke color for the line.
  - strokeWeight (number, optional): Stroke weight for the line.

Returns:
  - content: Array containing a text message with the created line's node ID.
    Example: { "content": [{ "type": "text", "text": "Created line 123:456" }] }
`,
    {
      x1: z.number(), y1: z.number(),
      x2: z.number(), y2: z.number(),
      parentId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" }).optional(),
      strokeColor: z.any().optional(),
      strokeWeight: z.number().optional()
    },
    async ({ x1, y1, x2, y2, parentId, strokeColor, strokeWeight }) => {
      const node = await figmaClient.createLine({ x1, y1, x2, y2, parentId, strokeColor, strokeWeight });
      return { content: [{ type: "text", text: `Created line ${node.id}` }] };
    }
  );

  // Create Lines (Batch)
  server.tool(
    "create_lines",
    `Create multiple lines in Figma.

Parameters:
  - lines (array, required): An array of line configuration objects. Each object should include:
      - x1 (number, required): X coordinate for the start point.
      - y1 (number, required): Y coordinate for the start point.
      - x2 (number, required): X coordinate for the end point.
      - y2 (number, required): Y coordinate for the end point.
      - parentId (string, optional): Figma node ID of the parent.
      - strokeColor (any, optional): Stroke color for the line.
      - strokeWeight (number, optional): Stroke weight for the line.

Returns:
  - content: Array containing a text message with the number of lines created.
    Example: { "content": [{ "type": "text", "text": "Created 3/3 lines." }] }
`,
    { lines: z.array(z.object({
        x1: z.number(), y1: z.number(),
        x2: z.number(), y2: z.number(),
        parentId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" }).optional(),
        strokeColor: z.any().optional(),
        strokeWeight: z.number().optional()
      }))
    },
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
