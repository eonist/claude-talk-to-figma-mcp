import { z } from "zod";
export const RenameConfig = z.object({
  nodeId: z.string()
    .describe("The unique Figma node ID to rename. Must be a string in the format '123:456'."),
  newName: z.string()
    .min(1)
    .max(100)
    .describe("The new name for the node. Must be a non-empty string up to 100 characters."),
  setAutoRename: z.boolean().optional().describe("Whether to preserve TextNode autoRename"),
}).describe("A single rename configuration object.");

export const RenameSchema = z.object({
  rename: RenameConfig.optional().describe("A single rename configuration object. Optional."),
  renames: z.array(RenameConfig).optional().describe("An array of rename configuration objects for batch renaming. Optional.")
});
