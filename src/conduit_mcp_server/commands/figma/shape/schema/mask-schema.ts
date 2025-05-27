import { z } from "zod";

export const SingleMaskSchema = z.object({
  targetNodeId: z.string().describe("ID of the node to be masked"),
  maskNodeId: z.string().describe("ID of the node to use as mask"),
  channelId: z.string().optional().describe("Channel ID for communication")
});

export const BatchMaskSchema = z.object({
  operations: z.array(
    z.object({
      targetNodeId: z.string().describe("ID of the node to be masked"),
      maskNodeId: z.string().describe("ID of the node to use as mask"),
      channelId: z.string().optional().describe("Channel ID for communication")
    })
  )
});
