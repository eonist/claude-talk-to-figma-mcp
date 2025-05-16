import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";
import { processBatch } from "../../../utils/batch-processor.js";
import { handleToolError } from "../../../utils/error-handling.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";

/**
 * Registers vector-creation-related commands:
 * - create_vector
 * - create_vectors
 */
export function registerVectorCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  // Unified single/batch vector creation
  server.tool(
    "create_vector",
    `Creates one or more vector nodes in Figma. Accepts either a single vector config (via 'vector') or an array of configs (via 'vectors').

Input:
  - vector: A single vector configuration object.
  - vectors: An array of vector configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created vector node ID(s).
`,
    {
      vector: z.object({
        x: z.number()
          .min(-10000)
          .max(10000)
          .describe("X coordinate for the vector. Must be between -10,000 and 10,000."),
        y: z.number()
          .min(-10000)
          .max(10000)
          .describe("Y coordinate for the vector. Must be between -10,000 and 10,000."),
        width: z.number()
          .min(1)
          .max(2000)
          .describe("Width of the vector in pixels. Must be between 1 and 2000."),
        height: z.number()
          .min(1)
          .max(2000)
          .describe("Height of the vector in pixels. Must be between 1 and 2000."),
        name: z.string()
          .min(1)
          .max(100)
          .optional()
          .describe("Optional. Name for the vector node. If provided, must be a non-empty string up to 100 characters."),
        parentId: z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .optional()
          .describe("Optional. Figma node ID of the parent. If provided, must be a string in the format '123:456'."),
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
      }).optional(),
      vectors: z.array(
        z.object({
          x: z.number()
            .min(-10000)
            .max(10000)
            .describe("X coordinate for the vector. Must be between -10,000 and 10,000."),
          y: z.number()
            .min(-10000)
            .max(10000)
            .describe("Y coordinate for the vector. Must be between -10,000 and 10,000."),
          width: z.number()
            .min(1)
            .max(2000)
            .describe("Width of the vector in pixels. Must be between 1 and 2000."),
          height: z.number()
            .min(1)
            .max(2000)
            .describe("Height of the vector in pixels. Must be between 1 and 2000."),
          name: z.string()
            .min(1)
            .max(100)
            .optional()
            .describe("Optional. Name for the vector node. If provided, must be a non-empty string up to 100 characters."),
          parentId: z.string()
            .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
            .optional()
            .describe("Optional. Figma node ID of the parent. If provided, must be a string in the format '123:456'."),
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
      ).optional(),
    },
    {
      title: "Create Vector(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          vector: {
            x: 10,
            y: 20,
            width: 100,
            height: 100,
            vectorPaths: [{ data: "M0 0L10 10" }]
          }
        },
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
        "Width and height must be positive.",
        "Vector path data must be valid SVG path strings.",
        "If parentId is invalid, vectors will be added to the root."
      ],
      extraInfo: "Use this command to create one or more vector nodes with specified paths."
    },
    async (args): Promise<any> => {
      try {
        let vectorsArr;
        if (args.vectors) {
          vectorsArr = args.vectors;
        } else if (args.vector) {
          vectorsArr = [args.vector];
        } else {
          throw new Error("You must provide either 'vector' or 'vectors' as input.");
        }
        const results = await processBatch(
          vectorsArr,
          async (cfg) => figmaClient.createVector(cfg).then(node => node.id)
        );
        const nodeIds = results.map(r => r.result).filter(Boolean);
        if (nodeIds.length === 1) {
          return { content: [{ type: "text", text: `Created vector ${nodeIds[0]}` }] };
        } else {
          return { content: [{ type: "text", text: `Created vectors: ${nodeIds.join(", ")}` }] };
        }
      } catch (err) {
        return handleToolError(err, "vector-creation-tools", "create_vector") as any;
      }
    }
  );
}
