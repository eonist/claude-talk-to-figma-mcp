/**
 * Figma effect-related commands.
 * Each command should be an async function that receives params and returns a result.
 */

export const effectCommands = {
  /**
   * Apply an effect style to one or more nodes.
   * @param {Object} params - { entries: [{ nodeId, effectStyleId }] }
   */
  async apply_effect_style({ entries }) {
    const entryList = Array.isArray(entries) ? entries : [entries];
    // TODO: Implement actual Figma API logic
    // For now, return mock success for each entry
    return entryList.map(entry => ({
      nodeId: entry.nodeId,
      effectStyleId: entry.effectStyleId,
      success: true
    }));
  },

  /**
   * Set effect(s) directly or by style variable on one or more nodes.
   * @param {Object} params - { entries: [{ nodeId, effects?, effectStyleId? }] }
   */
  async set_effect({ entries }) {
    const entryList = Array.isArray(entries) ? entries : [entries];
    // TODO: Implement actual Figma API logic
    // For now, return mock success for each entry
    return entryList.map(entry => ({
      nodeId: entry.nodeId,
      effects: entry.effects,
      effectStyleId: entry.effectStyleId,
      success: true
    }));
  },

  /**
   * Create one or more effect style variables.
   * @param {Object} params - { effects: [effectDef] }
   */
  async create_effect_style_variable({ effects }) {
    const effectList = Array.isArray(effects) ? effects : [effects];
    // TODO: Implement actual Figma API logic
    // For now, return mock IDs for each effect
    return effectList.map((effect, i) => ({
      id: `S:effect${1000 + i}`,
      name: effect.name,
      success: true
    }));
  }
};
