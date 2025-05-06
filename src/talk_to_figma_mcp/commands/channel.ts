/**
 * Registers channel management command for the MCP server.
 *
 * This module provides the 'join' command to establish a dedicated communication
 * channel between the MCP server and Figma plugin. Subsequent commands require
 * this channel to be joined first.
 *
 * @module channel
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FigmaClient } from "../clients/figma-client.js";
import { logger } from "../utils/logger.js";
import { joinChannel } from "../server/websocket.js";

/**
 * Registers channel-related commands for the MCP server
 * 
 * These commands handle operations related to Figma communication channels,
 * such as joining a channel to establish a connection with Figma.
 * 
 * @param {McpServer} server - The MCP server instance
 * @param {FigmaClient} figmaClient - The Figma client instance
 */
export function registerChannelCommand(server: McpServer, figmaClient: FigmaClient): void {
  /**
   * Join Channel Tool
   *
   * Allows joining a specific channel to communicate with Figma.
   */
  server.tool(
    "join_channel",
    "Join a specific channel to communicate with Figma",
    {
      channel: z.string().describe("The name of the channel to join").default(""),
    },
    async ({ channel }) => {
      try {
        if (!channel) {
          // If no channel provided, ask the user for input
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

        // Check if we're already in the requested channel
        const currentChannel = figmaClient.getCurrentChannel();
        if (currentChannel === channel) {
          return {
            content: [
              {
                type: "text",
                text: `Already joined channel: ${channel}`,
              },
            ],
          };
        }

        // Join the new channel
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
