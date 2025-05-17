/**
 * Figma gradient-related commands.
 * Each command should be an async function that receives params and returns a result.
 */

export const gradientCommands = {
  /**
   * Create one or more gradient style variables.
   * @param {Object} params - { gradients: [gradientDef] }
   */
  async create_gradient_style({ gradients }) {
    const gradientList = Array.isArray(gradients) ? gradients : [gradients];
    // TODO: Implement actual Figma API logic
    // For now, return mock IDs for each gradient
    return gradientList.map((gradient, i) => ({
      id: `S:gradient${1000 + i}`,
      name: gradient.name,
      success: true
    }));
  },

  /**
   * Set a gradient on one or more nodes, either directly or by style variable.
   * @param {Object} params - { entries: [{ nodeId, gradientType?, stops?, gradientStyleId?, applyTo? }] }
   */
  async set_gradient({ entries }) {
    const entryList = Array.isArray(entries) ? entries : [entries];
    // TODO: Implement actual Figma API logic
    // For now, return mock success for each entry
    return entryList.map(entry => ({
      nodeId: entry.nodeId,
      gradientType: entry.gradientType,
      stops: entry.stops,
      gradientStyleId: entry.gradientStyleId,
      applyTo: entry.applyTo,
      success: true
    }));
  }
};
