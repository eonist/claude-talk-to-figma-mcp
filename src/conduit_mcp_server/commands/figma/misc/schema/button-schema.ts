import { z } from "zod";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";

/**
 * Zod schema for a single button creation entry.
 */
export const ButtonEntrySchema = z.object({
  x: z.number().min(-10000).max(10000).describe("The X coordinate for the button on the Figma canvas."),
  y: z.number().min(-10000).max(10000).describe("The Y coordinate for the button on the Figma canvas."),
  width: z.number().min(1).max(2000).optional().describe("The width of the button in pixels."),
  height: z.number().min(1).max(2000).optional().describe("The height of the button in pixels."),
  text: z.string().min(1).max(200).optional().describe("The text label for the button."),
  background: z.object({
    r: z.number().min(0).max(1).describe("Red channel (0-1)"),
    g: z.number().min(0).max(1).describe("Green channel (0-1)"),
    b: z.number().min(0).max(1).describe("Blue channel (0-1)"),
    a: z.number().min(0).max(1).optional().describe("Alpha channel (0-1)")
  }).optional().describe("The background color of the button as RGBA."),
  textColor: z.object({
    r: z.number().min(0).max(1).describe("Red channel (0-1)"),
    g: z.number().min(0).max(1).describe("Green channel (0-1)"),
    b: z.number().min(0).max(1).describe("Blue channel (0-1)"),
    a: z.number().min(0).max(1).optional().describe("Alpha channel (0-1)")
  }).optional().describe("The text color of the button as RGBA."),
  fontSize: z.number().min(1).max(200).optional().describe("The font size for the button text."),
  fontWeight: z.number().min(100).max(1000).optional().describe("The font weight for the button text."),
  cornerRadius: z.number().min(0).max(100).optional().describe("The corner radius for the button."),
  name: z.string().min(1).max(100).optional().describe("The name to assign to the button node."),
  parentId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" }).optional().describe("The parent node ID to attach the button to."),
}).describe("A single button creation entry.");

/**
 * Zod schema for the create_button command parameters.
 */
export const CreateButtonSchema = z.object({
  // Single button
  x: z.number().min(-10000).max(10000).optional().describe("The X coordinate for the button on the Figma canvas."),
  y: z.number().min(-10000).max(10000).optional().describe("The Y coordinate for the button on the Figma canvas."),
  width: z.number().min(1).max(2000).optional().describe("The width of the button in pixels."),
  height: z.number().min(1).max(2000).optional().describe("The height of the button in pixels."),
  text: z.string().min(1).max(200).optional().describe("The text label for the button."),
  background: z.object({
    r: z.number().min(0).max(1).describe("Red channel (0-1)"),
    g: z.number().min(0).max(1).describe("Green channel (0-1)"),
    b: z.number().min(0).max(1).describe("Blue channel (0-1)"),
    a: z.number().min(0).max(1).optional().describe("Alpha channel (0-1)")
  }).optional().describe("The background color of the button as RGBA."),
  textColor: z.object({
    r: z.number().min(0).max(1).describe("Red channel (0-1)"),
    g: z.number().min(0).max(1).describe("Green channel (0-1)"),
    b: z.number().min(0).max(1).describe("Blue channel (0-1)"),
    a: z.number().min(0).max(1).optional().describe("Alpha channel (0-1)")
  }).optional().describe("The text color of the button as RGBA."),
  fontSize: z.number().min(1).max(200).optional().describe("The font size for the button text."),
  fontWeight: z.number().min(100).max(1000).optional().describe("The font weight for the button text."),
  cornerRadius: z.number().min(0).max(100).optional().describe("The corner radius for the button."),
  name: z.string().min(1).max(100).optional().describe("The name to assign to the button node."),
  parentId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" }).optional().describe("The parent node ID to attach the button to."),
  // Batch
  buttons: z.array(ButtonEntrySchema).optional().describe("An array of button creation entries for batch creation."),
}).describe("Parameters for the create_button command. Provide either single button properties or 'buttons' for batch creation.");
