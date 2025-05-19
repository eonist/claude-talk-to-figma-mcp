import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { CornerRadiusSchema } from "./corner-radius-schema.js";
import { MCP_COMMANDS } from "../../../../types/commands.js";

/**
 * Registers corner radius command on the MCP server.
 *
 * This function adds a tool named "set_corner_radius" to the MCP server,
 * enabling setting the corner radius of a node in Figma, optionally specifying which corners.
 * It validates input, executes the corresponding Figma command, and returns the result.
 *
 * @param {McpServer} server - The MCP server instance to register the tool on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tool asynchronously.
 *
 * @example
 * registerCornerRadiusTools(server, figmaClient);
 */
export function registerCornerRadiusTools(server: McpServer, figmaClient: FigmaClient) {
  // Set Corner Radius
  server.tool(
    MCP_COMMANDS.SET_CORNER_RADIUS,
    `Sets the corner radius of a node in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the updated node's ID.
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      ...CornerRadiusSchema.shape,
    },
    {
      title: "Set Corner Radius",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456", radius: 8 }
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma node ID.",
        "Radius must be a non-negative number.",
        "Corners array, if provided, must have four boolean values."
      ],
      extraInfo: "Use this command to set the corner radius of a node, optionally specifying which corners."
    },
    async ({ nodeId, radius, corners }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_corner_radius", { nodeId: id, radius, corners });
      return { content: [{ type: "text", text: `Set corner radius for ${id}` }] };
    }
  );
}
