import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers auto layout related commands:
 * - set_auto_layout
 * - set_auto_layout_resizing
 */
export function registerAutoLayoutTools(server: McpServer, figmaClient: FigmaClient) {
  // Set Auto Layout
  server.tool(
    "set_auto_layout",
    `Configure auto layout properties for a node in Figma.

Parameters:
  - nodeId (string, required): The ID of the node.
  - layoutMode (string, required): Layout mode ("HORIZONTAL", "VERTICAL", "NONE").

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Auto layout set for 123:456" }] }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      layoutMode: z.enum(["HORIZONTAL", "VERTICAL", "NONE"])
        .describe('The auto layout mode to set: "HORIZONTAL", "VERTICAL", or "NONE".'),
    },
    async ({ nodeId, layoutMode }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_auto_layout", { nodeId: id, layoutMode });
      return { content: [{ type: "text", text: `Auto layout set for ${id}` }] };
    }
  );

  // Set Auto Layout Resizing
  server.tool(
    "set_auto_layout_resizing",
    `Set hug or fill sizing mode on an auto layout frame or child node.

Parameters:
  - nodeId (string, required): The ID of the node.
  - axis (string, required): Axis ("horizontal" or "vertical").
  - mode (string, required): Sizing mode ("FIXED", "HUG", "FILL").

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Auto layout resizing set for 123:456" }] }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456'."),
      axis: z.enum(["horizontal", "vertical"])
        .describe('The axis to set sizing mode for: "horizontal" or "vertical".'),
      mode: z.enum(["FIXED", "HUG", "FILL"])
        .describe('The sizing mode to set: "FIXED", "HUG", or "FILL".'),
    },
    async ({ nodeId, axis, mode }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_auto_layout_resizing", { nodeId: id, axis, mode });
      return { content: [{ type: "text", text: `Auto layout resizing set for ${id}` }] };
    }
  );
}
