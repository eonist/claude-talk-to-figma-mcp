import type { McpServer } from "../../../server.js";
import type { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../../types/commands.js";

import { GuideEntry, SetGuideSchema, GetGuideSchema } from "./schema/guide-schema.js";

export function registerGuideCommands(server: McpServer, figmaClient: FigmaClient) {
  // set_guide: add/delete guides (single or batch)
  server.tool(
    MCP_COMMANDS.SET_GUIDE,
    `Add or delete one or more guides on the current Figma page.

Returns: Array of result objects for each operation.`,
    SetGuideSchema.shape,
    async (params) => {
      const ops = params.guide ? [params.guide] : (params.guides || []);
      const results = [];
      let anySuccess = false;
      for (const op of ops) {
        try {
          const result = await figmaClient.executeCommand(MCP_COMMANDS.SET_GUIDE, op);
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
        return { content: [{ type: "text", text: JSON.stringify({ success: true, results }) }] };
      } else {
        return {
          content: [{ type: "text", text: JSON.stringify({ success: false, error: { message: "All guide operations failed", results } }) }]
        };
      }
    }
  );

  // get_guide: get all guides on the current page
  server.tool(
    MCP_COMMANDS.GET_GUIDE,
    `Get all guides on the current Figma page.

Returns: Array of guides, each with { axis, offset }`,
    GetGuideSchema.shape,
    async () => {
      const result = await figmaClient.executeCommand(MCP_COMMANDS.GET_GUIDE, {});
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
