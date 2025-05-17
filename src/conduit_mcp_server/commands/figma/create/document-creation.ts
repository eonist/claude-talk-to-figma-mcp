import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";

/**
 * Registers page creation commands:
 * - create_page
 */
export function registerDocumentCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "create_page",
    `Create a new page in the Figma document.

Parameters:
  - name: Optional name for the new page. Default is "New Page".

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the new page info as JSON.
`,
    {
      type: "object",
      properties: {
        name: {
          type: "string",
      description: "Optional name for the new page. Default is 'New Page'."
    }
  },
  required: []
},
{
  title: "Create Page",
  idempotentHint: false,
  destructiveHint: false,
  readOnlyHint: false,
  openWorldHint: false,
  usageExamples: JSON.stringify([
    { name: "My New Page" },
    {}
  ]),
  edgeCaseWarnings: [
    "Creates a new empty page in the document.",
    "The page will be created but not necessarily set as the current page."
  ],
  extraInfo: "Use this command to add new pages to the document."
},
async (params) => {
  try {
    const result = await figmaClient.createPage(params.name);
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
          text: `Error creating page: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
);

// Duplicate Page tool
server.tool(
  "duplicate_page",
  `Duplicate a Figma page and all its children as a new page.

Parameters:
  - pageId: The ID of the page to duplicate.
  - newPageName: Optional name for the new page.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the new page info as JSON.
`,
  {
    type: "object",
    properties: {
      pageId: {
        type: "string",
        description: "The ID of the page to duplicate."
      },
      newPageName: {
        type: "string",
        description: "Optional name for the new page."
      }
    },
    required: ["pageId"]
  },
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
  async (params) => {
    try {
      const result = await figmaClient.duplicatePage(params.pageId, params.newPageName);
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
            text: `Error duplicating page: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);
}
