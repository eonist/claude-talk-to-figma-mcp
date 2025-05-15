import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers component-creation-related commands with the MCP server.
 * 
 * @param server - The MCP server instance to register tools on
 * @param figmaClient - The Figma client for executing commands
 * 
 * Adds:
 * - create_component_from_node: Convert an existing node into a component
 */
export function registerNodeTools(server: McpServer, figmaClient: FigmaClient) {
  // Register the "create_component_from_node" tool for converting an existing node into a component.
  server.tool(
    "create_component_from_node",
    `Converts an existing node into a component in Figma.

Returns:
- content: Array of objects. Each object contains a type: "text" and a text field with the created component's ID.
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to convert. Must be a string in the format '123:456'."),
    },
    {
      title: "Create Component From Node",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          nodeId: "123:456"
        }
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma node ID.",
        "If the node is not convertible, the command will fail.",
        "The node must not already be a component."
      ],
      extraInfo: "Converts an existing node into a reusable component for design systems."
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
}
