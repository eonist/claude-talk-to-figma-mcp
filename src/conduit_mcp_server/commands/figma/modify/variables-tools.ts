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

  // Unified Variable Operation Schema
  const VariableOpShape = {
    variables: z
      .union([
        VariableDefSchema,
        VariableDefSchema.extend({ id: z.string().min(1) }),
        z.array(VariableDefSchema).min(1).max(50),
        z.array(VariableDefSchema.extend({ id: z.string().min(1) })).min(1).max(50)
      ])
      .optional(),
    ids: z
      .union([
        z.string().min(1),
        z.array(z.string().min(1)).min(1).max(50)
      ])
      .optional()
  };
  const VariableOpSchema = z.object(VariableOpShape).refine(
    (data) => !!data.variables || !!data.ids,
    { message: "Either 'variables' or 'ids' must be provided." }
  );

  server.tool(
    MCP_COMMANDS.SET_VARIABLE,
    `Creates, updates, or deletes one or more Figma Variables (design tokens).

Params:
  - variables: For create/update. Either a single variable definition, a single update (with id), or an array of either.
  - ids: For delete. Either a single variable id or an array of ids.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the result or summary.
`,
    VariableOpShape,
    {
      title: "Create/Update/Delete Figma Variable(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { variables: { name: "Primary Color", type: "COLOR", value: "#3366FF", collection: "Theme" } },
        { variables: { id: "var123", name: "Primary Color", value: "#123456" } },
        { variables: [
          { name: "Spacing XS", type: "NUMBER", value: 4, collection: "Spacing" },
          { id: "var123", value: "#654321" }
        ]},
        { ids: "var123" },
        { ids: ["var123", "var456"] }
      ]),
      edgeCaseWarnings: [
        "Name must be a non-empty string for create.",
        "Type must be one of COLOR, NUMBER, STRING, BOOLEAN.",
        "Value must match the type.",
        "Each update must include an id.",
        "Each id must be a non-empty string for delete."
      ],
      extraInfo: "Creates, updates, or deletes Figma Variables (design tokens) depending on which parameters are provided."
    },
    async (params) => {
      if (params.ids) {
        // Delete operation
        const idList = Array.isArray(params.ids) ? params.ids : [params.ids];
        const results = await figmaClient.executeCommand(MCP_COMMANDS.SET_VARIABLE, { ids: idList });
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
      } else if (params.variables) {
        const variableList = Array.isArray(params.variables) ? params.variables : [params.variables];
        // If all have id, treat as update; if none have id, treat as create; if mixed, handle accordingly
        const isUpdate = variableList.every(v => "id" in v);
        const isCreate = variableList.every(v => !("id" in v));
        const results = await figmaClient.executeCommand(MCP_COMMANDS.SET_VARIABLE, { variables: variableList });
        return {
          content: [
            {
              type: "text",
              text: isCreate
                ? (variableList.length === 1
                    ? `Created variable ${results[0]?.id || ""}`
                    : `Batch created ${results.length} variables`)
                : (isUpdate
                    ? (variableList.length === 1
                        ? `Updated variable ${results[0]?.id || ""}`
                        : `Batch updated ${results.length} variables`)
                    : `Processed ${results.length} variables (mixed create/update)`)
            }
          ],
          _meta: { results }
        };
      }
      return {
        content: [
          { type: "text", text: "No operation performed. Provide 'variables' or 'ids'." }
        ]
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
    MCP_COMMANDS.GET_VARIABLE,
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
      const results = await figmaClient.executeCommand(MCP_COMMANDS.GET_VARIABLE, params);
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
      const result = await figmaClient.executeCommand(MCP_COMMANDS.APPLY_VARIABLE_TO_NODE, { nodeId, variableId, property });
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
      const result = await figmaClient.executeCommand(MCP_COMMANDS.SWITCH_VARIABLE_MODE, { collection, mode });
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
