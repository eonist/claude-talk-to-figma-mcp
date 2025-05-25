import { z } from "zod";

export const ReorderConfig = z.object({
  nodeId: z.string().describe("The ID of the node to reorder."),
  direction: z.enum(["up", "down", "front", "back"])
    .optional()
    .describe("The direction to move the node: 'up', 'down', 'front', or 'back'. Optional."),
  index: z.number().int()
    .optional()
    .describe("The new index to move the node to (0-based). Optional."),
}).describe("A single reorder configuration object. Each object should include nodeId and optional direction or index.");

export const ReorderSchema = z.object({
  reorder: ReorderConfig.optional(),
  reorders: z.array(ReorderConfig).optional(),
  options: z.object({
    skip_errors: z.boolean()
      .optional()
      .describe("If true, skip errors and continue processing remaining operations in batch mode.")
  })
  .optional()
  .describe("Options for the operation (e.g., skip_errors). Optional.")
});
