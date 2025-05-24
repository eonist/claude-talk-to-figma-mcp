import { z } from "zod";
import { InstanceIdSchema } from "./instance-id-schema.js";

/**
 * Zod schema for the detach_instances command parameters.
 */
export const DetachInstancesSchema = z.object({
  instanceId: InstanceIdSchema.optional().describe("A single Figma instance ID to detach."),
  instanceIds: z.array(InstanceIdSchema).optional().describe("An array of Figma instance IDs to detach in batch."),
  options: z.object({
    maintain_position: z.boolean().optional().describe("If true, maintain the position of the instance after detaching."),
    skip_errors: z.boolean().optional().describe("If true, skip errors and continue processing remaining instances."),
  }).optional().describe("Options for detaching instances."),
}).describe("Parameters for the detach_instances command. Provide either 'instanceId' or 'instanceIds'.");
