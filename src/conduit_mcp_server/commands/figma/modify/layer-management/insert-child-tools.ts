import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers the insert_child command for inserting a child node into a parent node at a specified index.
 */
export function registerInsertChildTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "insert_child",
    `Inserts a child node into a parent node at an optional index position in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the parentId, childId, final index, and success status.
`,
    {
      parentId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("ID of the parent node"),
      childId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("ID of the child node to insert"),
      index: z.number()
        .int()
        .min(0)
        .optional()
        .describe("Optional insertion index (0-based)"),
    },
    {
      title: "Insert Child Node",
      idempotentHint: false,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false
    },
    async ({ parentId, childId, index }) => {
      const parent = ensureNodeIdIsString(parentId);
      const child = ensureNodeIdIsString(childId);
      const params: any = { parentId: parent, childId: child };
      if (index !== undefined) params.index = index;
      const result = await figmaClient.executeCommand("insert_child", params);
      return {
        content: [{
          type: "text",
          text: `Inserted child node ${child} into parent ${parent} at index ${result.index ?? "end"} (success: ${result.success ?? true})`
        }]
      };
    }
  );
}
