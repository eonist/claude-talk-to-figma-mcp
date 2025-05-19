/**
 * Figma Variable (Design Token) command group for FigmaClient.
 * Provides methods for create, update, delete, query, apply, and mode switching.
 */
import { MCP_COMMANDS } from "../types/commands.js";

export const variableCommands = {
  /**
   * Create one or more Figma Variables.
   * @param {Object} params - { variables: [variableDef] }
   */
  async createVariable(params) {
    // params: { variables: [...] }
    return this.executeCommand(MCP_COMMANDS.CREATE_VARIABLE, params);
  },

  /**
   * Update one or more Figma Variables.
   * @param {Object} params - { variables: [variableDefWithId] }
   */
  async updateVariable(params) {
    // params: { variables: [...] }
    return this.executeCommand(MCP_COMMANDS.UPDATE_VARIABLE, params);
  },

  /**
   * Delete one or more Figma Variables.
   * @param {Object} params - { ids: [string] }
   */
  async deleteVariable(params) {
    // params: { ids: [...] }
    return this.executeCommand(MCP_COMMANDS.DELETE_VARIABLE, params);
  },

  /**
   * Query Figma Variables.
   * @param {Object} params - { type?, collection?, mode?, ids? }
   */
  async getVariables(params) {
    return this.executeCommand(MCP_COMMANDS.GET_VARIABLES, params);
  },

  /**
   * Apply a Figma Variable to a node property.
   * @param {Object} params - { nodeId, variableId, property }
   */
  async applyVariableToNode(params) {
    return this.executeCommand(MCP_COMMANDS.APPLY_VARIABLE_TO_NODE, params);
  },

  /**
   * Switch the mode for a Figma Variable collection.
   * @param {Object} params - { collection, mode }
   */
  async switchVariableMode(params) {
    return this.executeCommand(MCP_COMMANDS.SWITCH_VARIABLE_MODE, params);
  }
};
