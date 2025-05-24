import type { McpServer } from "../../../server.js";
import type { FigmaClient } from "../../../clients/figma-client.js";
import { SetConstraintsSchema, GetConstraintsSchema } from "./schema/constraint-schema.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

export function registerConstraintCommands(server: McpServer, figmaClient: FigmaClient) {
  // set_constraints: set constraints (single or batch)
  console.log("REGISTERING SET_CONSTRAINT:", MCP_COMMANDS.SET_CONSTRAINT);
  server.tool(
    MCP_COMMANDS.SET_CONSTRAINT,
    `Set constraints (left/right/top/bottom/center/scale/stretch) for one or more Figma nodes.

Returns: Array of result objects for each operation.`,
    SetConstraintsSchema.shape,
    async (params, _extra) => {
      const ops = params.constraint ? [params.constraint] : (params.constraints || []);
      const allResults = [];
      for (const op of ops) {
        try {
          // The plugin may return an array (if children are included), so flatten
          const pluginResults = await figmaClient.setConstraints({
            ...op,
            applyToChildren: params.applyToChildren,
            maintainAspectRatio: params.maintainAspectRatio,
          });
          // pluginResults may be array or single object
          const opResults = Array.isArray(pluginResults) ? pluginResults : [pluginResults];
          for (const r of opResults) {
            if (r && r.error) {
              allResults.push({
                ...r,
                nodeId: r.nodeId || op.nodeId,
                success: false,
                meta: {
                  operation: "set_constraint",
                  params: { ...op, applyToChildren: params.applyToChildren, maintainAspectRatio: params.maintainAspectRatio }
                }
              });
            } else {
              allResults.push({
                ...r,
                nodeId: r.nodeId || op.nodeId,
                success: true
              });
            }
          }
        } catch (err: any) {
          allResults.push({
            nodeId: op.nodeId,
            success: false,
            error: err?.message || String(err),
            meta: {
              operation: "set_constraint",
              params: { ...op, applyToChildren: params.applyToChildren, maintainAspectRatio: params.maintainAspectRatio }
            }
          });
        }
      }
      const anySuccess = allResults.some(r => r.success);
      let result;
      if (anySuccess) {
        result = { success: true, results: allResults };
      } else {
        result = {
          success: false,
          error: {
            message: "All set_constraint operations failed",
            results: allResults,
            meta: {
              operation: "set_constraint",
              params: ops
            }
          }
        };
      }
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // get_constraints: get constraints for one or more nodes (with children)
  console.log("REGISTERING GET_CONSTRAINT:", MCP_COMMANDS.GET_CONSTRAINT);
  server.tool(
    MCP_COMMANDS.GET_CONSTRAINT,
    `Get constraints for one or more Figma nodes (optionally including children).

Returns: Array of constraint info for each node, including children if requested.`,
    GetConstraintsSchema.shape,
    async (params, _extra) => {
      try {
        const result = await figmaClient.getConstraints(params);
        let wrapped;
        if (result && result.error) {
          wrapped = {
            success: false,
            error: {
              message: typeof result.error === "string" ? result.error : "get_constraints failed",
              results: [],
              meta: {
                operation: "get_constraints",
                params
              }
            }
          };
        } else {
          // Always wrap in results array for consistency
          const resultsArr = Array.isArray(result) ? result : [result];
          wrapped = { success: true, results: resultsArr };
        }
        return { content: [{ type: "text", text: JSON.stringify(wrapped) }] };
      } catch (err: any) {
        const wrapped = {
          success: false,
          error: {
            message: err?.message || "get_constraints failed",
            results: [],
            meta: {
              operation: "get_constraints",
              params
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(wrapped) }] };
      }
    }
  );
}
