import { z } from "zod";

/**
 * Zod schema for a single variant operation on a Figma component set.
 */
export const VariantOp = z.object({
  componentSetId: z.string().describe("The ID of the component set to operate on."),
  action: z.enum(["create", "add", "rename", "delete", "organize", "batch_create"])
    .describe("The action to perform on the component set."),
  properties: z.record(z.string()).optional().describe("Additional properties for the variant operation."),
  variantId: z.string().optional().describe("The ID of the specific variant to modify (if applicable)."),
  propertyName: z.string().optional().describe("The name of the property to rename or modify."),
  newPropertyName: z.string().optional().describe("The new name for the property (if renaming)."),
  propertyValue: z.string().optional().describe("The value of the property to set or update."),
  newPropertyValue: z.string().optional().describe("The new value for the property (if changing)."),
  templateComponentId: z.string().optional().describe("The ID of a template component to use for batch creation."),
  propertiesList: z.array(z.record(z.string())).optional().describe("A list of property objects for batch operations."),
  organizeBy: z.array(z.string()).optional().describe("Properties to organize variants by."),
}).describe("A single variant operation for a Figma component set.");

/**
 * Zod schema for the set_variant command parameters.
 */
export const SetVariantSchema = z.object({
  variant: VariantOp.optional().describe("A single variant operation to perform."),
  variants: z.array(VariantOp).optional().describe("An array of variant operations to perform in batch."),
}).describe("Parameters for the set_variant command. Provide either 'variant' or 'variants'.");

/**
 * Zod schema for the get_variant command parameters.
 */
export const GetVariantSchema = z.object({
  componentSetId: z.string().optional().describe("The ID of a single component set to query."),
  componentSetIds: z.array(z.string()).optional().describe("An array of component set IDs to query in batch."),
}).describe("Parameters for the get_variant command. Provide either 'componentSetId' or 'componentSetIds'.");
