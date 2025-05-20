import type { McpServer } from "../../../server.js";
import type { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../../types/commands.js";

// Constraint schema
const ConstraintEntry = z.object({
  nodeId: z.string(),
  horizontal: z.enum(["left", "right", "center", "scale", "stretch"]),
  vertical: z.enum(["top", "bottom", "center", "scale", "stretch"]),
});
const SetConstraintsSchema = z.object({
  constraint: ConstraintEntry.optional(),
  constraints: z.array(ConstraintEntry).optional(),
  applyToChildren: z.boolean().optional(),
  maintainAspectRatio: z.boolean().optional(),
});
const GetConstraintsSchema = z.object({
  nodeId: z.string().optional(),
  nodeIds: z.array(z.string()).optional(),
  includeChildren: z.boolean().optional(),
});

export function registerConstraintCommands(server: McpServer, figmaClient: FigmaClient) {
  // set_constraints: set constraints (single or batch)
  server.tool(
    MCP_COMMANDS.SET_CONSTRAINTS,
    `Set constraints (left/right/top/bottom/center/scale/stretch) for one or more Figma nodes.

Parameters:
- constraint (object, optional): Single constraint operation
  - nodeId (string): Target node
  - horizontal (string): "left", "right", "center", "scale", "stretch"
  - vertical (string): "top", "bottom", "center", "scale", "stretch"
- constraints (array, optional): Batch of constraint operations (same shape as above)
- applyToChildren (boolean, optional): If true, apply to all children
- maintainAspectRatio (boolean, optional): If true, use "scale" for both axes

Returns: Array of result objects for each operation.`,
    SetConstraintsSchema,
    async (params) => {
      const ops = params.constraint ? [params.constraint] : (params.constraints || []);
      const results = [];
      for (const op of ops) {
        try {
          const result = await figmaClient.setConstraints({
            ...op,
            applyToChildren: params.applyToChildren,
            maintainAspectRatio: params.maintainAspectRatio,
          });
          results.push({ ...result, nodeId: op.nodeId, success: true });
        } catch (err: any) {
          results.push({ nodeId: op.nodeId, success: false, error: err?.message || String(err) });
        }
      }
      return results;
    }
  );

  // get_constraints: get constraints for one or more nodes (with children)
  server.tool(
    MCP_COMMANDS.GET_CONSTRAINTS,
    `Get constraints for one or more Figma nodes (optionally including children).

Parameters:
- nodeId (string, optional): Single node ID (if omitted, use current selection)
- nodeIds (array, optional): Multiple node IDs
- includeChildren (boolean, optional): If true, include constraints for all children

Returns: Array of constraint info for each node, including children if requested.`,
    GetConstraintsSchema,
    async (params) => {
      return await figmaClient.getConstraints(params);
    }
  );
}
