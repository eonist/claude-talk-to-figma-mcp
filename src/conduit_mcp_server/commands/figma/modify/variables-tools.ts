import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// @ts-ignore
import { FigmaClient } from "../../../clients/figma-client.js";
import type { FigmaClient as FigmaClientType } from "../../../clients/figma-client.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers Figma Variables (Design Tokens) commands:
 * - create_variable(s)
 * - update_variable(s)
 * - delete_variable(s)
 * - get_variables
 * - apply_variable_to_node
 * - switch_variable_mode
 * - batch operations
 */
export function registerVariableTools(server: McpServer, figmaClient: FigmaClient) {
  // Variable Types
  const VariableTypeEnum = z.enum(["COLOR", "NUMBER", "STRING", "BOOLEAN"]);

  // Variable Definition Schema
  const VariableDefSchema = z.object({
    name: z.string().min(1).max(100),
    type: VariableTypeEnum,
    value: z.any(), // Will be validated per type in handler
    collection: z.string().optional(),
    mode: z.string().optional(),
    description: z.string().optional(),
  });

  // Create Variable(s)
  const CreateVariableParamsSchema = z.object({
    variables: z.union([
      VariableDefSchema,
      z.array(VariableDefSchema).min(1).max(50)
    ])
  });

  server.tool(
    MCP_COMMANDS.CREATE_VARIABLE,
    `Creates one or more Figma Variables (design tokens).

Params:
  - variables: Either a single variable definition or an array of variable definitions.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created variable(s) ID(s) or a summary.
`,
    CreateVariableParamsSchema.shape,
    {
      title: "Create Figma Variable (Single or Batch)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { variables: { name: "Primary Color", type: "COLOR", value: "#3366FF", collection: "Theme" } },
        { variables: [
          { name: "Spacing XS", type: "NUMBER", value: 4, collection: "Spacing" },
          { name: "Font Family", type: "STRING", value: "Inter", collection: "Typography" }
        ]}
      ]),
      edgeCaseWarnings: [
        "Name must be a non-empty string.",
        "Type must be one of COLOR, NUMBER, STRING, BOOLEAN.",
        "Value must match the type."
      ],
      extraInfo: "Creates one or more reusable Figma Variables (design tokens)."
    },
    async ({ variables }) => {
      const variableList = Array.isArray(variables) ? variables : [variables];
      // Type validation for value can be added here
      const results = await figmaClient.createVariable({ variables: variableList });
      return {
        content: [
          {
            type: "text",
            text: variableList.length === 1
              ? `Created variable ${results[0]?.id || ""}`
              : `Batch created ${results.length} variables`
          }
        ],
        _meta: { results }
      };
    }
  );

  // Update Variable(s)
  const UpdateVariableParamsSchema = z.object({
    variables: z.union([
      VariableDefSchema.extend({ id: z.string().min(1) }),
      z.array(VariableDefSchema.extend({ id: z.string().min(1) })).min(1).max(50)
    ])
  });

  server.tool(
    MCP_COMMANDS.UPDATE_VARIABLE,
    `Updates one or more Figma Variables.

Params:
  - variables: Either a single variable update or an array of updates (must include id).

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the updated variable(s) ID(s) or a summary.
`,
    UpdateVariableParamsSchema.shape,
    {
      title: "Update Figma Variable (Single or Batch)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { variables: { id: "var123", name: "Primary Color", value: "#123456" } },
        { variables: [
          { id: "var123", value: "#654321" },
          { id: "var456", value: 8 }
        ]}
      ]),
      edgeCaseWarnings: [
        "Each variable must include an id.",
        "Value must match the type."
      ],
      extraInfo: "Updates one or more Figma Variables."
    },
    async ({ variables }) => {
      const variableList = Array.isArray(variables) ? variables : [variables];
      const results = await figmaClient.updateVariable({ variables: variableList });
      return {
        content: [
          {
            type: "text",
            text: variableList.length === 1
              ? `Updated variable ${results[0]?.id || ""}`
              : `Batch updated ${results.length} variables`
          }
        ],
        _meta: { results }
      };
    }
  );

  // Delete Variable(s)
  const DeleteVariableParamsSchema = z.object({
    ids: z.union([
      z.string().min(1),
      z.array(z.string().min(1)).min(1).max(50)
    ])
  });

  server.tool(
    MCP_COMMANDS.DELETE_VARIABLE,
    `Deletes one or more Figma Variables.

Params:
  - ids: Either a single variable id or an array of ids.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the deleted variable(s) ID(s) or a summary.
`,
    DeleteVariableParamsSchema.shape,
    {
      title: "Delete Figma Variable (Single or Batch)",
      idempotentHint: false,
      destructiveHint: true,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { ids: "var123" },
        { ids: ["var123", "var456"] }
      ]),
      edgeCaseWarnings: [
        "Each id must be a non-empty string."
      ],
      extraInfo: "Deletes one or more Figma Variables."
    },
    async ({ ids }) => {
      const idList = Array.isArray(ids) ? ids : [ids];
      const results = await figmaClient.deleteVariable({ ids: idList });
      return {
        content: [
          {
            type: "text",
            text: idList.length === 1
              ? `Deleted variable ${idList[0]}`
              : `Batch deleted ${idList.length} variables`
          }
        ],
        _meta: { results }
      };
    }
  );

  // Get/Query Variables
  const GetVariablesParamsSchema = z.object({
    type: VariableTypeEnum.optional(),
    collection: z.string().optional(),
    mode: z.string().optional(),
    ids: z.array(z.string().min(1)).optional()
  });

  server.tool(
    MCP_COMMANDS.GET_VARIABLES,
    `Queries Figma Variables.

Params:
  - type: Optional. Filter by variable type.
  - collection: Optional. Filter by collection.
  - mode: Optional. Filter by mode.
  - ids: Optional. Filter by specific variable ids.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the variable(s) info as JSON.
`,
    GetVariablesParamsSchema.shape,
    {
      title: "Get/Query Figma Variables",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { type: "COLOR" },
        { collection: "Theme" },
        { ids: ["var123", "var456"] }
      ]),
      edgeCaseWarnings: [],
      extraInfo: "Queries Figma Variables by type, collection, mode, or ids."
    },
    async (params) => {
      const results = await figmaClient.getVariables(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results)
          }
        ],
        _meta: { results }
      };
    }
  );

  // Apply Variable to Node
  const ApplyVariableParamsSchema = z.object({
    nodeId: z.string().min(1),
    variableId: z.string().min(1),
    property: z.string().min(1) // e.g., "fill", "stroke", "fontSize", etc.
  });

  server.tool(
    MCP_COMMANDS.APPLY_VARIABLE_TO_NODE,
    `Applies a Figma Variable to a node property.

Params:
  - nodeId: The Figma node ID.
  - variableId: The variable ID to apply.
  - property: The property to apply the variable to (e.g., "fill", "stroke", "fontSize").

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the result.
`,
    ApplyVariableParamsSchema.shape,
    {
      title: "Apply Variable to Node",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456", variableId: "var123", property: "fill" }
      ]),
      edgeCaseWarnings: [
        "Property must be a valid node property for the variable type."
      ],
      extraInfo: "Applies a Figma Variable to a node property."
    },
    async ({ nodeId, variableId, property }) => {
      const result = await figmaClient.applyVariableToNode({ nodeId, variableId, property });
      return {
        content: [
          {
            type: "text",
            text: `Applied variable ${variableId} to ${property} of node ${nodeId}`
          }
        ],
        _meta: { result }
      };
    }
  );

  // Switch Variable Mode
  const SwitchVariableModeParamsSchema = z.object({
    collection: z.string().min(1),
    mode: z.string().min(1)
  });

  server.tool(
    MCP_COMMANDS.SWITCH_VARIABLE_MODE,
    `Switches the mode for a Figma Variable collection (e.g., light/dark theme).

Params:
  - collection: The variable collection name.
  - mode: The mode to switch to.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the result.
`,
    SwitchVariableModeParamsSchema.shape,
    {
      title: "Switch Variable Mode",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { collection: "Theme", mode: "Dark" }
      ]),
      edgeCaseWarnings: [
        "Collection and mode must be valid and exist in the document."
      ],
      extraInfo: "Switches the mode for a Figma Variable collection."
    },
    async ({ collection, mode }) => {
      const result = await figmaClient.switchVariableMode({ collection, mode });
      return {
        content: [
          {
            type: "text",
            text: `Switched collection ${collection} to mode ${mode}`
          }
        ],
        _meta: { result }
      };
    }
  );
}
