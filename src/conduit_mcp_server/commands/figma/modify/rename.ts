import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FigmaClient } from "../../../clients/figma-client.js";
import { logger } from "../../../utils/logger.js";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
import { NodeIdsArraySchema } from "./layer-management/node-ids-schema.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers rename commands for the MCP server
 * 
 * These commands handle operations for renaming elements in Figma, including:
 * - Renaming a single layer
 * - Batch renaming multiple layers
 * - AI-assisted renaming
 * - Targeted renaming of multiple elements with individual names
 * 
 * @param {McpServer} server - The MCP server instance
 * @param {FigmaClient} figmaClient - The Figma client instance
 */
export function registerRenameCommands(server: McpServer, figmaClient: FigmaClient) {

  // Unified single/batch rename
  server.tool(
    MCP_COMMANDS.RENAME_LAYER,
    `Renames one or more nodes in Figma. Accepts either a single rename config (via 'rename') or an array of configs (via 'renames').

Input:
  - rename: A single rename configuration object ({ nodeId, newName, setAutoRename? }).
  - renames: An array of rename configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the original and new name(s).
`,
    {
      rename: z.object({
        nodeId: z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .describe("The unique Figma node ID to rename. Must be a string in the format '123:456'."),
        newName: z.string()
          .min(1)
          .max(100)
          .describe("The new name for the node. Must be a non-empty string up to 100 characters."),
        setAutoRename: z.boolean().optional().describe("Whether to preserve TextNode autoRename"),
      }).optional(),
      renames: z.array(
        z.object({
          nodeId: z.string()
            .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
            .describe("The unique Figma node ID to rename. Must be a string in the format '123:456'."),
          newName: z.string()
            .min(1)
            .max(100)
            .describe("The new name for the node. Must be a non-empty string up to 100 characters."),
          setAutoRename: z.boolean().optional().describe("Whether to preserve TextNode autoRename"),
        })
      ).optional()
    },
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
          const result = await figmaClient.executeCommand(MCP_COMMANDS.RENAME_LAYER, {
            nodeId: nodeIdString,
            newName: cfg.newName,
            setAutoRename: cfg.setAutoRename
          });
          results.push({
            originalName: result.originalName,
            newName: result.newName,
            nodeId: nodeIdString,
            setAutoRename: cfg.setAutoRename
          });
        }
        if (results.length === 1) {
          return {
            content: [
              {
                type: "text",
                text: `Renamed node from "${results[0].originalName}" to "${results[0].newName}"${results[0].setAutoRename !== undefined ? ` with autoRename ${results[0].setAutoRename ? 'enabled' : 'disabled'}` : ''}`
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Renamed ${results.length} nodes: ${results.map(r => `"${r.originalName}"→"${r.newName}"`).join(", ")}`
              }
            ]
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error renaming node(s): ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );
}
