import { z } from "zod";

/**
 * Shared Zod schema for export options.
 */
export const ExportOptionsSchema = z.object({
  format: z.enum(["PNG", "JPG", "SVG", "PDF"]).optional()
    .describe('Optional. The image format to export: "PNG", "JPG", "SVG", or "PDF". Defaults to "PNG" if omitted.'),
  scale: z.number().positive().optional()
    .describe("Optional. The export scale factor. Must be a positive number. Defaults to 1 if omitted."),
});

/**
 * TypeScript type inferred from schema.
 */
export type ExportOptions = z.infer<typeof ExportOptionsSchema>;
