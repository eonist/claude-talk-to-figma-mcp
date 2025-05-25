import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { logger } from "../../../utils/logger.js";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { processBatch } from "../../../utils/batch-processor.js";
import { handleToolError } from "../../../utils/error-handling.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers vector-creation-related commands:
 * - create_vector
 * - create_vectors
 */
export function registerVectorCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  // Unified single/batch vector creation
    server.tool(
    MCP_COMMANDS.CREATE_VECTOR,
    `Creates one or more vector nodes in Figma. Shape is defined via \`vectorPaths\`: an array of objects each containing:
  - \`windingRule\`: "EVENODD" or "NONZERO"
  - \`data\`: SVG path commands string.

Accepts either a single vector config (via 'vector') or an array of configs (via 'vectors').

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
            windingRule: z.enum(["EVENODD", "NONZERO"])
              .describe("Winding rule for the path: \"EVENODD\" or \"NONZERO\".")
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
      }).optional().describe("A single vector node configuration. Optional."),
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
              windingRule: z.enum(["EVENODD", "NONZERO"])
                .describe("Winding rule for the path: \"EVENODD\" or \"NONZERO\".")
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
      ).optional().describe("An array of vector node configurations for batch creation. Optional."),
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
            vectorPaths: [{ windingRule: "EVENODD", data: "M0 0L10 10" }]
          }
        },
        {
          vectors: [
            {
              x: 10,
              y: 20,
              width: 100,
              height: 100,
              vectorPaths: [{ windingRule: "EVENODD", data: "M0 0L10 10" }]
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
          async (cfg) => {
            const result = await figmaClient.executeCommand(MCP_COMMANDS.CREATE_VECTOR, cfg);
            // Always extract all IDs from { ids: [...] }
            if (result && Array.isArray(result.ids) && result.ids.length > 0) {
              return result.ids;
            } else if (result && typeof result.id === "string") {
              return [result.id];
            } else {
              throw new Error("Failed to create vector: missing node ID from figmaClient.executeCommand");
            }
          }
        );
        // Flatten all returned ID arrays into a single array
        const nodeIds = results.flat().filter(Boolean);
        return {
          success: true,
          message: nodeIds.length === 1
            ? `Vector created successfully.`
            : `Vectors created successfully.`,
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

  // Get single vector
  server.tool(
    MCP_COMMANDS.GET_VECTOR,
    `Retrieves a single vector node by ID.`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID." })
        .describe("Figma vector node ID to retrieve.")
    },
    {
      title: "Get Vector",
      idempotentHint: true,
      usageExamples: JSON.stringify([{ nodeId: "123:456" }]),
      extraInfo: "Returns vector properties (position, size, and paths)."
    },
    async (args): Promise<any> => {
      try {
        const result = await figmaClient.executeCommand(MCP_COMMANDS.GET_VECTOR, { nodeId: args.nodeId });
        return { vector: result };
      } catch (err) {
        return { success: false, error: { message: err instanceof Error ? err.message : String(err) } };
      }
    }
  );

  // Get multiple vectors
  server.tool(
    MCP_COMMANDS.GET_VECTORS,
    `Retrieves multiple vector nodes by their IDs.`,
    {
      nodeIds: z.array(z.string()
        .refine(isValidNodeId, { message: "Must be valid Figma node IDs." })
      ).min(1).describe("Array of vector node IDs to retrieve.")
    },
    {
      title: "Get Vectors",
      idempotentHint: true,
      usageExamples: JSON.stringify([{ nodeIds: ["123:456", "789:012"] }]),
      extraInfo: "Returns an array of vector objects."
    },
    async (args): Promise<any> => {
      try {
        const result = await figmaClient.executeCommand(MCP_COMMANDS.GET_VECTORS, { nodeIds: args.nodeIds });
        return { vectors: result.vectors || [] };
      } catch (err) {
        return { success: false, error: { message: err instanceof Error ? err.message : String(err) } };
      }
    }
  );
}
