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

  // Unified single/batch node resize
  server.tool(
    MCP_COMMANDS.RESIZE_NODE,
    `Resizes one or more nodes in Figma. Accepts either a single resize config (via 'resize') or an array of configs (via 'resizes').

Input:
  - resize: A single resize configuration object ({ nodeId, width, height }).
  - resizes: An array of resize configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the resized node's ID and new size.
`,
    {
      resize: z.object({
        nodeId: z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .describe("The unique Figma node ID to resize. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
        width: z.number()
          .min(1)
          .max(10000)
          .describe("The new width for the node, in pixels. Must be a positive number between 1 and 10,000."),
        height: z.number()
          .min(1)
          .max(10000)
          .describe("The new height for the node, in pixels. Must be a positive number between 1 and 10,000."),
      }).optional(),
      resizes: z.array(
        z.object({
          nodeId: z.string()
            .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
            .describe("The unique Figma node ID to resize. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
          width: z.number()
            .min(1)
            .max(10000)
            .describe("The new width for the node, in pixels. Must be a positive number between 1 and 10,000."),
          height: z.number()
            .min(1)
            .max(10000)
            .describe("The new height for the node, in pixels. Must be a positive number between 1 and 10,000."),
        })
      ).optional()
    },
    {
      title: "Resize Node(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { resize: { nodeId: "123:456", width: 200, height: 100 } },
        { resizes: [
          { nodeId: "123:456", width: 200, height: 100 },
          { nodeId: "789:101", width: 300, height: 150 }
        ]}
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma node ID.",
        "width and height must be within allowed range."
      ],
      extraInfo: "Use this command to resize one or more nodes."
    },
    async (args: any) => {
      try {
        let resizesArr;
        if (args.resizes) {
          resizesArr = args.resizes;
        } else if (args.resize) {
          resizesArr = [args.resize];
        } else {
          throw new Error("You must provide either 'resize' or 'resizes' as input.");
        }
        const results = [];
        for (const cfg of resizesArr) {
          const id = ensureNodeIdIsString(cfg.nodeId);
          await figmaClient.resizeNode({ nodeId: id, width: cfg.width, height: cfg.height });
          results.push({ id, width: cfg.width, height: cfg.height });
        }
        if (results.length === 1) {
          return { content: [{ type: "text", text: `Resized ${results[0].id} to (${results[0].width}x${results[0].height})` }] };
        } else {
          return { content: [{ type: "text", text: `Resized ${results.length} nodes to new sizes.` }] };
        }
      } catch (err) {
        return handleToolError(err, "positioning-tools", "resize_node") as any;
      }
    }
  );
}
