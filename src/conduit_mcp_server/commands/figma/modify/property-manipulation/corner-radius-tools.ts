import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";
import { CornerRadiusSchema } from "./corner-radius-schema.js";

/**
 * Registers property-manipulation-related modify commands:
 * - set_corner_radius
 */
export function registerCornerRadiusTools(server: McpServer, figmaClient: FigmaClient) {
  // Set Corner Radius
  server.tool(
    "set_corner_radius",
    `Sets the corner radius of a node in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the updated node's ID.

Annotations:
  - title: "Set Corner Radius"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "radius": 8,
      "corners": [true, false, true, false]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Set corner radius for 123:456" }]
    }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      ...CornerRadiusSchema.shape,
    },
    async ({ nodeId, radius, corners }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_corner_radius", { nodeId: id, radius, corners });
      return { content: [{ type: "text", text: `Set corner radius for ${id}` }] };
    }
    // If the MCP server supports metadata/annotations as a separate argument, add here (non-breaking)
    // {
    //   title: "Set Corner Radius",
    //   idempotentHint: true,
    //   destructiveHint: false,
    //   readOnlyHint: false,
    //   openWorldHint: false
    // }
  );
}
