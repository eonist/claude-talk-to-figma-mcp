import type { McpServer } from "../../../server.js";
import type { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../../types/commands.js";

// Page operation schema
const PageOp = z.object({
  pageId: z.string().optional(),
  name: z.string().optional(),
  delete: z.boolean().optional(),
  setCurrent: z.boolean().optional(),
});
const SetPageSchema = z.object({
  page: PageOp.optional(),
  pages: z.array(PageOp).optional(),
});
const GetPageSchema = z.object({
  pageId: z.string().optional(),
  pageIds: z.array(z.string()).optional(),
});

export function registerPageCommands(server: McpServer, figmaClient: FigmaClient) {
  // set_page: create, delete, rename, set current (single or batch)
  server.tool(
    MCP_COMMANDS.SET_PAGE,
    `Create, delete, rename, or set current page (single or batch).

Parameters:
- page (object, optional): Single page operation
  - pageId (string, optional): Target page (for delete/rename/set current)
  - name (string, optional): Name for create/rename
  - delete (boolean, optional): If true, delete the page
  - setCurrent (boolean, optional): If true, set as current page
- pages (array, optional): Batch of page operations (same shape as above)

Returns: Array of result objects for each operation.`,
    SetPageSchema,
    async (params) => {
      const ops = params.page ? [params.page] : (params.pages || []);
      const results = [];
      let anySuccess = false;
      for (const op of ops) {
        try {
          const result = await figmaClient.executeCommand(MCP_COMMANDS.SET_PAGE, op);
          // If plugin returns an array, flatten it
          if (Array.isArray(result)) {
            for (const r of result) {
              results.push({ ...r, pageId: op.pageId, success: !r.error });
              if (!r.error) anySuccess = true;
            }
          } else {
            results.push({ ...result, pageId: op.pageId, success: !result.error });
            if (!result.error) anySuccess = true;
          }
        } catch (err: any) {
          results.push({ pageId: op.pageId, success: false, error: err?.message || String(err) });
        }
      }
      if (anySuccess) {
        return { success: true, results };
      } else {
        return {
          success: false,
          error: {
            message: "All page operations failed",
            results
          }
        };
      }
    }
  );

  // get_page: get info for one, many, or all pages
  server.tool(
    MCP_COMMANDS.GET_PAGE,
    `Get info for one, many, or all pages.

Parameters:
- pageId (string, optional): Single page ID
- pageIds (array of string, optional): Multiple page IDs
- If neither is provided, returns all pages.

Returns: For single: { pageId, name, isActive }, for batch: Array<{ pageId, name, isActive }>.`,
    GetPageSchema,
    async (params) => {
      return await figmaClient.executeCommand(MCP_COMMANDS.GET_PAGE, params);
    }
  );
}
