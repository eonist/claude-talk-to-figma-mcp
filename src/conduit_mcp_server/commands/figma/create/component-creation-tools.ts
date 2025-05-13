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

  // Register the "create_component_from_node" tool for converting an existing node into a component.
  server.tool(
    "create_component_from_node",
    `Convert an existing node into a component.

Parameters:
  - nodeId (string, required): The ID of the node to convert.

Returns:
  - content: Array containing a text message with the created component's ID.
    Example: { "content": [{ "type": "text", "text": "Created component 123:456" }] }

Annotations:
  - title: "Create Component from Node"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "456:789"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Created component 123:456" }]
    }
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma node ID to convert. Must be a string in the format '123:456'."),
    },
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
    `Create a complete button with background and text in Figma.

Parameters:
  - x (number, required): X coordinate for the button.
  - y (number, required): Y coordinate for the button.
  - width (number, optional): Width of the button (default 100).
  - height (number, optional): Height of the button (default 40).
  - text (string, optional): Button text (default "Button").
  - background (object, optional): Background color (default { r: 0.19, g: 0.39, b: 0.85, a: 1 }).
  - textColor (object, optional): Text color (default { r: 1, g: 1, b: 1, a: 1 }).
  - fontSize (number, optional): Font size (default 14).
  - fontWeight (number, optional): Font weight (default 500).
  - cornerRadius (number, optional): Corner radius (default 4).
  - name (string, optional): Name for the button node.
  - parentId (string, optional): Figma node ID of the parent.

Returns:
  - content: Array containing a text message with the created button's frame, background, and text node IDs.
    Example: { "content": [{ "type": "text", "text": "Created button with frame ID: 123, background ID: 456, text ID: 789" }] }

Annotations:
  - title: "Create Button"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "x": 100,
      "y": 200,
      "width": 120,
      "height": 40,
      "text": "Click Me"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Created button with frame ID: 123, background ID: 456, text ID: 789" }]
    }
`,
    {
      // Enforce reasonable X coordinate
      x: z.number()
        .min(-10000)
        .max(10000)
        .describe("X coordinate for the button. Must be between -10,000 and 10,000."),
      // Enforce reasonable Y coordinate
      y: z.number()
        .min(-10000)
        .max(10000)
        .describe("Y coordinate for the button. Must be between -10,000 and 10,000."),
      // Enforce positive width, reasonable upper bound
      width: z.number()
        .min(1)
        .max(2000)
        .optional()
        .default(100)
        .describe("Optional. Width of the button. Must be between 1 and 2000. Defaults to 100."),
      // Enforce positive height, reasonable upper bound
      height: z.number()
        .min(1)
        .max(2000)
        .optional()
        .default(40)
        .describe("Optional. Height of the button. Must be between 1 and 2000. Defaults to 40."),
      // Enforce non-empty string for text, reasonable length
      text: z.string()
        .min(1)
        .max(200)
        .optional()
        .default("Button")
        .describe('Optional. Button text. Must be a non-empty string up to 200 characters. Defaults to "Button".'),
      // Enforce color object with r,g,b,a in [0,1]
      background: z.object({
        r: z.number().min(0).max(1).describe("Red channel (0-1)"),
        g: z.number().min(0).max(1).describe("Green channel (0-1)"),
        b: z.number().min(0).max(1).describe("Blue channel (0-1)"),
        a: z.number().min(0).max(1).optional().default(1).describe("Alpha channel (0-1, optional, default 1)")
      })
      .optional()
      .default({ r: 0.19, g: 0.39, b: 0.85, a: 1 })
      .describe("Optional. Background color as RGBA object. Defaults to { r: 0.19, g: 0.39, b: 0.85, a: 1 }."),
      // Enforce color object with r,g,b,a in [0,1]
      textColor: z.object({
        r: z.number().min(0).max(1).describe("Red channel (0-1)"),
        g: z.number().min(0).max(1).describe("Green channel (0-1)"),
        b: z.number().min(0).max(1).describe("Blue channel (0-1)"),
        a: z.number().min(0).max(1).optional().default(1).describe("Alpha channel (0-1, optional, default 1)")
      })
      .optional()
      .default({ r: 1, g: 1, b: 1, a: 1 })
      .describe("Optional. Text color as RGBA object. Defaults to { r: 1, g: 1, b: 1, a: 1 }."),
      // Enforce positive font size, reasonable upper bound
      fontSize: z.number()
        .min(1)
        .max(200)
        .optional()
        .default(14)
        .describe("Optional. Font size. Must be between 1 and 200. Defaults to 14."),
      // Enforce reasonable font weight
      fontWeight: z.number()
        .min(100)
        .max(1000)
        .optional()
        .default(500)
        .describe("Optional. Font weight. Must be between 100 and 1000. Defaults to 500."),
      // Enforce non-negative corner radius, reasonable upper bound
      cornerRadius: z.number()
        .min(0)
        .max(100)
        .optional()
        .default(4)
        .describe("Optional. Corner radius. Must be between 0 and 100. Defaults to 4."),
      // Enforce non-empty string for name if provided
      name: z.string()
        .min(1)
        .max(100)
        .optional()
        .describe("Optional. Name for the button node. If provided, must be a non-empty string up to 100 characters."),
      // Enforce Figma node ID format for parentId if provided
      parentId: z.string()
        .regex(/^\d+:\d+$/)
        .optional()
        .describe("Optional. Figma node ID of the parent. If provided, must be a string in the format '123:456'."),
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
