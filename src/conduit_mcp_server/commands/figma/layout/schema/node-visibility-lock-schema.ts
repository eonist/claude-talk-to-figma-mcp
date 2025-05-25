import { z } from "zod";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

export const NodeIdSchema = z.string().refine(isValidNodeId, { message: "Invalid Figma node ID" });
export const NodeIdsSchema = z.array(NodeIdSchema).min(1).max(100);

export const LockSchema = z.object({
  nodeId: NodeIdSchema.optional(),
  nodeIds: NodeIdsSchema.optional(),
  locked: z.boolean(),
}).refine(
  (data) => !!data.nodeId !== !!data.nodeIds,
  { message: "Provide either nodeId or nodeIds, not both." }
);

export const VisibleSchema = z.object({
  nodeId: NodeIdSchema.optional(),
  nodeIds: NodeIdsSchema.optional(),
  visible: z.boolean(),
}).refine(
  (data) => !!data.nodeId !== !!data.nodeIds,
  { message: "Provide either nodeId or nodeIds, not both." }
);

export const SetNodePropSchema = z.object({
  nodeId: NodeIdSchema.optional(),
  nodeIds: NodeIdsSchema.optional(),
  properties: z.object({
    locked: z.boolean().optional(),
    visible: z.boolean().optional(),
  }).refine(obj => Object.keys(obj).length > 0, { message: "At least one property must be specified." })
}).refine(
  (data) => !!data.nodeId !== !!data.nodeIds,
  { message: "Provide either nodeId or nodeIds, not both." }
);
