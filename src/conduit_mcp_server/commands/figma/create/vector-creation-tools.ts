import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";
import { processBatch } from "../../../utils/batch-processor.js";
import { handleToolError } from "../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers vector-creation-related commands:
 * - create_vector
 * - create_vectors
 */
export function registerVectorCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  // Single vector
  server.tool(
    "create_vector",
    `Create a new vector in Figma.

Parameters:
  - x (number, required): X coordinate for the vector.
  - y (number, required): Y coordinate for the vector.
  - width (number, required): Width in pixels.
  - height (number, required): Height in pixels.
  - name (string, optional): Name for the vector node.
  - parentId (string, optional): Figma node ID of the parent.
  - vectorPaths (array, required): Array of vector path objects ({ data: string, windingRule?: string }).
  - fillColor (any, optional): Fill color for the vector.
  - strokeColor (any, optional): Stroke color for the vector.
  - strokeWeight (number, optional): Stroke weight for the vector.

Returns:
  - content: Array containing a text message with the created vector's node ID.
    Example: { "content": [{ "type": "text", "text": "Created vector 123:456" }] }

Annotations:
  - title: "Create Vector"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "x": 100,
      "y": 200,
      "width": 50,
      "height": 50,
      "vectorPaths": [{ "data": "M0,0L50,0L50,50L0,50Z" }]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Created vector 123:456" }]
    }
`,
    {
      // Enforce reasonable X coordinate
      x: z.number()
        .min(-10000)
        .max(10000)
        .describe("X coordinate for the vector. Must be between -10,000 and 10,000."),
      // Enforce reasonable Y coordinate
      y: z.number()
        .min(-10000)
        .max(10000)
        .describe("Y coordinate for the vector. Must be between -10,000 and 10,000."),
      // Enforce positive width, reasonable upper bound
      width: z.number()
        .min(1)
        .max(2000)
        .describe("Width of the vector in pixels. Must be between 1 and 2000."),
      // Enforce positive height, reasonable upper bound
      height: z.number()
        .min(1)
        .max(2000)
        .describe("Height of the vector in pixels. Must be between 1 and 2000."),
      // Enforce non-empty string for name if provided
      name: z.string()
        .min(1)
        .max(100)
        .optional()
        .describe("Optional. Name for the vector node. If provided, must be a non-empty string up to 100 characters."),
      // Enforce Figma node ID format for parentId if provided
      parentId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .optional()
        .describe("Optional. Figma node ID of the parent. If provided, must be a string in the format '123:456'."),
      // Enforce array of vector path objects, each with non-empty data
      vectorPaths: z.array(
        z.object({
          data: z.string()
            .min(1)
            .max(10000)
            .describe("SVG path data string. Must be a non-empty string up to 10,000 characters."),
          windingRule: z.string()
            .optional()
            .describe("Optional. Winding rule for the path (e.g., 'evenodd', 'nonzero').")
        })
      )
      .min(1)
      .max(50)
      .describe("Array of vector path objects. Must contain 1 to 50 items."),
      fillColor: z.any().optional().describe("Optional. Fill color for the vector."),
      strokeColor: z.any().optional().describe("Optional. Stroke color for the vector."),
      strokeWeight: z.number()
        .min(0)
        .max(100)
        .optional()
        .describe("Optional. Stroke weight for the vector. Must be between 0 and 100."),
    },
    async ({ x, y, width, height, name, parentId, vectorPaths, fillColor, strokeColor, strokeWeight }): Promise<any> => {
      try {
        const node = await figmaClient.createVector({ x, y, width, height, name, parentId, vectorPaths, fillColor, strokeColor, strokeWeight });
        return { content: [{ type: "text", text: `Created vector ${node.id}` }] };
      } catch (err) {
        return handleToolError(err, "vector-creation-tools", "create_vector") as any;
      }
    }
  );

  // Batch vectors
  server.tool(
    "create_vectors",
    `Create multiple vectors in Figma.

Parameters:
  - vectors (array, required): An array of vector configuration objects. Each object should include:
      - x (number, required): X coordinate for the vector.
      - y (number, required): Y coordinate for the vector.
      - width (number, required): Width in pixels.
      - height (number, required): Height in pixels.
      - name (string, optional): Name for the vector node.
      - parentId (string, optional): Figma node ID of the parent.
      - vectorPaths (array, required): Array of vector path objects ({ data: string, windingRule?: string }).
      - fillColor (any, optional): Fill color for the vector.
      - strokeColor (any, optional): Stroke color for the vector.
      - strokeWeight (number, optional): Stroke weight for the vector.

Returns:
  - content: Array containing a text message with the number of vectors created.
    Example: { "content": [{ "type": "text", "text": "Created 3/3 vectors." }] }

Annotations:
  - title: "Create Vectors (Batch)"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "vectors": [
        { "x": 10, "y": 20, "width": 50, "height": 50, "vectorPaths": [{ "data": "M0,0L50,0L50,50L0,50Z" }] },
        { "x": 70, "y": 20, "width": 50, "height": 50, "vectorPaths": [{ "data": "M0,0L50,0L50,50L0,50Z" }] }
      ]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Created 2/2 vectors." }]
    }
`,
    {
      vectors: z.array(
        z.object({
          // Enforce reasonable X coordinate
          x: z.number()
            .min(-10000)
            .max(10000)
            .describe("X coordinate for the vector. Must be between -10,000 and 10,000."),
          // Enforce reasonable Y coordinate
          y: z.number()
            .min(-10000)
            .max(10000)
            .describe("Y coordinate for the vector. Must be between -10,000 and 10,000."),
          // Enforce positive width, reasonable upper bound
          width: z.number()
            .min(1)
            .max(2000)
            .describe("Width of the vector in pixels. Must be between 1 and 2000."),
          // Enforce positive height, reasonable upper bound
          height: z.number()
            .min(1)
            .max(2000)
            .describe("Height of the vector in pixels. Must be between 1 and 2000."),
          // Enforce non-empty string for name if provided
          name: z.string()
            .min(1)
            .max(100)
            .optional()
            .describe("Optional. Name for the vector node. If provided, must be a non-empty string up to 100 characters."),
          // Enforce Figma node ID format for parentId if provided
          parentId: z.string()
            .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
            .optional()
            .describe("Optional. Figma node ID of the parent. If provided, must be a string in the format '123:456'."),
          // Enforce array of vector path objects, each with non-empty data
          vectorPaths: z.array(
            z.object({
              data: z.string()
                .min(1)
                .max(10000)
                .describe("SVG path data string. Must be a non-empty string up to 10,000 characters."),
              windingRule: z.string()
                .optional()
                .describe("Optional. Winding rule for the path (e.g., 'evenodd', 'nonzero').")
            })
          )
          .min(1)
          .max(50)
          .describe("Array of vector path objects. Must contain 1 to 50 items."),
          fillColor: z.any().optional().describe("Optional. Fill color for the vector."),
          strokeColor: z.any().optional().describe("Optional. Stroke color for the vector."),
          strokeWeight: z.number()
            .min(0)
            .max(100)
            .optional()
            .describe("Optional. Stroke weight for the vector. Must be between 0 and 100."),
        })
      )
      .min(1)
      .max(50)
      .describe("Array of vector configuration objects. Must contain 1 to 50 items."),
    },
    async ({ vectors }): Promise<any> => {
      try {
        const results = await processBatch(
          vectors,
          cfg => figmaClient.createVector(cfg).then(node => node.id)
        );
        const successCount = results.filter(r => r.result).length;
        return {
          content: [{ type: "text", text: `Created ${successCount}/${vectors.length} vectors.` }],
          _meta: { results }
        };
      } catch (err) {
        return handleToolError(err, "vector-creation-tools", "create_vectors") as any;
      }
    }
  );
}
