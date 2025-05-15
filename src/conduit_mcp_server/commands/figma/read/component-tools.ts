import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";
import { z } from "zod";

/**
 * Registers component info read commands:
 * - get_local_components
 * - get_remote_components
 */
export function registerComponentTools(server: McpServer, figmaClient: FigmaClient) {
  // Get Local Components
  server.tool(
    "get_local_components",
    `Get all local components from the Figma document.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the local components info as JSON.
`,
    {},
    {
      title: "Get Local Components",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false
    },
    async () => {
      try {
        const result = await figmaClient.executeCommand("get_local_components");
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
              text: `Error getting local components: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Get Team Components (NEW)
  server.tool(
    "get_team_components",
    `Retrieves components from a Figma team library.

Parameters:
  - team_id: Figma team ID (string, required)
  - page_size: Number of components per page (number, optional)
  - after: Pagination cursor (number, optional)

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the team components info as JSON.
`,
    {},
    {
      title: "Get Team Components",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false
    },
    async (args: any) => {
      const { team_id, page_size, after } = args || {};
      if (!team_id) {
        return {
          content: [
            {
              type: "text",
              text: "Error: team_id parameter is required"
            }
          ]
        };
      }
      try {
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
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting team components: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Get Remote Components
  server.tool(
    "get_remote_components",
    `Get available components from team libraries in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the remote components info as JSON.
`,
    {},
    {
      title: "Get Remote Components",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false
    },
    async () => {
      try {
        const result = await figmaClient.executeCommand("get_remote_components");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting remote components: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );
}
