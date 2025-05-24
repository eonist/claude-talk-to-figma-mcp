import { z } from "zod";

/**
 * Zod schema for a single constraint entry.
 */
export const ConstraintEntrySchema = z.object({
  nodeId: z.string().describe("The ID of the node to apply constraints to."),
  horizontal: z.enum(["left", "right", "center", "scale", "stretch"]).describe("The horizontal constraint to apply."),
  vertical: z.enum(["top", "bottom", "center", "scale", "stretch"]).describe("The vertical constraint to apply."),
}).describe("A single constraint entry for a Figma node.");

/**
 * Zod schema for the set_constraint command parameters.
 */
export const SetConstraintsSchema = z.object({
  constraint: ConstraintEntrySchema.optional().describe("A single constraint entry to apply."),
  constraints: z.array(ConstraintEntrySchema).optional().describe("An array of constraint entries to apply in batch."),
  applyToChildren: z.boolean().optional().describe("If true, apply constraints to all children of the node(s)."),
  maintainAspectRatio: z.boolean().optional().describe("If true, maintain the aspect ratio when applying constraints."),
}).describe("Parameters for the set_constraint command.");

/**
 * Zod schema for the get_constraint command parameters.
 */
export const GetConstraintsSchema = z.object({
  nodeId: z.string().optional().describe("The ID of a single node to get constraints for."),
  nodeIds: z.array(z.string()).optional().describe("An array of node IDs to get constraints for in batch."),
  includeChildren: z.boolean().optional().describe("If true, include constraints for all children of the node(s)."),
}).describe("Parameters for the get_constraint command.");
