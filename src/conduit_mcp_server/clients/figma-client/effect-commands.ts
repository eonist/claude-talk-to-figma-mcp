/**
 * Figma effect-related commands.
 * Each command should be an async function that receives params and returns a result.
 */

import { MCP_COMMANDS } from "../../types/commands.js";
import type { FigmaClient } from "./index.js";

/**
 * Figma effect-related commands.
 * Each command should be an async function that receives params and returns a result.
 */
export const effectCommands = {
  /**
   * Sets effects on a node in Figma.
   * @param params - effect operation parameters
   * @returns {Promise<any>}
   */
  async setEffects(
    this: FigmaClient,
    params: any
  ): Promise<any> {
    return this.executeCommand(MCP_COMMANDS.SET_EFFECT, params);
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
