import { z } from "zod";

export const InsertChildOperation = z.object({
  parentId: z.string()
    .describe("ID of the parent node")
    .optional(),
  childId: z.string()
    .describe("ID of the child node to insert")
    .optional(),
  index: z.number()
    .int()
    .min(0)
    .optional()
    .describe("Optional insertion index (0-based)"),
  operations: z.array(z.object({
    parentId: z.string()
      .describe("ID of the parent node"),
    childId: z.string()
      .describe("ID of the child node to insert"),
    index: z.number().int().min(0).optional().describe("Optional insertion index (0-based)"),
    maintainPosition: z.boolean().optional().describe("Maintain child's absolute position (default: false)")
  }))
  .optional()
  .describe("An array of set/insert operations to perform in batch. Optional."),
  options: z.object({
    skipErrors: z.boolean()
      .optional()
      .describe("If true, skip errors and continue processing remaining operations in batch mode.")
  })
  .optional()
  .describe("Options for the operation (e.g., skipErrors). Optional.")
});
