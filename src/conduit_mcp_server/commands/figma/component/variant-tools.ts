import type { McpServer } from "../../../server.js";
import type { FigmaClient } from "../../../clients/figma-client.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { VariantOp, SetVariantSchema, GetVariantSchema } from "./schema/variant-schema.js";

export function registerVariantCommands(server: McpServer, figmaClient: FigmaClient) {
  // set_variant: create, add, rename, delete, organize, batch_create (single or batch)
  server.tool(
    MCP_COMMANDS.SET_VARIANT,
    `Create, add, rename, delete, organize, or batch create variants/properties in a component set (single or batch).

Returns: Array of result objects for each operation.`,
    SetVariantSchema.shape,
    async (params) => {
      const ops = params.variant ? [params.variant] : (params.variants || []);
      const results = [];
      for (const op of ops) {
        try {
          const result = await figmaClient.executeCommand(MCP_COMMANDS.SET_VARIANT, op);
          results.push({ ...result, componentSetId: op.componentSetId, success: true });
        } catch (err: any) {
          results.push({
            componentSetId: op.componentSetId,
            success: false,
            error: err?.message || String(err),
            meta: { operation: "set_variant", params: op }
          });
        }
      }
      const anySuccess = results.some(r => r.success);
      if (anySuccess) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, results })
            }
          ]
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                error: {
                  message: "All set_variant operations failed",
                  results,
                  meta: { operation: "set_variant", params: ops }
                }
              })
            }
          ]
        };
      }
    }
  );

  // get_variant: get info for one, many, or all component sets
  server.tool(
    MCP_COMMANDS.GET_VARIANT,
    `Get info about variants/properties for one or more component sets.

Returns: For single: { componentSetId, variants: [...] }, for batch: Array<{ componentSetId, variants: [...] }>.`,
    GetVariantSchema.shape,
    async (params) => {
      return await figmaClient.executeCommand(MCP_COMMANDS.GET_VARIANT, params);
    }
  );
}
