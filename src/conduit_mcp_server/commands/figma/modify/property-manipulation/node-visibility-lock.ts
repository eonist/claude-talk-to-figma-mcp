import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { handleToolError } from "../../../../utils/error-handling.js";
import { MCP_COMMANDS } from "../../../../types/commands.js";

const NodeIdSchema = z.string().refine(isValidNodeId, { message: "Invalid Figma node ID" });
const NodeIdsSchema = z.array(NodeIdSchema).min(1).max(100);

const LockSchema = z.object({
  nodeId: NodeIdSchema.optional(),
  nodeIds: NodeIdsSchema.optional(),
  locked: z.boolean(),
}).refine(
  (data) => !!data.nodeId !== !!data.nodeIds,
  { message: "Provide either nodeId or nodeIds, not both." }
);

const VisibleSchema = z.object({
  nodeId: NodeIdSchema.optional(),
  nodeIds: NodeIdsSchema.optional(),
  visible: z.boolean(),
}).refine(
  (data) => !!data.nodeId !== !!data.nodeIds,
  { message: "Provide either nodeId or nodeIds, not both." }
);

export function registerNodeLockVisibilityCommands(server, figmaClient) {
  // Unified lock/unlock
  server.tool(
    MCP_COMMANDS.SET_NODE_LOCKED,
    "Locks or unlocks one or more nodes.",
    LockSchema,
    async (params: { nodeId?: string; nodeIds?: string[]; locked: boolean }) => {
      try {
        if (params.nodeId) {
          await figmaClient.executeCommand("set_node_locked", { nodeId: params.nodeId, locked: params.locked });
          return { content: [{ type: "text", text: `Node ${params.nodeId} ${params.locked ? "locked" : "unlocked"}.` }] };
        } else if (params.nodeIds) {
          const results = await Promise.all(
            params.nodeIds.map((nodeId: string) =>
              figmaClient.executeCommand("set_node_locked", { nodeId, locked: params.locked })
                .then(() => ({ nodeId, success: true }))
                .catch((e: any) => ({ nodeId, success: false, error: e.message }))
            )
          );
          return { content: [{ type: "text", text: `${params.locked ? "Locked" : "Unlocked"} nodes: ${results.map((r: { nodeId: string }) => r.nodeId).join(", ")}` }] };
        } else {
          throw new Error("Must provide nodeId or nodeIds");
        }
      } catch (err: any) {
        return handleToolError(err, "node-visibility-lock", "set_node_locked");
      }
    }
  );

  // Unified hide/show
  server.tool(
    MCP_COMMANDS.SET_NODE_VISIBLE,
    "Shows or hides one or more nodes.",
    VisibleSchema,
    async (params: { nodeId?: string; nodeIds?: string[]; visible: boolean }) => {
      try {
        if (params.nodeId) {
          await figmaClient.executeCommand("set_node_visible", { nodeId: params.nodeId, visible: params.visible });
          return { content: [{ type: "text", text: `Node ${params.nodeId} ${params.visible ? "shown" : "hidden"}.` }] };
        } else if (params.nodeIds) {
          const results = await Promise.all(
            params.nodeIds.map((nodeId: string) =>
              figmaClient.executeCommand("set_node_visible", { nodeId, visible: params.visible })
                .then(() => ({ nodeId, success: true }))
                .catch((e: any) => ({ nodeId, success: false, error: e.message }))
            )
          );
          return { content: [{ type: "text", text: `${params.visible ? "Shown" : "Hidden"} nodes: ${results.map((r: { nodeId: string }) => r.nodeId).join(", ")}` }] };
        } else {
          throw new Error("Must provide nodeId or nodeIds");
        }
      } catch (err: any) {
        return handleToolError(err, "node-visibility-lock", "set_node_visible");
      }
    }
  );
}
