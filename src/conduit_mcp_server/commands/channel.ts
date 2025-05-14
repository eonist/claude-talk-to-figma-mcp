/**
 * Registers channel management command for the MCP server.
 *
 * This module provides the 'join_channel' tool to establish a dedicated communication
 * channel between the MCP server and Figma plugin. Subsequent commands require
 * this channel to be joined first.
 *
 * @module commands/channel
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FigmaClient } from "../clients/figma-client.js";
import { logger } from "../utils/logger.js";
import { joinChannel, connectToFigma, isConnectedToFigma } from "../server/websocket.js";

/**
 * Registers channel-related commands for the MCP server.
 *
 * @param {McpServer} server - The MCP server instance.
 * @param {FigmaClient} figmaClient - The Figma client instance.
 * @example
 * import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
 * import { FigmaClient } from "../clients/figma-client.js";
 * import { registerChannelCommand } from "./channel.js";
 * const server = new McpServer({ name: "MyServer", version: "1.0.0", capabilities: { tools: {} } });
 * const client = new FigmaClient();
 * registerChannelCommand(server, client);
 */
export function registerChannelCommand(server: McpServer, figmaClient: FigmaClient): void {
  server.tool(
    "join_channel",
    `Join a specific channel to communicate with Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the join status message.

Annotations:
  - title: "Join Channel"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "channel": "my-channel"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Successfully joined channel: my-channel" }]
    }
`,
    {
      // Enforce non-empty string for channel name
      channel: z.string()
        .min(1)
        .describe("The name of the channel to join. Must be a non-empty string."),
    },
    async ({ channel }) => {
      try {
        if (!channel) {
          return {
            content: [
              {
                type: "text",
                text: "Please provide a channel name to join:",
              },
            ],
            followUp: {
              tool: "join_channel",
              description: "Join the specified channel",
            },
          };
        }

        const current = figmaClient.getCurrentChannel();
        if (current === channel) {
          return {
            content: [
              {
                type: "text",
                text: `Already joined channel: ${channel}`,
              },
            ],
          };
        }

        if (!isConnectedToFigma()) {
          connectToFigma("localhost", 3055, 2000);
          const start = Date.now();
          const timeoutMs = 10000;
          const intervalMs = 200;
          while (!isConnectedToFigma() && Date.now() - start < timeoutMs) {
            await new Promise(res => setTimeout(res, intervalMs));
          }
        }
        await joinChannel(channel);
        return {
          content: [
            {
              type: "text",
              text: `Successfully joined channel: ${channel}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error joining channel: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}
