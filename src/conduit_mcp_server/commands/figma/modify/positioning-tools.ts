import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
import { handleToolError } from "../../../utils/error-handling.js";
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

Input:
  - move: A single move configuration object ({ nodeId, x, y }).
  - moves: An array of move configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the moved node ID(s) and new position(s).
`,
    {
      move: z.object({
        nodeId: z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .describe("The unique Figma node ID to move. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
        x: z.number()
          .min(-10000)
          .max(10000)
          .describe("New X position. Must be between -10,000 and 10,000."),
        y: z.number()
          .min(-10000)
          .max(10000)
          .describe("New Y position. Must be between -10,000 and 10,000."),
      }).optional(),
      moves: z.array(
        z.object({
          nodeId: z.string()
            .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
            .describe("The unique Figma node ID to move. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
          x: z.number()
            .min(-10000)
            .max(10000)
            .describe("New X position. Must be between -10,000 and 10,000."),
          y: z.number()
            .min(-10000)
            .max(10000)
            .describe("New Y position. Must be between -10,000 and 10,000."),
        })
      ).optional()
    },
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
        for (const cfg of movesArr) {
          const id = ensureNodeIdIsString(cfg.nodeId);
          await figmaClient.moveNode({ nodeId: id, x: cfg.x, y: cfg.y });
          results.push({ id, x: cfg.x, y: cfg.y });
        }
        if (results.length === 1) {
          return { content: [{ type: "text", text: `Moved ${results[0].id} to (${results[0].x},${results[0].y})` }] };
        } else {
          return { content: [{ type: "text", text: `Moved ${results.length} nodes to new positions.` }] };
        }
      } catch (err) {
        return handleToolError(err, "positioning-tools", "move_node") as any;
      }
    }
  );

}
