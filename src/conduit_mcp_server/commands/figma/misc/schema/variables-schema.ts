import { z } from "zod";

/**
 * Enumeration of supported variable types in the design system.
 * Used for type validation and UI rendering.
 */
export const VariableTypeEnum = z.enum(["COLOR", "NUMBER", "STRING", "BOOLEAN"]);

/**
 * Schema for defining a design system variable.
 * Variables can represent colors, numbers, strings, or boolean values
 * and can be organized into collections with different modes.
 * 
 * @example
 * ```
 * const colorVariable = {
 *   name: "primary-blue",
 *   type: "COLOR",
 *   value: "#007AFF",
 *   collection: "colors",
 *   mode: "light",
 *   description: "Primary brand color for light mode"
 * };
 * ```
 */
export const VariableDefSchema = z.object({
  /** Variable name (1-100 characters) */
  name: z.string().min(1).max(100),
  
  /** The type of variable (COLOR, NUMBER, STRING, or BOOLEAN) */
  type: VariableTypeEnum,
  
  /** The variable's value - type will be validated based on the 'type' field */
  value: z.any(),
  
  /** Optional collection name to group related variables */
  collection: z.string().optional(),
  
  /** Optional mode (e.g., "light", "dark") for context-specific values */
  mode: z.string().optional(),
  
  /** Optional human-readable description of the variable's purpose */
  description: z.string().optional(),
});

/**
 * Flexible input shape for variable operations.
 * Supports both single variables and batch operations (up to 50 items).
 */
export const VariableOpShape = {
  /** 
   * Variables to create or update. Can be:
   * - Single variable definition
   * - Single variable with ID (for updates)
   * - Array of variable definitions (batch create)
   * - Array of variables with IDs (batch update)
   */
  variables: z
    .union([
      VariableDefSchema,
      VariableDefSchema.extend({ id: z.string().min(1) }),
      z.array(VariableDefSchema).min(1).max(50),
      z.array(VariableDefSchema.extend({ id: z.string().min(1) })).min(1).max(50)
    ])
    .optional()
    .describe("One or more variable definitions to create or update. Can be a single object or an array."),

  /** 
   * Variable IDs to delete. Can be:
   * - Single ID string
   * - Array of ID strings (batch delete, up to 50 items)
   */
  ids: z
    .union([
      z.string().min(1),
      z.array(z.string().min(1)).min(1).max(50)
    ])
    .optional()
    .describe("One or more variable IDs to delete. Can be a single string or an array of strings.")
};

/**
 * Schema for variable operations (create, update, delete).
 * Requires either 'variables' for create/update operations or 'ids' for delete operations.
 */
export const VariableOpSchema = z.object(VariableOpShape).refine(
  (data) => !!data.variables || !!data.ids,
  { message: "Either 'variables' or 'ids' must be provided." }
);

/**
 * Schema for querying variables with optional filters.
 * All parameters are optional, allowing for flexible querying.
 * 
 * @example
 * ```
 * // Get all color variables in light mode
 * const params = { type: "COLOR", mode: "light" };
 * 
 * // Get specific variables by ID
 * const params = { ids: ["var_1", "var_2"] };
 * ```
 */
export const GetVariablesParamsSchema = z.object({
  /** Filter by variable type (COLOR, NUMBER, STRING, or BOOLEAN) */
  type: VariableTypeEnum.optional().describe("The type of variable to query (e.g., 'COLOR', 'NUMBER', 'STRING', 'BOOLEAN'). Optional."),
  
  /** Filter by collection name or ID */
  collection: z.string().optional().describe("The collection ID or name to filter variables by. Optional."),
  
  /** Filter by mode (e.g., 'light', 'dark') */
  mode: z.string().optional().describe("The mode to filter variables by (e.g., 'light', 'dark'). Optional."),
  
  /** Get specific variables by their IDs */
  ids: z.array(z.string().min(1)).optional().describe("An array of variable IDs to query. Optional.")
});
