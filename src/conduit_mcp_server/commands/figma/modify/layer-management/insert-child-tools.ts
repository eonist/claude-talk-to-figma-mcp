import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";

/**
 * Registers the insert_child command on the MCP server to enable inserting a child node into a parent node in Figma.
 *
 * This function integrates the MCP server with the Figma client by adding a tool named "insert_child".
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
    "insert_child",
    `Inserts a child node into a parent node at an optional index position in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the parentId, childId, final index, and success status.
`,
    {
      parentId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("ID of the parent node"),
      childId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("ID of the child node to insert"),
      index: z.number()
        .int()
        .min(0)
        .optional()
        .describe("Optional insertion index (0-based)"),
    },
    {
      title: "Insert Child Node",
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
          parentId: "123:456",
          childId: "789:101"
        }
      ]),
      edgeCaseWarnings: [
        "Index must be a non-negative integer if provided.",
        "If the parentId or childId is invalid, the command may fail or insert at root.",
        "Omitting index appends the child at the end."
      ],
      detailedDescription: undefined,
      extraInfo: "This command is critical for managing node hierarchies in Figma. Use with valid node IDs to avoid unexpected behavior."
    },
    async ({ parentId, childId, index }) => {
      const parent = ensureNodeIdIsString(parentId);
      const child = ensureNodeIdIsString(childId);
      const params: any = { parentId: parent, childId: child };
      if (index !== undefined) params.index = index;
      const result = await figmaClient.executeCommand("insert_child", params);
      return {
        content: [{
          type: "text",
          text: `Inserted child node ${child} into parent ${parent} at index ${result.index ?? "end"} (success: ${result.success ?? true})`
        }]
      };
    }
  );

  // Batch insert_children tool
  server.tool(
    "insert_children",
    `Batch-inserts multiple child nodes into parent nodes in Figma.

Parameters:
  - operations: Array of objects, each with:
      - parentId: string (required)
      - childId: string (required)
      - index: number (optional)
      - maintainPosition: boolean (optional, default false)
  - options: { skipErrors?: boolean } (optional)

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the parentId, childId, index, success status, and any error message.
`,
    {
      operations: z.array(z.object({
        parentId: z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID" })
          .describe("ID of the parent node"),
        childId: z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID" })
          .describe("ID of the child node to insert"),
        index: z.number().int().min(0).optional().describe("Optional insertion index (0-based)"),
        maintainPosition: z.boolean().optional().describe("Maintain child's absolute position (default: false)")
      })),
      options: z.object({
        skipErrors: z.boolean().optional()
      }).optional()
    },
    {
      title: "Batch Insert Children",
      idempotentHint: false,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          operations: [
            { parentId: "1:23", childId: "4:56", index: 0, maintainPosition: true },
            { parentId: "7:89", childId: "0:12", index: 2 }
          ],
          options: { skipErrors: true }
        }
      ]),
      edgeCaseWarnings: [
        "If skipErrors is false, the first error will abort the batch.",
        "If maintainPosition is true, the child's absolute position will be preserved relative to the canvas.",
        "All parentId and childId values must be valid Figma node IDs."
      ],
      detailedDescription: "Efficiently inserts multiple children into parents in a single batch operation.",
      extraInfo: "Follows the same parenting constraints as Figma's insertChild API."
    },
    async ({ operations, options }) => {
      const { processBatch } = await import("../../../utils/batch-processor.js");
      type InsertChildOp = {
        parentId: string;
        childId: string;
        index?: number;
        maintainPosition?: boolean;
      };
      const results = await processBatch(
        operations,
        async (op: InsertChildOp) => {
          try {
            const parent = ensureNodeIdIsString(op.parentId);
            const child = ensureNodeIdIsString(op.childId);
            const params: any = { parentId: parent, childId: child };
            if (op.index !== undefined) params.index = op.index;
            // Optionally, maintain position logic could be handled in the Figma plugin code
            if (op.maintainPosition !== undefined) params.maintainPosition = op.maintainPosition;
            const result = await figmaClient.executeCommand("insert_child", params);
            return {
              type: "text",
              text: `Inserted child node ${child} into parent ${parent} at index ${result.index ?? "end"} (success: ${result.success ?? true})`
            };
          } catch (error: any) {
            if (options?.skipErrors) {
              return {
                type: "text",
                text: `Failed to insert child node ${op.childId} into parent ${op.parentId}: ${error.message || error}`
              };
            }
            throw error;
          }
        },
        {
          chunkSize: 20,
          concurrency: 5
        }
      );
      return { content: results };
    }
  );
}
