import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FigmaClient } from "../../../clients/figma-client.js";
import { logger } from "../../../utils/logger.js";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
//import { NodeIdsArraySchema } from "./layer-management/node-ids-schema.js";
import { RenameSchema } from "./schema/rename-schema.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers node renaming tools on the MCP server for updating Figma node names and auto-rename settings.
 * 
 * This function adds a unified renaming tool that supports both single node renaming and batch 
 * renaming operations. The tool provides comprehensive name management capabilities including
 * custom naming, auto-rename behavior control for text nodes, and detailed feedback on 
 * renaming operations with original and new names for audit and tracking purposes.
 * 
 * @param {McpServer} server - The MCP server instance to register the renaming tools on
 * @param {FigmaClient} figmaClient - The Figma client instance for API communication
 * 
 * @returns {void} This function has no return value but registers the tools asynchronously
 * 
 * @throws {Error} Throws an error if node IDs are invalid, new names exceed character limits, or nodes are not found
 * 
 * @example
 * ```
 * // Rename single node with auto-rename control
 * const result = await renameTool({
 *   rename: { 
 *     nodeId: "123:456", 
 *     newName: "Updated Header Text",
 *     setAutoRename: false 
 *   }
 * });
 * 
 * // Batch rename multiple nodes
 * const result = await renameTool({
 *   renames: [
 *     { nodeId: "123:456", newName: "Primary Button" },
 *     { nodeId: "789:101", newName: "Secondary Button", setAutoRename: true },
 *     { nodeId: "abc:def", newName: "Navigation Menu" }
 *   ]
 * });
 * ```
 * 
 * @note New names must be non-empty strings with a maximum length of 100 characters
 * @note setAutoRename parameter controls automatic naming behavior specifically for TextNode elements
 * @note Batch operations continue processing even if individual renames fail, providing comprehensive error reporting
 * @note Original names are preserved in the response for audit trails and rollback scenarios
 * @warning Empty or excessively long names will cause the operation to fail
 * @since 1.0.0
 * @see {@link https://www.figma.com/developers/api#rename-node} Figma Rename Node API
 */
export function registerRenameCommands(server: McpServer, figmaClient: FigmaClient) {

  // Unified single/batch rename
  server.tool(
    MCP_COMMANDS.RENAME_LAYER,
    `Renames one or more nodes in Figma. Accepts either a single rename config (via 'rename') or an array of configs (via 'renames').

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the original and new name(s).
`,
    RenameSchema.shape,
    {
      title: "Rename Layer(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { rename: { nodeId: "123:456", newName: "New Name", setAutoRename: true } },
        { renames: [
          { nodeId: "123:456", newName: "Layer 1" },
          { nodeId: "789:101", newName: "Layer 2", setAutoRename: false }
        ]}
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma node ID.",
        "newName must be a non-empty string up to 100 characters.",
        "setAutoRename is optional and controls TextNode autoRename behavior."
      ],
      extraInfo: "Use this command to rename one or more nodes with optional autoRename control."
    },
    async (args) => {
      try {
        let renamesArr;
        if (args.renames) {
          renamesArr = args.renames;
        } else if (args.rename) {
          renamesArr = [args.rename];
        } else {
          throw new Error("You must provide either 'rename' or 'renames' as input.");
        }
        const results = [];
        for (const cfg of renamesArr) {
          const nodeIdString = ensureNodeIdIsString(cfg.nodeId);
          logger.debug(`Renaming node with ID: ${nodeIdString} to "${cfg.newName}"`);
          try {
            const result = await figmaClient.executeCommand(MCP_COMMANDS.RENAME_LAYER, {
              nodeId: nodeIdString,
              newName: cfg.newName,
              setAutoRename: cfg.setAutoRename
            });
            results.push({
              originalName: result.originalName,
              newName: result.newName,
              nodeId: nodeIdString,
              setAutoRename: cfg.setAutoRename,
              success: true
            });
          } catch (err) {
            results.push({
              nodeId: nodeIdString,
              newName: cfg.newName,
              setAutoRename: cfg.setAutoRename,
              success: false,
              error: err instanceof Error ? err.message : String(err),
              meta: {
                operation: "rename_layer",
                params: cfg
              }
            });
          }
        }
        const anySuccess = results.some(r => r.success);
        let response;
        if (anySuccess) {
          response = { success: true, results };
        } else {
          response = {
            success: false,
            error: {
              message: "All rename_layer operations failed",
              results,
              meta: {
                operation: "rename_layer",
                params: renamesArr
              }
            }
          };
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response)
            }
          ]
        };
      } catch (error) {
        const response = {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
            results: [],
            meta: {
              operation: "rename_layer",
              params: args
            }
          }
        };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response)
            }
          ]
        };
      }
    }
  );
}
