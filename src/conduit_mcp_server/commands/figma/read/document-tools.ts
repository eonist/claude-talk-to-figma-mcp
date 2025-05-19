import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers document info read command:
 * - get_document_info
 */
export function registerDocumentTools(server: McpServer, figmaClient: FigmaClient) {
  // Existing get_document_info tool
  server.tool(
    MCP_COMMANDS.GET_DOCUMENT_INFO,
    `Get detailed information about the current Figma document.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the document info as JSON.
`,
    {},
    {
      title: "Get Document Info",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {}
      ]),
      edgeCaseWarnings: [
        "Returns a large JSON object for complex documents.",
        "May include document-level metadata, pages, and settings.",
        "If the document is empty, the result may be minimal."
      ],
      extraInfo: "Use this command to retrieve the full structure and metadata of the current Figma document."
    },
    async () => {
      try {
        const result = await figmaClient.executeCommand("get_document_info");
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
              text: `Error getting document info: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // New: get_pages tool
  server.tool(
    MCP_COMMANDS.GET_PAGES,
    `Get information about all pages in the current Figma document.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the pages info as JSON.
`,
    {},
    {
      title: "Get Pages",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {}
      ]),
      edgeCaseWarnings: [
        "Returns information about all pages in the document.",
        "Empty pages will still be included in the result.",
        "If the document has no pages, an empty array will be returned."
      ],
      extraInfo: "Use this command to get a list of all pages in the current Figma document."
    },
    async () => {
      try {
        const result = await figmaClient.getPages();
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
              text: `Error getting pages: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // New: set_current_page tool
  server.tool(
    MCP_COMMANDS.SET_CURRENT_PAGE,
    `Set the current active page in Figma.

Parameters:
  - pageId: The ID of the page to set as current.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the new current page info as JSON.
`,
    {
      type: "object",
      properties: {
        pageId: {
          type: "string",
          description: "The ID of the page to set as current."
        }
      },
      required: ["pageId"]
    },
    {
      title: "Set Current Page",
      idempotentHint: false,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { pageId: "123:456" }
      ]),
      edgeCaseWarnings: [
        "Will throw an error if the specified ID does not correspond to a valid page.",
        "Changes the active page in the Figma user interface."
      ],
      extraInfo: "Use this command to navigate between different pages in the document."
    },
    async (params) => {
      try {
        const result = await figmaClient.setCurrentPage(params.pageId);
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
              text: `Error setting current page: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}
