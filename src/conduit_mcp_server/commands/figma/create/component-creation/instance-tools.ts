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
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { handleToolError } from "../../../../utils/error-handling.js";

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
export function registerInstanceTools(server: McpServer, figmaClient: FigmaClient) {
  // Register the "create_component_instance" tool for creating a single component instance in Figma.
  server.tool(
    "create_component_instance",
    `Create an instance of a component in Figma.

Parameters:
  - componentKey (string, required): The key of the component to instantiate.
  - x (number, required): X coordinate for the instance.
  - y (number, required): Y coordinate for the instance.

Returns:
  - content: Array containing a text message with the created component instance's node ID.
    Example: { "content": [{ "type": "text", "text": "Created component instance 123:456" }] }

Annotations:
  - title: "Create Component Instance"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "componentKey": "abc123",
      "x": 100,
      "y": 200
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Created component instance 123:456" }]
    }
`,
    {
      // Enforce non-empty string for componentKey
      componentKey: z.string()
        .min(1)
        .max(100)
        .describe("The key of the component to instantiate. Must be a non-empty string. Maximum length 100 characters."),
      // Enforce reasonable X coordinate
      x: z.number()
        .min(-10000)
        .max(10000)
        .describe("X coordinate for the instance. Must be between -10,000 and 10,000."),
      // Enforce reasonable Y coordinate
      y: z.number()
        .min(-10000)
        .max(10000)
        .describe("Y coordinate for the instance. Must be between -10,000 and 10,000."),
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
    `Create multiple component instances in Figma.

Parameters:
  - instances (array, required): An array of instance configuration objects. Each object should include:
      - componentKey (string, required): The key of the component to instantiate.
      - x (number, required): X coordinate for the instance.
      - y (number, required): Y coordinate for the instance.

Returns:
  - content: Array containing a text message with the number of component instances created.
    Example: { "content": [{ "type": "text", "text": "Created 3/3 component instances." }] }

Annotations:
  - title: "Create Component Instances (Batch)"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "instances": [
        { "componentKey": "abc123", "x": 100, "y": 200 },
        { "componentKey": "def456", "x": 300, "y": 400 }
      ]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Created 2/2 component instances." }]
    }
`,
    {
      // Enforce array of instance configs, each with validated fields
      instances: z.array(
        z.object({
          // Enforce non-empty string for componentKey
          componentKey: z.string()
            .min(1)
            .max(100)
            .describe("The key of the component to instantiate. Must be a non-empty string. Maximum length 100 characters."),
          // Enforce reasonable X coordinate
          x: z.number()
            .min(-10000)
            .max(10000)
            .describe("X coordinate for the instance. Must be between -10,000 and 10,000."),
          // Enforce reasonable Y coordinate
          y: z.number()
            .min(-10000)
            .max(10000)
            .describe("Y coordinate for the instance. Must be between -10,000 and 10,000."),
        })
      )
      .min(1)
      .max(50)
      .describe("Array of component instance specs. Must contain 1 to 50 items."),
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
}
