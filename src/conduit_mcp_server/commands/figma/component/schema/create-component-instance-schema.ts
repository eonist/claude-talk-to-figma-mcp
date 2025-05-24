import { z } from "zod";

/**
 * Zod schema for a single component instance creation entry.
 */
export const ComponentInstanceEntrySchema = z.object({
  componentKey: z.string().min(1).max(100).describe("The unique key of the component to instantiate."),
  x: z.number().min(-10000).max(10000).describe("The X coordinate for the instance on the Figma canvas."),
  y: z.number().min(-10000).max(10000).describe("The Y coordinate for the instance on the Figma canvas.")
}).describe("A single component instance creation entry.");

/**
 * Zod schema for the create_component_instance command parameters.
 */
export const CreateComponentInstanceSchema = z.object({
  entry: ComponentInstanceEntrySchema.optional().describe("A single component instance creation entry."),
  entries: z.array(ComponentInstanceEntrySchema).optional().describe("An array of component instance creation entries for batch creation.")
}).describe("Parameters for the create_component_instance command. Provide either 'entry' or 'entries'.");
