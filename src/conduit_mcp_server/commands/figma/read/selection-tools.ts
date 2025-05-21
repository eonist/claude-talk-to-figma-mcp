import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers selection info read command:
 * - get_selection
 */
export function registerSelectionTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.GET_SELECTION,
    `Get information about the current selection in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the selection info as JSON.
`,
    {},
    {
      title: "Get Selection",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {}
      ]),
      edgeCaseWarnings: [
        "Returns an empty array if nothing is selected.",
        "Selection info may include node IDs, types, and properties.",
        "If multiple nodes are selected, the result is an array."
      ],
      extraInfo: "Use this command to inspect the current selection context in the Figma document."
    },
    async () => {
      try {
        const result = await figmaClient.executeCommand(MCP_COMMANDS.GET_SELECTION);
        const resultsArr = Array.isArray(result) ? result : [result];
        const response = { success: true, results: resultsArr };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response)
            }
          ]
        };
      } catch (error) {
        const response = {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
            results: [],
            meta: {
              operation: "get_selection",
              params: {}
            }
          }
        };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response)
            }
          ]
        };
      }
    }
  );
}
