import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";
import { z } from "zod";

/**
 * Registers component info read commands:
 */
export function registerComponentTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified Get Components
  server.tool(
    "get_components",
    `Get components from the current document, a team library, or remote team libraries.

Parameters:
  - source: "local" | "team" | "remote" (required)
  - team_id: Figma team ID (string, required if source is "team")
  - page_size: Number of components per page (number, optional, for team/remote)
  - after: Pagination cursor (string/number, optional, for team/remote)

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the components info as JSON.

Examples:
  // Local components
  { source: "local" }
  // Team components
  { source: "team", team_id: "123456" }
  // Remote components
  { source: "remote" }
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
      try {
        if (source === "local") {
          const result = await figmaClient.executeCommand("get_local_components");
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result)
              }
            ]
          };
        } else if (source === "team") {
          if (!team_id) {
            return {
              content: [
                {
                  type: "text",
                  text: "Error: team_id parameter is required when source is 'team'"
                }
              ]
            };
          }
          const result = await figmaClient.executeCommand("get_team_components", {
            teamId: team_id,
            pageSize: page_size,
            after: after
          });
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } else if (source === "remote") {
          const result = await figmaClient.executeCommand("get_remote_components");
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: "Error: Invalid source parameter"
              }
            ]
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting components: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

}
