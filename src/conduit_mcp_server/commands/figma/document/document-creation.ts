import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js"; // /index
import { MCP_COMMANDS } from "../../../types/commands.js";
import { DuplicatePageSchema } from "./schema/document-creation-schema.js";

export function registerDocumentCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  // Duplicate Page tool
  server.tool(
    MCP_COMMANDS.DUPLICATE_PAGE,
    `Duplicate a Figma page and all its children as a new page.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the new page info as JSON.
`,
    DuplicatePageSchema.shape,
    {
      title: "Duplicate Page",
      idempotentHint: false,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { pageId: "123:456" },
        { pageId: "123:456", newPageName: "My Duplicated Page" }
      ]),
      edgeCaseWarnings: [
        "Duplicates all children of the original page.",
        "The new page will have a unique name and independent children."
      ],
      extraInfo: "Use this command to duplicate an entire page and its contents."
    },
    async (params: any) => {
      try {
        if (typeof figmaClient.duplicatePage !== "function") {
          throw new Error("FigmaClient does not implement duplicatePage method");
        }
        const result = await figmaClient.duplicatePage(params.pageId, params.newPageName);
        const response = {
          success: true,
          results: [result]
        };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response)
            }
          ]
        };
      } catch (error: any) {
        const response = {
          success: false,
          error: {
            message: `Error duplicating page: ${error instanceof Error ? error.message : String(error)}`,
            results: [],
            meta: {
              operation: "duplicate_page",
              params
            }
          }
        };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response),
            },
          ],
        };
      }
    }
  );
}
