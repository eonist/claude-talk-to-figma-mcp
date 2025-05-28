import { z } from "zod";

/**
 * Configuration for a layout guide line
 * Guides help with precise positioning and alignment of elements
 */
export const GuideEntry = z.object({
  /** 
   * The axis along which the guide is positioned
   * - X: Vertical guide line (positioned along X-axis)
   * - Y: Horizontal guide line (positioned along Y-axis)
   */
  axis: z.enum(["X", "Y"]),

  /** Position offset from the origin point in pixels */
  offset: z.number(),

  /** Whether to remove this guide */
  delete: z.boolean().optional(),
});

/**
 * Schema for setting layout guides
 * Can handle single guide or batch operations
 */
export const SetGuideSchema = z.object({
  /** Single guide to set */
  guide: GuideEntry.optional(),

  /** Multiple guides for batch operations */
  guides: z.array(GuideEntry).optional(),
});

/**
 * Schema for retrieving all layout guides
 * No parameters required as it returns all guides
 */
export const GetGuideSchema = z.object({}); // No params
