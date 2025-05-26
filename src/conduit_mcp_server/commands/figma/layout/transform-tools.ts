import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { ResizeNodeSchema } from "./schema/transform-schema.js";
import { RotateNodeSchema, RotateNodeShape } from "./schema/rotate-node-schema.js";

export function registerTransformCommands(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.RESIZE_NODE,
    `Resize a node in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the resized node's ID and new size.
`,
    ResizeNodeSchema.shape,
    {
      title: "Resize Node",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456", width: 200, height: 100 },
        { nodeId: "789:101", width: 400, height: 300 }
      ])
    },
    async ({ nodeId, width, height }: { nodeId: string; width: number; height: number }) => {
      const id = ensureNodeIdIsString(nodeId);
      try {
        await figmaClient.executeCommand(MCP_COMMANDS.RESIZE_NODE, { nodeId: id, width, height });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                results: [
                  { nodeId: id, width, height, success: true }
                ]
              })
            }
          ]
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                error: {
                  message: "Resize failed",
                  results: [
                    {
                      nodeId: id,
                      width,
                      height,
                      success: false,
                      error: err?.message || String(err),
                      meta: {
                        operation: "resize_node",
                        params: { nodeId: id, width, height }
                      }
                    }
                  ],
                  meta: {
                    operation: "resize_node",
                    params: [{ nodeId: id, width, height }]
                  }
                }
              })
            }
          ]
        };
      }
    }
  );

  // Register rotate_node command
  server.tool(
    MCP_COMMANDS.ROTATE_NODE,
    `Rotate a node in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the rotated node's ID, angle, and pivot info.
`,
    RotateNodeShape,
    {
      title: "Rotate Node",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456", angle: 45 },
        { nodeId: "123:456", angle: 90, pivot: "top-left" },
        { nodeId: "123:456", angle: 180, pivot: "bottom-right" },
        { nodeId: "123:456", angle: 30, pivot: "custom", pivotPoint: { x: 500, y: 200 } }
      ])
    },
    async ({
      nodeId,
      angle,
      pivot = "center",
      pivotPoint
    }: {
      nodeId: string;
      angle: number;
      pivot?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "custom";
      pivotPoint?: { x: number; y: number };
    }) => {
      const id = ensureNodeIdIsString(nodeId);
      try {
        await figmaClient.executeCommand(MCP_COMMANDS.ROTATE_NODE, {
          nodeId: id,
          angle,
          pivot,
          pivotPoint
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                results: [
                  { nodeId: id, angle, pivot, pivotPoint, success: true }
                ]
              })
            }
          ]
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                error: {
                  message: "Rotate failed",
                  results: [
                    {
                      nodeId: id,
                      angle,
                      pivot,
                      pivotPoint,
                      success: false,
                      error: err?.message || String(err),
                      meta: {
                        operation: "rotate_node",
                        params: { nodeId: id, angle, pivot, pivotPoint }
                      }
                    }
                  ],
                  meta: {
                    operation: "rotate_node",
                    params: [{ nodeId: id, angle, pivot, pivotPoint }]
                  }
                }
              })
            }
          ]
        };
      }
    }
  );
}
