import { z } from "zod";

/**
 * Shared Zod schema for rectangle configuration objects.
 * Used for both single and batch rectangle creation tools.
 */
export const SingleRectangleSchema = z.object({
  x: z.number().min(0, "x must be >= 0")
    .describe("The X coordinate (in Figma canvas units, pixels) for the top-left corner of the rectangle. Must be >= 0. Example: 100"),
  y: z.number().min(0, "y must be >= 0")
    .describe("The Y coordinate (in Figma canvas units, pixels) for the top-left corner of the rectangle. Must be >= 0. Example: 200"),
  width: z.number().positive("width must be > 0")
    .describe("The width of the rectangle in pixels. Must be > 0. Example: 300"),
  height: z.number().positive("height must be > 0")
    .describe("The height of the rectangle in pixels. Must be > 0. Example: 150"),
  name: z.string()
    .describe("The name to assign to the rectangle node in Figma. Example: 'Button Background'")
    .optional(),
  parentId: z.string()
    .describe("The Figma node ID of the parent to attach the rectangle to. If omitted, the rectangle is added to the root.")
    .optional(),
cornerRadius: z.number().min(0, "cornerRadius must be >= 0")
  .describe("The corner radius (in pixels) for rounded corners. Must be >= 0. Example: 8")
  .optional()
});

export const BatchRectanglesSchema = z.array(SingleRectangleSchema);

export const RectangleSchema = z.union([
  SingleRectangleSchema,
  BatchRectanglesSchema
]);

/**
 * TypeScript type inferred from RectangleSchema.
 */
export type RectangleConfig = z.infer<typeof SingleRectangleSchema>;
export type BatchRectanglesConfig = z.infer<typeof BatchRectanglesSchema>;
