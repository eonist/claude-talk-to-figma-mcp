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
    `
Converts an existing node into a component in Figma.

**Parameters:**
- \`nodeId\` (string, required): **Node ID**. Required. The unique Figma node ID to convert. Must be a string in the format '123:456'. Example: "456:789"

**Returns:**
- \`content\`: Array of objects. Each object contains a \`type: "text"\` and a \`text\` field with the created component's ID.

**Security & Behavior:**
- Idempotent: true
- Destructive: false
- Read-only: false
- Open-world: false

**Usage Example:**
Input:
\`\`\`json
{
  "nodeId": "456:789"
}
\`\`\`
Output:
\`\`\`json
{
  "content": [{ "type": "text", "text": "Created component 123:456" }]
}
\`\`\`
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
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
}
