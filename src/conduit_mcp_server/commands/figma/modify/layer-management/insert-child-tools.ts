import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { MCP_COMMANDS } from "../../../../types/commands.js";

/**
 * Registers the set_node command on the MCP server to enable setting or inserting a child node into a parent node in Figma.
 *
 * This function integrates the MCP server with the Figma client by adding a tool named "set_node".
 * The tool accepts parameters for the parent node ID, child node ID, and an optional insertion index.
 * It executes the corresponding Figma command to insert the child node at the specified position within the parent.
 *
 * @param {McpServer} server - The MCP server instance to register the tool on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tool asynchronously.
 *
 * @example
 * registerInsertChildTools(server, figmaClient);
 */
export function registerInsertChildTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.SET_NODE,
    `Sets or inserts one or more child nodes into parent nodes at optional index positions in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the parentId, childId, index, success status, and any error message.
`,
    {
      parentId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("ID of the parent node")
        .optional(),
      childId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("ID of the child node to insert")
        .optional(),
      index: z.number()
        .int()
        .min(0)
        .optional()
        .describe("Optional insertion index (0-based)"),
      operations: z.array(z.object({
        parentId: z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID" })
          .describe("ID of the parent node"),
        childId: z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID" })
          .describe("ID of the child node to insert"),
        index: z.number().int().min(0).optional().describe("Optional insertion index (0-based)"),
        maintainPosition: z.boolean().optional().describe("Maintain child's absolute position (default: false)")
      })).optional(),
      options: z.object({
        skipErrors: z.boolean().optional()
      }).optional()
    },
    {
      title: "Insert Child Node(s)",
      idempotentHint: false,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          parentId: "123:456",
          childId: "789:101",
          index: 0
        },
        {
          operations: [
            { parentId: "1:23", childId: "4:56", index: 0, maintainPosition: true },
            { parentId: "7:89", childId: "0:12", index: 2 }
          ],
          options: { skipErrors: true }
        }
      ]),
      edgeCaseWarnings: [
        "Index must be a non-negative integer if provided.",
        "If the parentId or childId is invalid, the command may fail or insert at root.",
        "Omitting index appends the child at the end.",
        "If skipErrors is false, the first error will abort the batch.",
        "If maintainPosition is true, the child's absolute position will be preserved relative to the canvas.",
        "All parentId and childId values must be valid Figma node IDs."
      ],
      detailedDescription: "Supports both single and batch insertions. For batch, provide an 'operations' array.",
      extraInfo: "This command is critical for managing node hierarchies in Figma. Use with valid node IDs to avoid unexpected behavior."
    },
    async (params) => {
      // Batch mode
      if ("operations" in params) {
        const { processBatch } = await import("../../../../utils/batch-processor.js");
        type InsertChildOp = {
          parentId: string;
          childId: string;
          index?: number;
          maintainPosition?: boolean;
        };
        const { operations, options } = params;
        if (!operations || !Array.isArray(operations) || operations.length === 0) {
          const response = {
            success: false,
            error: {
              message: "Batch insert requires a non-empty 'operations' array.",
              results: [],
              meta: {
                operation: "set_node",
                params
              }
            }
          };
          return { content: [{ type: "text", text: JSON.stringify(response) }] };
        }
        const results = [];
        await processBatch(
          operations,
          async (op: InsertChildOp) => {
            try {
              const parent = ensureNodeIdIsString(op.parentId);
              const child = ensureNodeIdIsString(op.childId);
              const cmdParams: any = { parentId: parent, childId: child };
              if (op.index !== undefined) cmdParams.index = op.index;
              if (op.maintainPosition !== undefined) cmdParams.maintainPosition = op.maintainPosition;
              const result = await figmaClient.executeCommand(MCP_COMMANDS.SET_NODE, cmdParams);
              results.push({
                parentId: parent,
                childId: child,
                index: result.index ?? op.index,
                success: true
              });
            } catch (error: any) {
              if (options?.skipErrors) {
                results.push({
                  parentId: op.parentId,
                  childId: op.childId,
                  index: op.index,
                  success: false,
                  error: error.message || String(error),
                  meta: {
                    operation: "set_node",
                    params: op
                  }
                });
                return;
              }
              throw error;
            }
          },
          {
            chunkSize: 20,
            concurrency: 5
          }
        );
        const anySuccess = results.some(r => r.success);
        let response;
        if (anySuccess) {
          response = { success: true, results };
        } else {
          response = {
            success: false,
            error: {
              message: "All set_node operations failed",
              results,
              meta: {
                operation: "set_node",
                params
              }
            }
          };
        }
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
      // Single mode
      const parent = ensureNodeIdIsString(params.parentId);
      const child = ensureNodeIdIsString(params.childId);
      const cmdParams: any = { parentId: parent, childId: child };
      if (params.index !== undefined) cmdParams.index = params.index;
      try {
        const result = await figmaClient.executeCommand(MCP_COMMANDS.SET_NODE, cmdParams);
        const response = {
          success: true,
          results: [{
            parentId: parent,
            childId: child,
            index: result.index ?? params.index,
            success: true
          }]
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      } catch (error) {
        const response = {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
            results: [],
            meta: {
              operation: "set_node",
              params
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
    }
  );
}
