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
 * Unified style management for Figma: create, update, delete (PAINT, EFFECT, TEXT, GRID).
 * Used by MCP set_fill_and_stroke command.
 *
 * @param {object} params - { nodeId, nodeIds, fillColor, strokeColor, strokeWeight }
 * @returns {Promise<object>} Result: { results: [...] }
 */
async function setFillAndStrokeUnified(params) {
  console.log("💥 setFillAndStrokeUnified", params);
  const { nodeId, nodeIds, fillColor, strokeColor, strokeWeight } = params;
  const ids = nodeIds || (nodeId ? [nodeId] : []);
  if (!ids.length) throw new Error("No node IDs provided");
  const results = [];
  for (const id of ids) {
    const node = await figma.getNodeByIdAsync(id);
    if (!node) throw new Error(`Node not found: ${id}`);
    if ("fillColor" in params && fillColor) {
      const { r, g, b, a } = fillColor;
      node.fills = [{
        type: "SOLID",
        color: { r, g, b },
        opacity: a
      }];
    }
    if ("strokeColor" in params && strokeColor) {
      const { r, g, b, a } = strokeColor;
      node.strokes = [{
        type: "SOLID",
        color: { r, g, b },
        opacity: a
      }];
    }
    if ("strokeWeight" in params && strokeWeight !== undefined) {
      node.strokeWeight = strokeWeight;
    }
    const result = { id };
    if ("fillColor" in params && fillColor) result.fill = node.fills;
    if ("strokeColor" in params && strokeColor) result.stroke = node.strokes;
    if ("strokeWeight" in params && strokeWeight !== undefined) result.strokeWeight = node.strokeWeight;
    results.push(result);
  }
  return { results };
}

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
  setFillAndStrokeUnified,
  createEffectStyleVariable
};
