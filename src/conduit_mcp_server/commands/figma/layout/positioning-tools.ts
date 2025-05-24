import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { MoveNodeSchema } from "./schema/move-node-schema.js";
//import { logger } from "../../../utils/logger.js";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
//import { handleToolError } from "../../../utils/error-handling.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers positioning-related modify commands:
 * - move_node
 * - resize_node
 */
export function registerPositioningCommands(server: McpServer, figmaClient: FigmaClient) {
  // Unified single/batch node move
  server.tool(
    MCP_COMMANDS.MOVE_NODE,
    `Moves one or more nodes to a new position in Figma. Accepts either a single move config (via 'move') or an array of configs (via 'moves').

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the moved node ID(s) and new position(s).
`,
    MoveNodeSchema.shape,
    {
      title: "Move Node(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { move: { nodeId: "123:456", x: 100, y: 200 } },
        { moves: [
          { nodeId: "123:456", x: 100, y: 200 },
          { nodeId: "789:101", x: 300, y: 400 }
        ]}
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma node ID.",
        "x and y must be within allowed range."
      ],
      extraInfo: "Use this command to move one or more nodes to a new position."
    },
    async (args: any) => {
      try {
        let movesArr;
        if (args.moves) {
          movesArr = args.moves;
        } else if (args.move) {
          movesArr = [args.move];
        } else {
          throw new Error("You must provide either 'move' or 'moves' as input.");
        }
        const results = [];
        let anySuccess = false;
        for (const cfg of movesArr) {
          const id = ensureNodeIdIsString(cfg.nodeId);
          try {
            await figmaClient.moveNode({ nodeId: id, x: cfg.x, y: cfg.y });
            results.push({ nodeId: id, x: cfg.x, y: cfg.y, success: true });
            anySuccess = true;
          } catch (err: any) {
            results.push({
              nodeId: id,
              x: cfg.x,
              y: cfg.y,
              success: false,
              error: err?.message || String(err),
              meta: {
                operation: "move_node",
                params: { ...cfg }
              }
            });
          }
        }
        if (anySuccess) {
          return { success: true, results };
        } else {
          return {
            success: false,
            error: {
              message: "All move operations failed",
              results
            }
          };
        }
      } catch (err) {
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

}
