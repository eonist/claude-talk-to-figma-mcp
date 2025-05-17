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
 * @property {function} createGradientVariable - Create a gradient variable.
 * @property {function} applyGradientStyle - Apply a gradient style.
 */
import { setFillColor, setStrokeColor, setStyle } from './styles/styles-color.js';
import { setEffects, setEffectStyleId } from './styles/styles-effects.js';
import { createGradientVariable, applyGradientStyle } from './styles/styles-gradient.js';
import { getStyles } from './styles/styles-get.js';

export const styleOperations = {
  setStyle,
  setFillColor,
  setStrokeColor,
  getStyles,
  setEffects,
  setEffectStyleId,
  createGradientVariable,
  applyGradientStyle
};
