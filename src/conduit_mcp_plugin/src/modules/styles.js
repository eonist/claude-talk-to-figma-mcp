/**
 * Styles operations module.
 * Provides functions to set fill, stroke, effects, gradients, and retrieve styles in Figma via MCP.
 *
 * @module modules/styles
 * @see {@link ./styles/styles-color.js}
 * @see {@link ./styles/styles-effects.js}
 * @see {@link ./styles/styles-gradient.js}
 * @see {@link ./styles/styles-get.js}
 */

/**
 * Collection of style operation functions for Figma.
 * @namespace styleOperations
 * @property {function} setStyle - Set fill and stroke style.
 * @property {function} setFillColor - Set fill color.
 * @property {function} setStrokeColor - Set stroke color.
 * @property {function} getStyles - Get all styles.
 * @property {function} setEffects - Set visual effects.
 * @property {function} setEffectStyleId - Set effect style by ID.
 * @property {function} createGradientStyle - Create a gradient style variable (single or batch).
 * @property {function} setGradient - Set a gradient (direct or style, single or batch).
 */
import { setFillColor, setStrokeColor } from './styles/styles-color.js';
import { setEffects, setEffectStyleId, createEffectStyleVariable } from './styles/styles-effects.js';
import { createGradientStyle, setGradient } from './styles/styles-gradient.js';
import { getStyles } from './styles/styles-get.js';
import { setStyle } from './styles/styles-set.js';

/**
 * Unified handler for SET_EFFECT plugin command.
 * Accepts both { entries } or flat single entry.
 * @function setEffectUnified
 * @param {object} params
 * @returns {Promise<any>}
 */
async function setEffectUnified(params) {
  if (params && Array.isArray(params.entries)) {
    // Batch: return array of results
    return Promise.all(params.entries.map(entry => setEffects(entry)));
  } else if (params && params.nodeId && params.effects) {
    // Singular: call directly
    return setEffects(params);
  } else {
    throw new Error("Invalid parameters for set_effect");
  }
}

export const styleOperations = {
  setFillColor,
  setStrokeColor,
  getStyles,
  setEffects,
  setEffectUnified,
  setEffectStyleId,
  createGradientStyle,
  setGradient,
  setStyle,
  createEffectStyleVariable
};
