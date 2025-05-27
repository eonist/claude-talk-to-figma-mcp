import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { SingleMaskSchema, BatchMaskSchema } from "./schema/mask-schema.js";

/**
 * Registers the set_mask tool (single and batch) with the MCP server.
 * Supports:
 *   - Single: { targetNodeId, maskNodeId, channelId? }
 *   - Batch: { operations: [ { targetNodeId, maskNodeId, channelId? }, ... ] }
 */
export function registerMaskTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.SET_MASK,
    `Applies a mask in Figma. Supports single or batch:
- Single: { targetNodeId, maskNodeId, channelId? }
- Batch: { operations: [ { targetNodeId, maskNodeId, channelId? }, ... ] }
Returns an array of result objects.`,
    {
      // Accept either single or batch, both optional, at least one required
      ...SingleMaskSchema.shape,
      ...BatchMaskSchema.shape
    },
    {
      title: "Set Mask (Single or Batch)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { targetNodeId: "123:456", maskNodeId: "789:012" },
        { operations: [
            { targetNodeId: "123:456", maskNodeId: "789:012" },
            { targetNodeId: "234:567", maskNodeId: "890:123" }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "Both targetNodeId and maskNodeId are required for single operation.",
        "Each operation in batch must have both targetNodeId and maskNodeId."
      ],
      extraInfo: "Returns an array of result objects for each mask operation."
    },
    async (args, extra): Promise<any> => {
      try {
        if (Array.isArray(args.operations)) {
          // Batch mode
          const results = await figmaClient.setMaskBatch({ operations: args.operations });
          // Always return array for consistency
          return Array.isArray(results) ? results : [results];
        } else if (args.targetNodeId && args.maskNodeId) {
          // Single mode
          const result = await figmaClient.setMask({
            targetNodeId: args.targetNodeId,
            maskNodeId: args.maskNodeId,
            channelId: args.channelId
          });
          return [result];
        } else {
          throw new Error("You must provide either { targetNodeId, maskNodeId } or { operations: [...] }");
        }
      } catch (err) {
        return [{
          success: false,
          error: err instanceof Error ? err.message : String(err)
        }];
      }
    }
  );
}
