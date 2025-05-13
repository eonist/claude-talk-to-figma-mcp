/**
 * @fileoverview
 * Registers component-creation-related commands for the MCP server.
 * 
 * Exports the function `registerComponentCreationCommands` which adds:
 * - create_component_instance: Create a single component instance in Figma
 * - create_component_instances: Create multiple component instances in Figma
 * - create_component_from_node: Convert an existing node into a component
 * - create_button: Create a complete button (frame, background, text) in Figma
 * 
 * These tools validate input parameters, call the Figma client, and handle errors.
 * 
 * @module commands/figma/create/component-creation-tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";
import { processBatch } from "../../../utils/batch-processor.js";
import { handleToolError } from "../../../utils/error-handling.js";

/**
 * Registers component-creation-related commands with the MCP server.
 * 
 * @param server - The MCP server instance to register tools on
 * @param figmaClient - The Figma client for executing commands
 * 
 * Adds:
 * - create_component_instance: Create a single component instance in Figma
 * - create_component_instances: Create multiple component instances in Figma
 * - create_component_from_node: Convert an existing node into a component
 * - create_button: Create a complete button (frame, background, text) in Figma
 */
export function registerComponentCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  // Register the "create_component_instance" tool for creating a single component instance in Figma.
  server.tool(
    "create_component_instance",
    "Create an instance of a component in Figma",
    {
      componentKey: z.string(),
      x: z.number(),
      y: z.number()
    },
    // Tool handler: validates input, calls Figma client, and returns result or error.
    async ({ componentKey, x, y }): Promise<any> => {
      try {
        const result = await figmaClient.executeCommand("create_component_instance", { componentKey, x, y });
        return { content: [{ type: "text", text: `Created component instance ${result.id}` }] };
      } catch (err) {
        // Handle errors and return a formatted error response.
        return handleToolError(err, "component-creation-tools", "create_component_instance") as any;
      }
    }
  );

  // Register the "create_component_instances" tool for creating multiple component instances in Figma.
  server.tool(
    "create_component_instances",
    "Create multiple component instances in Figma",
    {
      instances: z.array(
        z.object({
          componentKey: z.string(),
          x: z.number(),
          y: z.number()
        })
      ).describe("Component instance specs")
    },
    // Tool handler: processes each instance, calls Figma client, and returns batch results.
    async ({ instances }): Promise<any> => {
      try {
        const results = await processBatch(
          instances,
          cfg => figmaClient.executeCommand("create_component_instance", cfg).then(res => res.id)
        );
        const successCount = results.filter(r => r.result !== undefined).length;
        return {
          content: [{ type: "text", text: `Created ${successCount}/${instances.length} component instances.` }],
          _meta: { results }
        };
      } catch (err) {
        // Handle errors and return a formatted error response.
        return handleToolError(err, "component-creation-tools", "create_component_instances") as any;
      }
    }
  );

  // Register the "create_component_from_node" tool for converting an existing node into a component.
  server.tool(
    "create_component_from_node",
    "Convert an existing node into a component",
    { nodeId: z.string() },
    // Tool handler: validates input, calls Figma client, and returns result or error.
    async ({ nodeId }): Promise<any> => {
      try {
        const id = ensureNodeIdIsString(nodeId);
        const result = await figmaClient.executeCommand("create_component_from_node", { nodeId: id });
        return { content: [{ type: "text", text: `Created component ${result.componentId}` }] };
      } catch (err) {
        // Handle errors and return a formatted error response.
        return handleToolError(err, "component-creation-tools", "create_component_from_node") as any;
      }
    }
  );

  // Register the "create_button" tool for creating a complete button (frame, background, text) in Figma.
  server.tool(
    "create_button",
    "Create a complete button with background and text in Figma",
    {
      x: z.number(),
      y: z.number(),
      width: z.number().optional().default(100),
      height: z.number().optional().default(40),
      text: z.string().optional().default("Button"),
      background: z.object({
        r: z.number().min(0).max(1),
        g: z.number().min(0).max(1),
        b: z.number().min(0).max(1),
        a: z.number().min(0).max(1).optional().default(1)
      }).optional().default({ r: 0.19, g: 0.39, b: 0.85, a: 1 }),
      textColor: z.object({
        r: z.number().min(0).max(1),
        g: z.number().min(0).max(1),
        b: z.number().min(0).max(1),
        a: z.number().min(0).max(1).optional().default(1)
      }).optional().default({ r: 1, g: 1, b: 1, a: 1 }),
      fontSize: z.number().optional().default(14),
      fontWeight: z.number().optional().default(500),
      cornerRadius: z.number().min(0).optional().default(4),
      name: z.string().optional(),
      parentId: z.string().optional()
    },
    // Tool handler: formats parameters, calls Figma client, and returns result or error.
    async (args, extra): Promise<any> => {
      try {
        // Format params to match the ui.js createButton format
        const params = {
          x: args.x,
          y: args.y,
          width: args.width,
          height: args.height,
          text: args.text,
          style: {
            background: args.background,
            text: args.textColor,
            fontSize: args.fontSize,
            fontWeight: args.fontWeight,
            cornerRadius: args.cornerRadius
          },
          name: args.name,
          parentId: args.parentId
        };

        // Execute the createButton command via figmaClient
        const result = await figmaClient.executeCommand("create_button", params);
        
        return { 
          content: [{ 
            type: "text", 
            text: `Created button with frame ID: ${result.frameId}, background ID: ${result.backgroundId}, text ID: ${result.textId}` 
          }],
          _meta: {
            frameId: result.frameId,
            backgroundId: result.backgroundId,
            textId: result.textId
          }
        };
      } catch (err) {
        // Handle errors and return a formatted error response.
        return handleToolError(err, "component-creation-tools", "create_button") as any;
      }
    }
  );
}
