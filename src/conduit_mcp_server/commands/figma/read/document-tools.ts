import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";

/**
 * Registers document info read command:
 * - get_document_info
 */
export function registerDocumentTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "get_document_info",
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
}
