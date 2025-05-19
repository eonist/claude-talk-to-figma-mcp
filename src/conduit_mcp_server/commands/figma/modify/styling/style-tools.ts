import { McpServer } from "../../../../server.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../../../types/commands";

// Type definitions for style operations
const StyleTypeEnum = z.enum(["PAINT", "EFFECT", "TEXT", "GRID"]);
const StyleEntrySchema = z.object({
  styleId: z.string().optional(),
  styleType: StyleTypeEnum,
  properties: z.record(z.any()).optional(),
  delete: z.boolean().optional(),
});
const StyleBatchSchema = z.object({
  entry: StyleEntrySchema.optional(),
  entries: z.array(StyleEntrySchema).optional(),
});

export function registerStyleTools(server: McpServer, figmaClient: FigmaClient) {

  // set_style: create, update, or delete styles (single or batch)
  server.tool(
    MCP_COMMANDS.SET_STYLE,
    `Create, update, or delete one or more Figma styles (PAINT, EFFECT, TEXT, GRID) in a unified call.

Parameters:
- entry (object, optional): Single style operation
  - styleId (string, optional): Required for update/delete, omitted for create
  - styleType (string, required): "PAINT", "EFFECT", "TEXT", or "GRID"
  - properties (object, optional): Properties to set (required for create/update, omitted for delete)
  - delete (boolean, optional): If true, deletes the style (ignores properties)
- entries (array of objects, optional): Batch style operations (same shape as above)

Returns: Array of result objects: { styleId, styleType, action: "created" | "updated" | "deleted", success: true, [error?: string] }`,
    StyleBatchSchema,
    async (params: z.infer<typeof StyleBatchSchema>) => {
      // Normalize to array of entries
      let entries: any[] = [];
      if (params.entry) entries = [params.entry];
      if (params.entries) entries = entries.concat(params.entries);

      // Call plugin for each entry, collect results
      const results = [];
      for (const entry of entries) {
        try {
          const result = await figmaClient.executeCommand(MCP_COMMANDS.SET_STYLE, entry);
          results.push({ ...result, styleId: result.styleId || entry.styleId, styleType: entry.styleType, success: true });
        } catch (err: any) {
          results.push({ styleId: entry.styleId, styleType: entry.styleType, success: false, error: err?.message || String(err) });
        }
      }
      return results;
    }
  );
}
