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
 * @example
 * import { textOperations } from './modules/text.js';
 * const result = await textOperations.createText({ x: 0, y: 0, text: 'Hello' });
 * console.log('Created text node ID:', result.id);
 */

import { createText, createBoundedText, createTexts } from './text/text-create.js';
import { setTextContent, setMultipleTextContents, setTextCase, setTextDecoration } from './text/text-edit.js';
import { scanTextNodes, getStyledTextSegments } from './text/text-scan.js';

/**
 * Named group of text operation functions for convenient importing.
 * @namespace textOperations
 * @example
 * const { setTextContent } = textOperations;
 * const updateResult = await setTextContent({ nodeId: '123', text: 'Goodbye' });
 */
export const textOperations = {
  createText,
  createBoundedText,
  createTexts,
  setTextContent,
  scanTextNodes,
  setMultipleTextContents,
  setTextCase,
  setTextDecoration,
  getStyledTextSegments
};
