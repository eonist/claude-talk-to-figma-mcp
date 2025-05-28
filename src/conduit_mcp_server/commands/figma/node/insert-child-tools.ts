import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { InsertChildOperation } from "./schema/insert-child-schema.js";

/**
 * Registers child node insertion tools on the MCP server for managing Figma node hierarchies.
 * 
 * This function adds a comprehensive tool for inserting child nodes into parent containers 
 * at specific positions within the Figma node tree. It supports both single insertions 
 * and batch operations with configurable error handling, position maintenance options, 
 * and flexible index positioning for precise hierarchy management.
 * 
 * @param {McpServer} server - The MCP server instance to register the insertion tools on
 * @param {FigmaClient} figmaClient - The Figma client instance for API communication
 * 
 * @returns {void} This function has no return value but registers the tools asynchronously
 * 
 * @throws {Error} Throws an error if parent/child relationships are invalid, nodes don't exist, or index positions are out of bounds
 * 
 * @example
 * ```
 * // Single child insertion
 * const result = await insertTool({
 *   parentId: "parent:123",
 *   childId: "child:456",
 *   index: 0,
 *   maintainPosition: true
 * });
 * 
 * // Batch insertion with error handling
 * const result = await insertTool({
 *   operations: [
 *     { parentId: "parent:123", childId: "child:456", index: 0 },
 *     { parentId: "parent:789", childId: "child:101", index: 2, maintainPosition: true }
 *   ],
 *   options: { skipErrors: true }
 * });
 * ```
 * 
 * @note Index parameter is zero-based; omitting it appends the child at the end of the parent's children array
 * @note maintainPosition preserves the child's absolute canvas position during insertion
 * @note skipErrors option allows batch operations to continue despite individual failures
 * @warning Invalid parent/child relationships may result in unexpected node positioning or hierarchy corruption
 * @since 1.0.0
 * @see {@link https://www.figma.com/developers/api#set-node} Figma Set Node API
 */
export function registerInsertChildTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.SET_NODE,
    `Sets or inserts one or more child nodes into parent nodes at optional index positions in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the parentId, childId, index, success status, and any error message.
`,
    InsertChildOperation.shape,
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
        // Loop through each operation and send as a single command to the plugin
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
        for (const op of operations) {
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
              continue;
            }
            throw error;
          }
        }
        const anySuccess = results.some(r => r.success);
        const response = {
          success: anySuccess,
          results
        };
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
