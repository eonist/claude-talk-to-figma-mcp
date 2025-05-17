/**
 * Font operations module.
 * Provides functions to set font properties and load fonts in Figma via MCP.
 *
 * @module modules/font
 * @see {@link ./font/font-set.js}
 * @see {@link ./font/font-load.js}
 * @see {@link ./font/font-bulk.js}
 */

/**
 * Collection of font operation functions for Figma.
 * @namespace fontOperations
 * @property {function} setFontName - Set the font family and style.
 * @property {function} setFontSize - Set the font size.
 * @property {function} setFontWeight - Set the font weight.
 * @property {function} setLetterSpacing - Set the letter spacing.
 * @property {function} setLineHeight - Set the line height.
 * @property {function} setParagraphSpacing - Set the paragraph spacing.
 * @property {function} loadFontAsyncWrapper - Load a font asynchronously.
 * @property {function} setBulkFont - Set font properties in bulk.
 */
import { setFontName, setFontSize, setFontWeight, setLetterSpacing, setLineHeight, setParagraphSpacing } from './font/font-set.js';
import { loadFontAsyncWrapper } from './font/font-load.js';
import { setBulkFont } from './font/font-bulk.js';

export const fontOperations = {
  setFontName,
  setFontSize,
  setFontWeight,
  setLetterSpacing,
  setLineHeight,
  setParagraphSpacing,
  loadFontAsyncWrapper,
  setBulkFont
};
