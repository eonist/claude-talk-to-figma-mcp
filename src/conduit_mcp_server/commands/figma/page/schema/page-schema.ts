import { z } from "zod";

const PageOp = z.object({
  pageId: z.string().optional(),
  name: z.string().optional(),
  delete: z.boolean().optional(),
  setCurrent: z.boolean().optional(),
});

export const SetPageSchema = z.object({
  page: PageOp.optional(),
  pages: z.array(PageOp).optional(),
});

export const GetPageSchema = z.object({
  pageId: z.string().optional(),
  pageIds: z.array(z.string()).optional(),
});
