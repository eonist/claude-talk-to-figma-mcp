import { z } from "zod";

export const GetAnnotationParamsSchema = z.object({
  nodeId: z.string().optional().describe("The ID of a single node to get annotations for. Optional."),
  nodeIds: z.array(z.string()).optional().describe("An array of node IDs to get annotations for in batch. Optional.")
});

export const AnnotationEntrySchema = z.object({
  nodeId: z.string(),
  annotation: z.object({
    label: z.string().optional(),
    labelMarkdown: z.string().optional()
  }).optional(),
  delete: z.boolean().optional()
});

export const SetAnnotationParamsSchema = z.object({
  entry: AnnotationEntrySchema.optional().describe("A single annotation operation to perform. Optional."),
  entries: z.array(AnnotationEntrySchema).optional().describe("An array of annotation operations to perform in batch. Optional.")
});
