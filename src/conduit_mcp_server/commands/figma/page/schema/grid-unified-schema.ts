import { z } from "zod";

export const GridProperties = z.object({
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

export const SetGridEntry = z.object({
  nodeId: z.string(),
  gridIndex: z.number().optional(),
  properties: GridProperties.optional(),
  delete: z.boolean().optional(),
});

export const SetGridSchema = z.object({
  entry: SetGridEntry.optional(),
  entries: z.array(SetGridEntry).optional(),
});

export const GetGridSchema = z.object({
  nodeId: z.string().optional(),
  nodeIds: z.array(z.string()).optional(),
});
