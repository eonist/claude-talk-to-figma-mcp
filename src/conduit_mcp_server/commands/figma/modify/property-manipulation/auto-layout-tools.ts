import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { AutoLayoutConfigSchema, AutoLayoutResizingSchema } from "./auto-layout-schema.js";
import { MCP_COMMANDS } from "../../../../types/commands.js";

/**
 * Registers auto layout commands on the MCP server.
 *
 * This function adds tools named "set_auto_layout" and "set_auto_layout_resizing" to the MCP server,
 * enabling configuration of auto layout properties and resizing modes for Figma nodes.
 * It validates inputs, executes corresponding Figma commands, and returns informative results.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerAutoLayoutTools(server, figmaClient);
 */
export function registerAutoLayoutTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.SET_AUTO_LAYOUT_RESIZING,
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
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456", axis: "horizontal", mode: "HUG" }
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma node ID.",
        "axis must be 'horizontal' or 'vertical'.",
        "mode must be 'FIXED', 'HUG', or 'FILL'."
      ],
      extraInfo: "Sets hug or fill sizing mode on an auto layout frame or child node."
    },
    async ({ nodeId, axis, mode }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand(MCP_COMMANDS.SET_AUTO_LAYOUT_RESIZING, { nodeId: id, axis, mode });
      return { content: [{ type: "text", text: `Auto layout resizing set for ${id}` }] };
    }
  );
}
