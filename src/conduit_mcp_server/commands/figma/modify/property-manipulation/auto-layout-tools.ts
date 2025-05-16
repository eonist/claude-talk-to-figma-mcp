import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { AutoLayoutConfigSchema, AutoLayoutResizingSchema } from "./auto-layout-schema.js";

/**
 * Registers property-manipulation-related modify commands:
 * - set_auto_layout
 * - set_auto_layout_resizing
 */
export function registerAutoLayoutTools(server: McpServer, figmaClient: FigmaClient) {
  // Auto Layout
  server.tool(
    "set_auto_layout",
    `Configures auto layout properties for a node in Figma.

Returns:
- content: Array of objects. Each object contains a type: "text" and a text field with the updated node's ID.
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      ...AutoLayoutConfigSchema.shape,
    },
    {
      title: "Set Auto Layout",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false
    },
    async ({ nodeId, layoutMode }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_auto_layout", { nodeId: id, layoutMode });
      return { content: [{ type: "text", text: `Auto layout set for ${id}` }] };
    }
  );
  server.tool(
    "set_auto_layout_resizing",
    `Sets hug or fill sizing mode on an auto layout frame or child node in Figma.

Returns:
- content: Array of objects. Each object contains a type: "text" and a text field with the updated node's ID.
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456'."),
      ...AutoLayoutResizingSchema.shape,
    },
    {
      title: "Set Auto Layout Resizing",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false
    },
    async ({ nodeId, axis, mode }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_auto_layout_resizing", { nodeId: id, axis, mode });
      return { content: [{ type: "text", text: `Auto layout resizing set for ${id}` }] };
    }
  );
}
