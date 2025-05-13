/**
 * @fileoverview
 * Registers text-creation-related commands for the MCP server.
 * 
 * Exports the function `registerTextCreationCommands` which adds:
 * - create_text: Create a new text element in Figma
 * - create_bounded_text: Create a bounded text box in Figma
 * 
 * These tools validate input parameters, call the Figma client, and handle errors.
 * 
 * @module commands/figma/create/text-creation-tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";
import { CreateTextParams, CreateBoundedTextParams } from "../../../types/command-params.js";
import { v4 as uuidv4 } from "uuid";
import { handleToolError } from "../../../utils/error-handling.js";

/**
 * Registers text-creation-related commands with the MCP server.
 * 
 * @param server - The MCP server instance to register tools on
 * @param figmaClient - The Figma client for executing commands
 * 
 * Adds:
 * - create_text: Create a new text element in Figma
 * - create_bounded_text: Create a bounded text box in Figma
 */
export function registerTextCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  // Register the "create_text" tool for creating a new text element in Figma.
  server.tool(
    "create_text",
    "Create a new text element in Figma",
    {
      x: z.number(), y: z.number(),
      text: z.string(),
      fontSize: z.number().optional(),
      fontWeight: z.number().optional(),
      fontColor: z.any().optional(),
      name: z.string().optional(),
      parentId: z.string().optional()
    },
    // Tool handler: validates input, calls Figma client, and returns result or error.
    async (args, extra): Promise<any> => {
      try {
        const params: CreateTextParams = { commandId: uuidv4(), ...args };
        const node = await figmaClient.createText(params);
        return { content: [{ type: "text", text: `Created text ${node.id}` }] };
      } catch (err) {
        // Handle errors and return a formatted error response.
        return handleToolError(err, "text-creation-tools", "create_text") as any;
      }
    }
  );

  // Register the "create_bounded_text" tool for creating a bounded text box in Figma.
  server.tool(
    "create_bounded_text",
    "Create a bounded text box in Figma",
    {
      x: z.number(), y: z.number(),
      width: z.number(), height: z.number(),
      text: z.string(),
      fontSize: z.number().optional(),
      fontWeight: z.number().optional(),
      fontColor: z.any().optional(),
      name: z.string().optional(),
      parentId: z.string().optional()
    },
    // Tool handler: validates input, calls Figma client, and returns result or error.
    async (args, extra): Promise<any> => {
      try {
        const params: CreateBoundedTextParams = { commandId: uuidv4(), ...args };
        const node = await figmaClient.executeCommand("create_bounded_text", params);
        return { content: [{ type: "text", text: `Created bounded text ${node.id}` }] };
      } catch (err) {
        // Handle errors and return a formatted error response.
        return handleToolError(err, "text-creation-tools", "create_bounded_text") as any;
      }
    }
  );
}
