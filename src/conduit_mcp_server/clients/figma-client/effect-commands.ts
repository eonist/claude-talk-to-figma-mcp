/**
 * Figma effect-related commands.
 * Each command should be an async function that receives params and returns a result.
 */

/**
 * Registers effect-related commands for managing visual effects on Figma nodes.
 * Provides methods to set effects, apply effect styles, and create effect style variables.
 * 
 * All methods are async and interact with the Figma API via the MCP client.
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
   * Sets visual effects (shadows, blurs) on a node.
   * 
   * @param {object} params - Effect parameters including nodeId and effects array.
   * @returns {Promise<any>} Operation result from Figma API.
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
   * 
   * @param params - Object containing nodeId and effectStyleId.
   * @returns {Promise<any>} Result of applying effect style.
   */
  async setEffectStyleId(
    this: FigmaClient,
    params: { nodeId: string, effectStyleId: string }
  ): Promise<any> {
    console.log("💥 setEffectStyleId");
    // Correctly forward to plugin as APPLY_EFFECT_STYLE
    return this.executeCommand(MCP_COMMANDS.APPLY_EFFECT_STYLE, params);
  },

  /**
   * Set effect(s) directly or by style variable on one or more nodes.
   * 
   * @param {Object} params - Object with entries array containing nodeId, effects, and/or effectStyleId.
   * @returns {Array} Array of results indicating success for each entry.
   */
  /**
   * Set effect(s) directly or by style variable on one or more nodes.
   * 
   * @param {Object} params - Object with entries array containing nodeId, effects, and/or effectStyleId.
   * @returns {Array} Array of results indicating success for each entry.
   */
  async set_effect({ entries }: { entries: Array<{ nodeId: string; effects?: any; effectStyleId?: string }> | { nodeId: string; effects?: any; effectStyleId?: string } }) {
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
   * 
   * @param {Object} params - Object containing effects array to create style variables for.
   * @returns {Array} Array of created effect style variable IDs and success status.
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
