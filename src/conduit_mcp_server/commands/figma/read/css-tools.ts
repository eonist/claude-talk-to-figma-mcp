import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FigmaClient } from "../../../clients/figma-client/index.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";

/**
 * Registers CSS read command:
 * - get_css_async
 */
export function registerCssTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "get_css_async",
    `Get CSS properties from a node.

Parameters:
  - nodeId (string, optional): Optional ID of the node to get CSS from.
  - format (string, optional): Format to return CSS in ("object", "string", "inline").

Returns:
  - content: Array containing a text message with the CSS properties as JSON.
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .optional()
        .describe("Optional. The unique Figma node ID to get CSS from. If provided, must be a string in the format '123:456'."),
      format: z.enum(["object","string","inline"])
        .optional()
        .describe('Optional. The format to return CSS in: "object", "string", or "inline".'),
    },
    async ({ nodeId, format }) => {
      try {
        const params: any = {};
        if (nodeId !== undefined) params.nodeId = ensureNodeIdIsString(nodeId);
        if (format !== undefined) params.format = format;
        const result = await figmaClient.executeCommand("get_css_async", params);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting CSS: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );
}
