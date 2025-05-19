import type { McpServer } from "../../../server.js";
import type { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../../types/commands.js";

// Variant operation schema
const VariantOp = z.object({
  componentSetId: z.string(),
  action: z.enum(["create", "add", "rename", "delete", "organize", "batch_create"]),
  properties: z.record(z.string()).optional(),
  variantId: z.string().optional(),
  propertyName: z.string().optional(),
  newPropertyName: z.string().optional(),
  propertyValue: z.string().optional(),
  newPropertyValue: z.string().optional(),
  templateComponentId: z.string().optional(),
  propertiesList: z.array(z.record(z.string())).optional(),
  organizeBy: z.array(z.string()).optional()
});
const SetVariantSchema = z.object({
  variant: VariantOp.optional(),
  variants: z.array(VariantOp).optional(),
});
const GetVariantSchema = z.object({
  componentSetId: z.string().optional(),
  componentSetIds: z.array(z.string()).optional(),
});

export function registerVariantCommands(server: McpServer, figmaClient: FigmaClient) {
  // set_variant: create, add, rename, delete, organize, batch_create (single or batch)
  server.tool(
    MCP_COMMANDS.SET_VARIANT,
    `Create, add, rename, delete, organize, or batch create variants/properties in a component set (single or batch).

Parameters:
- variant (object, optional): Single variant operation
  - componentSetId (string): Target component set node
  - action (string): "create", "add", "rename", "delete", "organize", "batch_create"
  - properties (object, optional): Property name/value pairs for the variant
  - variantId (string, optional): For rename/delete
  - propertyName/newPropertyName (string, optional): For renaming properties
  - propertyValue/newPropertyValue (string, optional): For renaming property values
  - templateComponentId (string, optional): For batch create
  - propertiesList (array, optional): For batch create
  - organizeBy (array, optional): For organizing variants in a grid
- variants (array, optional): Batch of variant operations (same shape as above)

Returns: Array of result objects for each operation.`,
    SetVariantSchema,
    async (params) => {
      const ops = params.variant ? [params.variant] : (params.variants || []);
      const results = [];
      for (const op of ops) {
        try {
          const result = await figmaClient.executeCommand("setVariant", op);
          results.push({ ...result, componentSetId: op.componentSetId, success: true });
        } catch (err: any) {
          results.push({ componentSetId: op.componentSetId, success: false, error: err?.message || String(err) });
        }
      }
      return results;
    }
  );

  // get_variant: get info for one, many, or all component sets
  server.tool(
    MCP_COMMANDS.GET_VARIANT,
    `Get info about variants/properties for one or more component sets.

Parameters:
- componentSetId (string, optional): Single component set node
- componentSetIds (array, optional): Multiple component set nodes

Returns: For single: { componentSetId, variants: [...] }, for batch: Array<{ componentSetId, variants: [...] }>.`,
    GetVariantSchema,
    async (params) => {
      return await figmaClient.executeCommand("getVariant", params);
    }
  );
}
