import { z } from "zod";

export const VariableTypeEnum = z.enum(["COLOR", "NUMBER", "STRING", "BOOLEAN"]);

export const VariableDefSchema = z.object({
  name: z.string().min(1).max(100),
  type: VariableTypeEnum,
  value: z.any(), // Will be validated per type in handler
  collection: z.string().optional(),
  mode: z.string().optional(),
  description: z.string().optional(),
});

export const VariableOpShape = {
  variables: z
    .union([
      VariableDefSchema,
      VariableDefSchema.extend({ id: z.string().min(1) }),
      z.array(VariableDefSchema).min(1).max(50),
      z.array(VariableDefSchema.extend({ id: z.string().min(1) })).min(1).max(50)
    ])
    .optional()
    .describe("One or more variable definitions to create or update. Can be a single object or an array."),
  ids: z
    .union([
      z.string().min(1),
      z.array(z.string().min(1)).min(1).max(50)
    ])
    .optional()
    .describe("One or more variable IDs to delete. Can be a single string or an array of strings.")
};

export const VariableOpSchema = z.object(VariableOpShape).refine(
  (data) => !!data.variables || !!data.ids,
  { message: "Either 'variables' or 'ids' must be provided." }
);

export const GetVariablesParamsSchema = z.object({
  type: VariableTypeEnum.optional().describe("The type of variable to query (e.g., 'COLOR', 'NUMBER', 'STRING', 'BOOLEAN'). Optional."),
  collection: z.string().optional().describe("The collection ID or name to filter variables by. Optional."),
  mode: z.string().optional().describe("The mode to filter variables by (e.g., 'light', 'dark'). Optional."),
  ids: z.array(z.string().min(1)).optional().describe("An array of variable IDs to query. Optional.")
});
