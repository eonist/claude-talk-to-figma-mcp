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
    `Creates a new vector node in Figma at the specified coordinates and dimensions, with the given vector path data. Optionally, you can set name, parent node, fill/stroke color, and stroke weight.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created vector's node ID.
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
    {
      title: "Create Vector",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          x: 10,
          y: 20,
          width: 100,
          height: 100,
          vectorPaths: [{ data: "M0 0L10 10" }]
        }
      ]),
      edgeCaseWarnings: [
        "Width and height must be positive.",
        "Vector path data must be valid SVG path strings.",
        "If parentId is invalid, vectors will be added to the root."
      ],
      extraInfo: "Use this command to create a single vector node with specified paths."
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
    `Creates multiple vectors in Figma based on the provided array of vector configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of vectors created.
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
    {
      title: "Create Vectors",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          vectors: [
            {
              x: 10,
              y: 20,
              width: 100,
              height: 100,
              vectorPaths: [{ data: "M0 0L10 10" }]
            }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "Width and height must be positive for each vector.",
        "Vector path data must be valid SVG path strings.",
        "If parentId is invalid, vectors will be added to the root."
      ],
      extraInfo: "Use this command to create multiple vector nodes in batch."
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
