import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";// /index.js
import { MCP_COMMANDS } from "../../../types/commands.js";
import { z } from "zod";

/**
 * Registers component info read commands:
 */
export function registerComponentTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified Get Components
  server.tool(
    MCP_COMMANDS.GET_COMPONENTS,
    `Get components from the current document, a team library, or remote team libraries.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the components info as JSON.
`,
    {
      source: z.enum(["local", "team", "remote"]),
      team_id: z.string().optional(),
      page_size: z.number().optional(),
      after: z.union([z.string(), z.number()]).optional()
    },
    {
      title: "Get Components (Unified)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { source: "local" },
        { source: "team", team_id: "123456" },
        { source: "remote" }
      ]),
      edgeCaseWarnings: [
        "If source is 'team', team_id is required.",
        "Pagination may be needed for large teams or remote libraries.",
        "Returns an empty array if no components are found.",
        "Network or permission errors may cause failure."
      ],
      extraInfo: "Unified command for retrieving local, team, or remote components. Old commands are deprecated."
    },
    async (args: any) => {
      const { source, team_id, page_size, after } = args || {};
      const response = {
        success: false,
        error: {
          message: "get_components is not implemented. Legacy component queries have been removed. Please implement a unified component retrieval method.",
          results: [],
          meta: {
            operation: "get_components",
            params: { source, team_id, page_size, after }
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
  );

}
