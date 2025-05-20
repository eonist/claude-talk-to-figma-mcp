/**
 * Figma Variable (Design Token) command group for FigmaClient.
 * Provides methods for create, update, delete, query, apply, and mode switching.
 */
import { MCP_COMMANDS } from "../types/commands.js";
import type { FigmaClient } from "./figma-client.ts";
import type { SetVariableParams } from "../types/command-params.ts";

/**
 * Set (create, update, or delete) one or more Figma Variables.
 * @param client FigmaClient instance
 * @param params { entry?: VariableEntry, entries?: VariableEntry[] }
 * Each entry can be create (no id), update (id present), or delete (id + delete: true).
 */
export async function setVariable(client: FigmaClient, params: SetVariableParams) {
  return client.executeCommand(MCP_COMMANDS.SET_VARIABLE, params);
}

/**
 * Query Figma Variables.
 * @param client FigmaClient instance
 * @param params { type?, collection?, mode?, ids? }
 */
export async function getVariables(client: FigmaClient, params: any) {
  return client.executeCommand(MCP_COMMANDS.GET_VARIABLE, params);
}

/**
 * Apply a Figma Variable to a node property.
 * @param client FigmaClient instance
 * @param params { nodeId, variableId, property }
 */
export async function applyVariableToNode(client: FigmaClient, params: any) {
  return client.executeCommand(MCP_COMMANDS.APPLY_VARIABLE_TO_NODE, params);
}

/**
 * Switch the mode for a Figma Variable collection.
 * @param client FigmaClient instance
 * @param params { collection, mode }
 */
export async function switchVariableMode(client: FigmaClient, params: any) {
  return client.executeCommand(MCP_COMMANDS.SWITCH_VARIABLE_MODE, params);
}
