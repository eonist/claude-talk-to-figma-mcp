import type { McpServer } from "../../../server.js";
import type { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../../types/commands.js";


import { GridProperties, SetGridEntry, SetGridSchema, GetGridSchema } from "./schema/grid-unified-schema.js";

export function registerUnifiedGridCommands(server: McpServer, figmaClient: FigmaClient) {
  // set_grid: create, update, delete (single or batch)
  server.tool(
    MCP_COMMANDS.SET_GRID,
    `Create, update, or delete one or more layout grids on Figma nodes (FRAME, COMPONENT, INSTANCE).

Returns: Array of result objects for each operation.`,
    SetGridSchema.shape,
    async (params) => {
      const ops = params.entry ? [params.entry] : (params.entries || []);
      const results = [];
      for (const op of ops) {
        try {
          const result = await figmaClient.executeCommand(MCP_COMMANDS.SET_GRID, op);
          results.push({ ...result, nodeId: op.nodeId, success: true });
        } catch (err: any) {
          results.push({ nodeId: op.nodeId, success: false, error: err?.message || String(err) });
        }
      }
      return { content: [{ type: "text", text: JSON.stringify(results) }] };
    }
  );

  // get_grid: get all grids for one or more nodes
  server.tool(
    MCP_COMMANDS.GET_GRID,
    `Get all layout grids for one or more Figma nodes (FRAME, COMPONENT, INSTANCE).

Returns: For single: { nodeId, grids: [...] }, for batch: Array<{ nodeId, grids: [...] }>.`,
    GetGridSchema.shape,
    async (params) => {
      const ids = params.nodeId ? [params.nodeId] : (params.nodeIds || []);
      const results = [];
      for (const id of ids) {
        try {
          const result = await figmaClient.executeCommand(MCP_COMMANDS.GET_GRID, { nodeId: id });
          results.push({ nodeId: id, grids: result.grids || [] });
        } catch (err: any) {
          results.push({ nodeId: id, error: err?.message || String(err) });
        }
      }
      return { content: [{ type: "text", text: JSON.stringify(params.nodeId ? results[0] : results) }] };
    }
  );
}
