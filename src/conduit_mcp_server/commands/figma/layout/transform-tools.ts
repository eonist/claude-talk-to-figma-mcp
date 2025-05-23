import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
//import { logger } from "../../../utils/logger.js";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers transformation-related modify commands:
 * - resize_node
 * - resize_nodes
 * - (future: rotation, scaling, flipping)
 */
export function registerTransformCommands(server: McpServer, figmaClient: FigmaClient) {
  // Resize Node Tool
  server.tool(
    MCP_COMMANDS.RESIZE_NODE,
    `Resize a node in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the resized node's ID and new size.
`,
    {
      // Validate nodeId as simple or complex Figma node ID, preserving original description
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to resize. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      // Enforce positive width, reasonable upper bound
      width: z.number()
        .min(1)
        .max(10000)
        .describe("The new width for the node, in pixels. Must be a positive number between 1 and 10,000."),
      // Enforce positive height, reasonable upper bound
      height: z.number()
        .min(1)
        .max(10000)
        .describe("The new height for the node, in pixels. Must be a positive number between 1 and 10,000."),
    },
    {
      title: "Resize Node",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false
    },
    async ({ nodeId, width, height }) => {
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
