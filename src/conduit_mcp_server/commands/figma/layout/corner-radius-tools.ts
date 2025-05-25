import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { CornerRadiusSchema } from "./schema/corner-radius-schema.js";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";

export function registerCornerRadiusTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.SET_CORNER_RADIUS,
    `Sets the corner radius of a node in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the updated node's ID.
`,
    CornerRadiusSchema.shape,
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
    async (args: any) => {
      try {
        const id = ensureNodeIdIsString(args.nodeId);
        await figmaClient.executeCommand(MCP_COMMANDS.SET_CORNER_RADIUS, { nodeId: id, radius: args.radius, corners: args.corners });
        const response = { success: true, results: [{ nodeId: id, radius: args.radius, corners: args.corners, updated: true }] };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      } catch (error: any) {
        const response = {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
            results: [],
            meta: {
              operation: "set_corner_radius",
              params: args
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
    }
  );
}
