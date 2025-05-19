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
}
