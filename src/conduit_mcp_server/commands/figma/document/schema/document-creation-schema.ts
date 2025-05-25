import { z } from "zod";

export const DuplicatePageSchema = z.object({
  pageId: z.string().describe("The ID of the page to duplicate."),
  newPageName: z.string().optional().describe("Optional name for the new page.")
});
