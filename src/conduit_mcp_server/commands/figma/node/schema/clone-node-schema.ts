import { z } from "zod";
export const CloneNodeConfig = z.object({
  nodeId: z.string()
    .describe("ID of the node to clone."),
  position: z.object({
    x: z.number().describe("X coordinate for the new node's position."),
    y: z.number().describe("Y coordinate for the new node's position.")
  }).optional().describe("Optional absolute position for the cloned node."),
  offsetX: z.number().optional().describe("Optional X offset to apply to the cloned node's position."),
  offsetY: z.number().optional().describe("Optional Y offset to apply to the cloned node's position."),
  parentId: z.string().optional().describe("Optional parent node ID to attach the cloned node to.")
}).describe("A single node clone configuration.");

export const CloneNodeSchema = z.object({
  node: CloneNodeConfig.optional().describe("A single node clone configuration. Optional."),
  nodes: z.array(CloneNodeConfig).optional().describe("An array of node clone configurations for batch cloning. Optional.")
});
