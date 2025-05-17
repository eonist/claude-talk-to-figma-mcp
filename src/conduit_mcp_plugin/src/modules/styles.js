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
