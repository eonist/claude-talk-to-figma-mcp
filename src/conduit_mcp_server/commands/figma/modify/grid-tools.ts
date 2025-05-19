import type { McpServer } from "../../../server.js";
import type { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../../types/commands.js";

// Zod schemas for grid commands
const GridTypeEnum = z.enum(["GRID", "COLUMNS", "ROWS"]);
const RGBA = z.object({
  r: z.number().min(0).max(1),
  g: z.number().min(0).max(1),
  b: z.number().min(0).max(1),
  a: z.number().min(0).max(1).optional(),
});
const GridOptions = z.object({
  visible: z.boolean().optional(),
  color: RGBA.optional(),
  alignment: z.enum(["MIN", "MAX", "STRETCH", "CENTER"]).optional(),
  gutterSize: z.number().optional(),
  count: z.number().optional(),
  sectionSize: z.number().optional(),
  offset: z.number().optional(),
});
const CreateGridSchema = z.object({
  frameId: z.string(),
  gridType: GridTypeEnum,
  gridOptions: GridOptions,
});
const UpdateGridSchema = z.object({
  frameId: z.string(),
  gridIndex: z.number(),
  gridOptions: GridOptions.partial(),
});
const RemoveGridSchema = z.object({
  frameId: z.string(),
  gridIndex: z.number().optional(),
});

export function registerGridCommands(server: McpServer, figmaClient: FigmaClient) {
  // Create grid
  server.tool(
    MCP_COMMANDS.SET_GRID,
    `Create a layout grid (GRID, COLUMNS, or ROWS) on a Figma frame.

Parameters:
- frameId (string): The Figma frame node ID.
- gridType (string): "GRID", "COLUMNS", or "ROWS".
- gridOptions (object): Grid properties (visible, color, alignment, gutterSize, count, sectionSize, offset).

Returns: { status: "success"|"error", message: string, gridId?: string }`,
    CreateGridSchema,
    async (params) => {
      return await figmaClient.executeCommand("createGrid", params);
    }
  );

  // Update grid
  server.tool(
    MCP_COMMANDS.SET_GRID,
    `Update an existing layout grid on a Figma frame.

Parameters:
- frameId (string): The Figma frame node ID.
- gridIndex (number): Index of the grid in frame.layoutGrids to update.
- gridOptions (object): Properties to update.

Returns: { status: "success"|"error", message: string, gridId?: string }`,
    UpdateGridSchema,
    async (params) => {
      return await figmaClient.executeCommand("updateGrid", params);
    }
  );

  // Remove grid
  server.tool(
    MCP_COMMANDS.SET_GRID,
    `Remove a layout grid from a Figma frame.

Parameters:
- frameId (string): The Figma frame node ID.
- gridIndex (number, optional): Index of the grid to remove. If omitted, removes all grids.

Returns: { status: "success"|"error", message: string, gridId?: string }`,
    RemoveGridSchema,
    async (params) => {
      return await figmaClient.executeCommand("removeGrid", params);
    }
  );
}
