import { z } from "zod";

/**
 * Shared Zod schema for font family and style.
 */
export const FontFamilyStyleSchema = z.object({
  family: z.string()
    .min(1)
    .max(100)
    .describe("The font family to set. Must be a non-empty string. Maximum length 100 characters."),
  style: z.string()
    .min(1)
    .max(100)
    .optional()
    .describe("Optional. The font style to set (e.g., 'Bold', 'Italic'). If provided, must be a non-empty string. Maximum length 100 characters."),
});

/**
 * Shared Zod schema for font size.
 */
export const FontSizeSchema = z.object({
  fontSize: z.number()
    .min(1)
    .max(512)
    .describe("The font size to set, in points. Must be a positive number between 1 and 512."),
});

/**
 * Shared Zod schema for font weight.
 */
export const FontWeightSchema = z.object({
  weight: z.number()
    .int()
    .min(100)
    .max(1000)
    .describe("The font weight to set. Must be an integer between 100 and 1000 (typical Figma font weight range)."),
});

/**
 * TypeScript types inferred from schemas.
 */
export type FontFamilyStyle = z.infer<typeof FontFamilyStyleSchema>;
export type FontSize = z.infer<typeof FontSizeSchema>;
export type FontWeight = z.infer<typeof FontWeightSchema>;
