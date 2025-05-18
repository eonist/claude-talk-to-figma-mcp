/**
 * Figma Variable (Design Token) command group for FigmaClient.
 * Provides methods for create, update, delete, query, apply, and mode switching.
 */

export const variableCommands = {
  /**
   * Create one or more Figma Variables.
   * @param {Object} params - { variables: [variableDef] }
   */
  async createVariable(params) {
    // params: { variables: [...] }
    return this.executeCommand("create_variable", params);
  },

  /**
   * Update one or more Figma Variables.
   * @param {Object} params - { variables: [variableDefWithId] }
   */
  async updateVariable(params) {
    // params: { variables: [...] }
    return this.executeCommand("update_variable", params);
  },

  /**
   * Delete one or more Figma Variables.
   * @param {Object} params - { ids: [string] }
   */
  async deleteVariable(params) {
    // params: { ids: [...] }
    return this.executeCommand("delete_variable", params);
  },

  /**
   * Query Figma Variables.
   * @param {Object} params - { type?, collection?, mode?, ids? }
   */
  async getVariables(params) {
    return this.executeCommand("get_variables", params);
  },

  /**
   * Apply a Figma Variable to a node property.
   * @param {Object} params - { nodeId, variableId, property }
   */
  async applyVariableToNode(params) {
    return this.executeCommand("apply_variable_to_node", params);
  },

  /**
   * Switch the mode for a Figma Variable collection.
   * @param {Object} params - { collection, mode }
   */
  async switchVariableMode(params) {
    return this.executeCommand("switch_variable_mode", params);
  }
};
