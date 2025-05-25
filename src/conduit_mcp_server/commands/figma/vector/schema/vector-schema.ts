import { z } from "zod";

export const vectorSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().default(100),
  height: z.number().default(100),
  name: z.string().optional(),
  parentId: z.string().optional().describe("Optional parent node ID."),
  vectorPaths: z.array(
    z.object({
      windingRule: z.enum(["EVENODD", "NONZERO"]),
      data: z.string()
    })
  ).min(1)
});

export const vectorsSchema = z.array(vectorSchema).optional();
