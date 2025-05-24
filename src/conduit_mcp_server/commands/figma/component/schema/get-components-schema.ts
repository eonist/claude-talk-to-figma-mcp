import { z } from "zod";

/**
 * Zod schema for the get_components command parameters.
 */
export const GetComponentsSchema = z.object({
  source: z.enum(["local", "team", "remote"]).describe("The source to get components from: 'local' (current document), 'team' (team library), or 'remote' (remote team library)."),
  team_id: z.string().optional().describe("The team ID to use when the source is 'team' or 'remote'."),
  page_size: z.number().optional().describe("The number of components to return per page."),
  after: z.union([z.string(), z.number()]).optional().describe("A cursor for pagination, indicating where to start the next page."),
}).describe("Parameters for the get_components command.");
