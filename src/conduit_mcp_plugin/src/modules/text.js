/**
 * Text operations module.
 * Provides functions for creating, modifying, and scanning text nodes in Figma via MCP.
 *
 * Exposed functions:
 * - createText(params)
 * - createBoundedText(params)
 * - setTextContent(params)
 * - scanTextNodes(params)
 * - setMultipleTextContents(params)
 * - setTextCase(params)
 * - setTextDecoration(params)
 * - getStyledTextSegments(params)
 *
 * @module modules/text
 * @see {@link https://help.figma.com/hc/en-us/articles/360040451373-Text-in-Figma}
 * @example
 * import { textOperations } from './modules/text.js';
 * const result = await textOperations.createText({ x: 0, y: 0, text: 'Hello' });
 * console.log('Created text node ID:', result.id);
 */

import { createText, createBoundedText, createTexts } from './text/text-create.js';
import { setTextContent, setMultipleTextContents, setTextStyle } from './text/text-edit.js';
import { scanTextNodes, getStyledTextSegments } from './text/text-scan.js';
import { loadFontAsyncWrapper } from './font/font-load.js';

/**
 * Collection of text operation functions for Figma.
 * @namespace textOperations
 * @property {function} createText - Create a text node.
 * @property {function} createBoundedText - Create a bounded text node.
 * @property {function} createTexts - Create multiple text nodes.
 * @property {function} setTextContent - Set the content of a text node.
 * @property {function} scanTextNodes - Scan text nodes for analysis.
 * @property {function} setMultipleTextContents - Set multiple text node contents.
 * @property {function} setTextCase - Set the case of text.
 * @property {function} setTextDecoration - Set text decoration.
 * @property {function} getStyledTextSegments - Get styled text segments.
 * @example
 * const { setTextContent } = textOperations;
 * const updateResult = await setTextContent({ nodeId: '123', text: 'Goodbye' });
 */
/**
 * Unified handler for SET_TEXT plugin command.
 * Handles batch, bounded, and single text creation.
 * @async
 * @function createTextUnified
 * @param {object} params
 * @returns {Promise<any>}
 */
export async function createTextUnified(params) {
  // Batch support (including batch bounded text)
  if (params && Array.isArray(params.texts)) {
    const results = [];
    for (const textConfig of params.texts) {
      if (textConfig.width !== undefined || textConfig.height !== undefined) {
        console.log("[createTextUnified] Batch: using createBoundedText for", textConfig);
        results.push(await createBoundedText(textConfig));
      } else {
        console.log("[createTextUnified] Batch: using createText for", textConfig);
        results.push(await createText(textConfig));
      }
    }
    return results;
  }
  // Bounded text support (single) if width or height is present
  if (params && (params.width !== undefined || params.height !== undefined)) {
    console.log("[createTextUnified] Single: using createBoundedText for", params);
    return createBoundedText(params);
  }
  // Regular text (single)
  console.log("[createTextUnified] Single: using createText for", params);
  return createText(params);
}

export const textOperations = {
  createText,
  createBoundedText,
  createTexts,
  setTextContent,
  scanTextNodes,
  setMultipleTextContents,
  setTextStyle,
  getStyledTextSegments,
  createTextUnified,
  loadFontAsyncWrapper
};
