import { z } from "zod";

/**
 * Unified Zod schema for image configuration objects (remote or local).
 * Used for both single and batch image insertion tools.
 */
export const SingleUnifiedImageSchema = z.object({
  url: z.string()
    .url()
    .optional()
    .describe("Optional. The URL of the image to insert. Must be a valid URL."),
  imagePath: z.string()
    .min(1)
    .max(500)
    .optional()
    .describe("Optional. Path to the local image file. If provided, must be a non-empty string up to 500 characters."),
  imageData: z.string()
    .min(1)
    .max(10000000)
    .optional()
    .describe("Optional. Base64 data URI of the image. If provided, must be a non-empty string."),
  x: z.number()
    .min(-10000)
    .max(10000)
    .optional()
    .default(0)
    .describe("Optional. X coordinate for the image. Must be between -10,000 and 10,000. Defaults to 0."),
  y: z.number()
    .min(-10000)
    .max(10000)
    .optional()
    .default(0)
    .describe("Optional. Y coordinate for the image. Must be between -10,000 and 10,000. Defaults to 0."),
  width: z.number()
    .min(1)
    .max(10000)
    .optional()
    .describe("Optional. Width of the image. Must be between 1 and 10,000."),
  height: z.number()
    .min(1)
    .max(10000)
    .optional()
    .describe("Optional. Height of the image. Must be between 1 and 10,000."),
  name: z.string()
    .min(1)
    .max(100)
    .optional()
    .describe("Optional. Name for the image node. If provided, must be a non-empty string up to 100 characters."),
  parentId: z.string()
    .regex(/^\d+:\d+$/)
    .optional()
    .describe("Optional. Figma node ID of the parent. If provided, must be a string in the format '123:456'."),
}).refine(
  (obj) => !!(obj.url || obj.imagePath || obj.imageData),
  { message: "Must provide at least one of url, imagePath, or imageData" }
);

export const BatchUnifiedImagesSchema = z.array(SingleUnifiedImageSchema);

export const UnifiedImageSchema = z.union([
  SingleUnifiedImageSchema,
  BatchUnifiedImagesSchema
]);

/**
 * TypeScript type inferred from SingleUnifiedImageSchema.
 */
export type UnifiedImageConfig = z.infer<typeof SingleUnifiedImageSchema>;
export type BatchUnifiedImagesConfig = z.infer<typeof BatchUnifiedImagesSchema>;
