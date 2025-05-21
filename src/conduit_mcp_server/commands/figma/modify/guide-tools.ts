import type { McpServer } from "../../../server.js";
import type { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../../types/commands.js";

// Guide schema
const GuideEntry = z.object({
  axis: z.enum(["X", "Y"]),
  offset: z.number(),
  delete: z.boolean().optional(),
});
const SetGuideSchema = z.object({
  guide: GuideEntry.optional(),
  guides: z.array(GuideEntry).optional(),
});
const GetGuideSchema = z.object({}); // No params

export function registerGuideCommands(server: McpServer, figmaClient: FigmaClient) {
  // set_guide: add/delete guides (single or batch)
  server.tool(
    MCP_COMMANDS.SET_GUIDE,
    `Add or delete one or more guides on the current Figma page.

Parameters:
- guide (object, optional): Single guide operation
  - axis ("X"|"Y"): Guide direction
  - offset (number): Position in canvas coordinates
  - delete (boolean, optional): If true, delete the guide at axis/offset
- guides (array, optional): Batch of guide operations (same shape as above)

Returns: Array of result objects for each operation.`,
    SetGuideSchema,
    async (params) => {
      const ops = params.guide ? [params.guide] : (params.guides || []);
      const results = [];
      let anySuccess = false;
      for (const op of ops) {
        try {
          const result = await figmaClient.setGuide(op);
          // If plugin returns an array, flatten it
          if (Array.isArray(result)) {
            for (const r of result) {
              results.push({ ...r, axis: op.axis, offset: op.offset, success: !r.error });
              if (!r.error) anySuccess = true;
            }
          } else {
            results.push({ ...result, axis: op.axis, offset: op.offset, success: !result.error });
            if (!result.error) anySuccess = true;
          }
        } catch (err: any) {
          results.push({ axis: op.axis, offset: op.offset, success: false, error: err?.message || String(err) });
        }
      }
      if (anySuccess) {
        return { success: true, results };
      } else {
        return {
          success: false,
          error: {
            message: "All guide operations failed",
            results
          }
        };
      }
    }
  );

  // get_guide: get all guides on the current page
  server.tool(
    MCP_COMMANDS.GET_GUIDE,
    `Get all guides on the current Figma page.

Parameters: none

Returns: Array of guides, each with { axis, offset }`,
    GetGuideSchema,
    async () => {
      return await figmaClient.getGuide();
    }
  );
}
