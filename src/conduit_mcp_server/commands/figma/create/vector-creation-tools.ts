import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";
import { processBatch } from "../../../utils/batch-processor.js";
import { handleToolError } from "../../../utils/error-handling.js";

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
      x: z.number(), y: z.number(),
      width: z.number(), height: z.number(),
      name: z.string().optional(), parentId: z.string().optional(),
      vectorPaths: z.array(z.object({
        windingRule: z.string().optional(),
        data: z.string()
      })),
      fillColor: z.any().optional(), strokeColor: z.any().optional(),
      strokeWeight: z.number().optional()
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
    { vectors: z.array(z.object({
        x: z.number(), y: z.number(),
        width: z.number(), height: z.number(),
        name: z.string().optional(), parentId: z.string().optional(),
        vectorPaths: z.array(z.object({ data: z.string(), windingRule: z.string().optional() })),
        fillColor: z.any().optional(), strokeColor: z.any().optional(),
        strokeWeight: z.number().optional()
      }))
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
