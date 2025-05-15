import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FigmaClient } from "../../../clients/figma-client/index.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { CssExportOptionsSchema } from "./css-schema.js";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";

/**
 * Registers CSS read command:
 * - get_css_async
 */
export function registerCssTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "get_css_async",
    `Get CSS properties from a node.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the CSS properties as JSON.
`,
    CssExportOptionsSchema.shape,
    {
      title: "Get CSS Async",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456", format: "string" },
        { nodeId: "123:456", format: "object" }
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma node ID if provided.",
        "Format must be one of 'string', 'object', or 'inline'.",
        "Returns an error if the node does not support CSS export."
      ],
      extraInfo: "Use this command to extract CSS properties from a Figma node for code generation or inspection."
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
