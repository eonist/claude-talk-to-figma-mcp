import type { McpServer } from "../../../server.js";
import type { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../../types/commands.js";

// Grid properties schema (for create/update)
const GridProperties = z.object({
  pattern: z.enum(["GRID", "COLUMNS", "ROWS"]),
  visible: z.boolean().optional(),
  color: z.object({
    r: z.number().min(0).max(1),
    g: z.number().min(0).max(1),
    b: z.number().min(0).max(1),
    a: z.number().min(0).max(1).optional(),
  }).optional(),
  alignment: z.enum(["MIN", "MAX", "STRETCH", "CENTER"]).optional(),
  gutterSize: z.number().optional(),
  count: z.number().optional(),
  sectionSize: z.number().optional(),
  offset: z.number().optional(),
});

// Unified set_grid schema
const SetGridEntry = z.object({
  nodeId: z.string(),
  gridIndex: z.number().optional(),
  properties: GridProperties.optional(),
  delete: z.boolean().optional(),
});
const SetGridSchema = z.object({
  entry: SetGridEntry.optional(),
  entries: z.array(SetGridEntry).optional(),
});

// Unified get_grid schema
const GetGridSchema = z.object({
  nodeId: z.string().optional(),
  nodeIds: z.array(z.string()).optional(),
});

export function registerUnifiedGridCommands(server: McpServer, figmaClient: FigmaClient) {
  // set_grid: create, update, delete (single or batch)
  server.tool(
    MCP_COMMANDS.SET_GRID,
    `Create, update, or delete one or more layout grids on Figma nodes (FRAME, COMPONENT, INSTANCE).

Parameters:
- entry (object, optional): Single grid operation
  - nodeId (string): Node to modify
  - gridIndex (number, optional): Index of grid to update/delete (omit for create)
  - properties (object, optional): Grid properties (for create/update)
  - delete (boolean, optional): If true, delete the grid at gridIndex
- entries (array, optional): Batch of grid operations (same shape as above)

Returns: Array of result objects for each operation.`,
    SetGridSchema,
    async (params) => {
      const ops = params.entry ? [params.entry] : (params.entries || []);
      const results = [];
      for (const op of ops) {
        try {
          const result = await figmaClient.executeCommand("setGrid", op);
          results.push({ ...result, nodeId: op.nodeId, success: true });
        } catch (err: any) {
          results.push({ nodeId: op.nodeId, success: false, error: err?.message || String(err) });
        }
      }
      return results;
    }
  );

  // get_grid: get all grids for one or more nodes
  server.tool(
    MCP_COMMANDS.GET_GRID,
    `Get all layout grids for one or more Figma nodes (FRAME, COMPONENT, INSTANCE).

Parameters:
- nodeId (string, optional): Single node ID
- nodeIds (array of string, optional): Multiple node IDs

Returns: For single: { nodeId, grids: [...] }, for batch: Array<{ nodeId, grids: [...] }>.`,
    GetGridSchema,
    async (params) => {
      const ids = params.nodeId ? [params.nodeId] : (params.nodeIds || []);
      const results = [];
      for (const id of ids) {
        try {
          const result = await figmaClient.executeCommand("getGrid", { nodeId: id });
          results.push({ nodeId: id, grids: result.grids || [] });
        } catch (err: any) {
          results.push({ nodeId: id, error: err?.message || String(err) });
        }
      }
      return params.nodeId ? results[0] : results;
    }
  );
}
