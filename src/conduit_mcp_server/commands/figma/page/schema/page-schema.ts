import { z } from "zod";

/**
 * Operations that can be performed on a page
 */
const PageOp = z.object({
  /** Unique identifier for the page */
  pageId: z.string().optional(),

  /** Display name of the page */
  name: z.string().optional(),

  /** Whether to delete this page */
  delete: z.boolean().optional(),

  /** Whether to set this page as the current active page */
  setCurrent: z.boolean().optional(),
});

/**
 * Schema for page management operations
 * Supports both single page and batch operations
 */
export const SetPageSchema = z.object({
  /** Single page operation */
  page: PageOp.optional(),

  /** Multiple page operations for batch processing */
  pages: z.array(PageOp).optional(),
});

/**
 * Schema for retrieving page information
 * Can query single page or multiple pages
 */
export const GetPageSchema = z.object({
  /** Single page ID to retrieve */
  pageId: z.string().optional(),

  /** Multiple page IDs for batch retrieval */
  pageIds: z.array(z.string()).optional(),
});
