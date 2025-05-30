import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// @ts-ignore
import { FigmaClient } from "../../../clients/figma-client.js";
import type { FigmaClient as FigmaClientType } from "../../../clients/figma-client.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { VariableTypeEnum, VariableDefSchema, VariableOpShape, VariableOpSchema, GetVariablesParamsSchema } from "./schema/variables-schema.js";

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

  server.tool(
    MCP_COMMANDS.SET_VARIABLE,
    `Creates, updates, or deletes one or more Figma Variables (design tokens).

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
      try {
        if (params.ids) {
          // Delete operation
          const idList = Array.isArray(params.ids) ? params.ids : [params.ids];
          const results = await figmaClient.executeCommand(MCP_COMMANDS.SET_VARIABLE, { ids: idList });
          const perOpResults = idList.map((id, i) => ({
            variableId: id,
            success: !results[i]?.error,
            ...(results[i] || {}),
            meta: results[i]?.error ? { operation: "delete_variable", params: { id } } : undefined
          }));
          const anySuccess = perOpResults.some(r => r.success);
          if (anySuccess) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({ success: true, results: perOpResults })
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
                      message: "All delete_variable operations failed",
                      results: perOpResults,
                      meta: { operation: "delete_variable", params: idList }
                    }
                  })
                }
              ]
            };
          }
        } else if (params.variables) {
          const variableList = Array.isArray(params.variables) ? params.variables : [params.variables];
          const results = await figmaClient.executeCommand(MCP_COMMANDS.SET_VARIABLE, { variables: variableList });
          const perOpResults = variableList.map((v, i) => ({
            variableId: (results[i] && results[i].id) || (typeof (v as any).id === "string" ? (v as any).id : undefined),
            success: !results[i]?.error,
            ...(results[i] || {}),
            meta: results[i]?.error ? { operation: "set_variable", params: v } : undefined
          }));
          const anySuccess = perOpResults.some(r => r.success);
          if (anySuccess) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({ success: true, results: perOpResults })
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
                      message: "All set_variable operations failed",
                      results: perOpResults,
                      meta: { operation: "set_variable", params: variableList }
                    }
                  })
                }
              ]
            };
          }
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                error: {
                  message: "No operation performed. Provide 'variables' or 'ids'.",
                  results: [],
                  meta: { operation: "set_variable", params }
                }
              })
            }
          ]
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                error: {
                  message: err?.message || String(err),
                  results: [],
                  meta: { operation: "set_variable", params }
                }
              })
            }
          ]
        };
      }
    }
  );

  // Get/Query Variables
  const GetVariablesParamsSchema = z.object({
    type: VariableTypeEnum.optional().describe("The type of variable to query (e.g., 'COLOR', 'NUMBER', 'STRING', 'BOOLEAN'). Optional."),
    collection: z.string().optional().describe("The collection ID or name to filter variables by. Optional."),
    mode: z.string().optional().describe("The mode to filter variables by (e.g., 'light', 'dark'). Optional."),
    ids: z.array(z.string().min(1)).optional().describe("An array of variable IDs to query. Optional.")
  });

  // (No changes needed here, just remove the duplicate definitions below)
}
