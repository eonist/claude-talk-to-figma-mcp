import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { ResizeNodeSchema } from "./schema/transform-schema.js";

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
      openWorldHint: false
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
}
