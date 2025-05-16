import { z } from "zod";

/**
 * Shared Zod schema for image configuration objects (from URL).
 * Used for both single and batch image insertion tools.
 */
export const SingleImageFromUrlSchema = z.object({
  url: z.string()
    .url()
    .describe("The URL of the image to insert. Must be a valid URL."),
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
});

export const BatchImagesFromUrlSchema = z.array(SingleImageFromUrlSchema);

export const SingleLocalImageSchema = z.object({
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
});

export const BatchLocalImagesSchema = z.array(SingleLocalImageSchema);

export const ImageFromUrlSchema = z.union([
  SingleImageFromUrlSchema,
  BatchImagesFromUrlSchema
]);

export const LocalImageSchema = z.union([
  SingleLocalImageSchema,
  BatchLocalImagesSchema
]);

/**
 * TypeScript type inferred from ImageFromUrlSchema.
 */
export type ImageFromUrlConfig = z.infer<typeof SingleImageFromUrlSchema>;
export type BatchImagesFromUrlConfig = z.infer<typeof BatchImagesFromUrlSchema>;
export type LocalImageConfig = z.infer<typeof SingleLocalImageSchema>;
export type BatchLocalImagesConfig = z.infer<typeof BatchLocalImagesSchema>;
