/**
 * Figma effect-related commands.
 * Each command should be an async function that receives params and returns a result.
 */

import { MCP_COMMANDS } from "../../types/commands.js";
import { ensureNodeIdIsString } from "../../utils/node-utils.js";
import type { FigmaClient } from "./index.js";

/**
 * Figma effect-related commands.
 * Each command should be an async function that receives params and returns a result.
 */
export const effectCommands = {
  /**
   * Sets visual effects (shadows, blurs) on a node
   * 
   * @param {object} params - Effect parameters
   * @returns {Promise<any>} Operation result
   */
  async setEffects(
    this: FigmaClient,
    params: {
      nodeId: string;
      effects: Array<{
        type: "DROP_SHADOW" | "INNER_SHADOW" | "LAYER_BLUR" | "BACKGROUND_BLUR";
        color?: { r: number; g: number; b: number; a: number };
        offset?: { x: number; y: number };
        radius?: number;
        spread?: number;
        visible?: boolean;
        blendMode?: string;
      }>;
    }
  ): Promise<any> {
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    return this.executeCommand(MCP_COMMANDS.SET_EFFECT, {
      nodeId: nodeIdString,
      effects: params.effects
    });
  },

  /**
   * Sets the effect style ID for a node in Figma.
   * @param params - { nodeId: string, effectStyleId: string }
   * @returns {Promise<any>}
   */
  async setEffectStyleId(
    this: FigmaClient,
    params: { nodeId: string, effectStyleId: string }
  ): Promise<any> {
    // SET_EFFECT_STYLE_ID is deprecated; use CREATE_EFFECT_STYLE_VARIABLE
    return this.executeCommand(MCP_COMMANDS.CREATE_EFFECT_STYLE_VARIABLE, params);
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
