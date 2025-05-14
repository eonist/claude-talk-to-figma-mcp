import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers gradient-related styling commands:
 * - create_gradient_variable
 * - create_gradient_variables
 * - apply_gradient_style
 * - apply_gradient_styles
 * - apply_direct_gradient
 */
export function registerGradientTools(server: McpServer, figmaClient: FigmaClient) {
  // Create Gradient Variable
  server.tool(
    "create_gradient_variable",
    `Creates a gradient paint style in Figma.

Parameters:
  - name (string, required): Name for the gradient style. Must be a non-empty string up to 100 characters. Example: "Primary Gradient"
  - gradientType (string, required): Type of gradient: "LINEAR", "RADIAL", "ANGULAR", or "DIAMOND".
  - stops (array, required): Array of color stops. Each stop is an object with:
    - position (number, required): Position of the stop (0-1).
    - color (tuple, required): RGBA color array (4 numbers, each 0-1).

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created gradient's ID.

Annotations:
  - title: "Create Gradient Variable"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "name": "Primary Gradient",
      "gradientType": "LINEAR",
      "stops": [
        { "position": 0, "color": [1, 0, 0, 1] },
        { "position": 1, "color": [0, 0, 1, 1] }
      ]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Created gradient 123:456" }]
    }
`,
    {
      name: z.string()
        .min(1)
        .max(100)
        .describe("Name for the gradient style. Must be a non-empty string up to 100 characters."),
      gradientType: z.enum(["LINEAR", "RADIAL", "ANGULAR", "DIAMOND"]),
      stops: z.array(
        z.object({
          position: z.number().min(0).max(1),
          color: z.tuple([
            z.number().min(0).max(1),
            z.number().min(0).max(1),
            z.number().min(0).max(1),
            z.number().min(0).max(1)
          ]),
        })
      )
      .min(2)
      .max(10)
      .describe("Array of color stops. Must contain 2 to 10 stops."),
    },
    async ({ name, gradientType, stops }) => {
      const result = await figmaClient.executeCommand("create_gradient_variable", { name, gradientType, stops });
      return { content: [{ type: "text", text: `Created gradient ${result.id}` }] };
    }
  );

  // Batch create gradient variables
  server.tool(
    "create_gradient_variables",
    `Batch create gradient variables in Figma.

Parameters:
  - gradients (array, required): Array of gradient definition objects.

Returns:
  - content: Array containing a text message with the number of gradient variables created.
    Example: { "content": [{ "type": "text", "text": "Batch created 3 gradient variables" }] }
`,
    {
      gradients: z.array(
        z.object({
          name: z.string().min(1).max(100),
          gradientType: z.enum(["LINEAR","RADIAL","ANGULAR","DIAMOND"]),
          stops: z.array(
            z.object({
              position: z.number().min(0).max(1),
              color: z.tuple([
                z.number().min(0).max(1),
                z.number().min(0).max(1),
                z.number().min(0).max(1),
                z.number().min(0).max(1)
              ])
            })
          ).min(2).max(10),
          mode: z.string().optional(),
          opacity: z.number().min(0).max(1).optional(),
          transformMatrix: z.array(z.array(z.number())).optional()
        })
      ).min(1).max(20),
    },
    async ({ gradients }) => {
      const results = await figmaClient.createGradientVariables({ gradients });
      return {
        content: [
          {
            type: "text",
            text: `Batch created ${results.length} gradient variables`
          }
        ],
        _meta: { results }
      };
    }
  );

  // Apply Gradient Style
  server.tool(
    "apply_gradient_style",
    `Apply a gradient style to a node in Figma.

Parameters:
  - nodeId (string, required): The ID of the node to update.
  - gradientStyleId (string, required): The ID of the gradient style to apply.
  - applyTo (string, required): Where to apply the gradient ("FILL", "STROKE", "BOTH").

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Applied gradient to 123:456" }] }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      gradientStyleId: z.string()
        .min(1)
        .max(100)
        .describe("The ID of the gradient style to apply. Must be a non-empty string up to 100 characters."),
      applyTo: z.enum(["FILL", "STROKE", "BOTH"]),
    },
    async ({ nodeId, gradientStyleId, applyTo }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("apply_gradient_style", { nodeId: id, gradientStyleId, applyTo });
      return { content: [{ type: "text", text: `Applied gradient to ${id}` }] };
    }
  );

  // Batch apply gradient styles
  server.tool(
    "apply_gradient_styles",
    `Batch apply gradient styles to nodes in Figma.

Parameters:
  - entries (array, required): Array of objects specifying nodeId, gradientStyleId, and applyTo.

Returns:
  - content: Array containing a text message with the number of gradients applied.
    Example: { "content": [{ "type": "text", "text": "Batch applied gradients: 2/2 successes" }] }
`,
    {
      entries: z.array(
        z.object({
          nodeId: z.string()
            .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
            .describe("The unique Figma node ID to style. Must be a string in the format '123:456'."),
          gradientStyleId: z.string()
            .min(1)
            .max(100)
            .describe("The ID of the gradient style to apply. Must be a non-empty string up to 100 characters."),
          applyTo: z.enum(["FILL","STROKE","BOTH"])
        })
      ).min(1).max(100),
    },
    async ({ entries }) => {
      const results = await figmaClient.applyGradientStyles({ entries });
      return {
        content: [
          {
            type: "text",
            text: `Batch applied gradients: ${results.filter(r => r.success).length}/${results.length} successes`
          }
        ],
        _meta: { results }
      };
    }
  );

  // Apply Direct Gradient
  server.tool(
    "apply_direct_gradient",
    `Apply a gradient directly to a node without using styles.

Parameters:
  - nodeId (string, required): The ID of the node to apply gradient to.
  - gradientType (string, required): Type of gradient ("LINEAR", "RADIAL", "ANGULAR", "DIAMOND").
  - stops (array, required): Array of color stops.
  - applyTo (string, optional): Where to apply the gradient ("FILL", "STROKE", "BOTH").

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Applied direct gradient to 123:456" }] }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to apply gradient to. Must be a string in the format '123:456'."),
      gradientType: z.enum(["LINEAR", "RADIAL", "ANGULAR", "DIAMOND"]).describe("Type of gradient"),
      stops: z.array(
        z.object({
          position: z.number().min(0).max(1),
          color: z.tuple([
            z.number().min(0).max(1),
            z.number().min(0).max(1),
            z.number().min(0).max(1),
            z.number().min(0).max(1)
          ])
        })
      ).min(2).max(10),
      applyTo: z.enum(["FILL", "STROKE", "BOTH"]).default("FILL"),
    },
    async ({ nodeId, gradientType, stops, applyTo }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("apply_direct_gradient", { nodeId: id, gradientType, stops, applyTo });
      return { content: [{ type: "text", text: `Applied direct gradient to ${id}` }] };
    }
  );
}
