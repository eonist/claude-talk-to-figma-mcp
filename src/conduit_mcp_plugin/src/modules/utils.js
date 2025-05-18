/**
 * Utils operations module.
 * Aggregates and re-exports all utility functions and state for the Conduit MCP Figma plugin.
 * Follows the same pattern as styles.js for consistency.
 *
 * Exposed functions:
 * - pluginCoreState
 * - sendProgressUpdate
 * - initializePlugin
 * - updateSettings
 * - delay
 * - generateCommandId
 * - uniqBy
 * - setCharacters
 * - canAcceptChildren
 * - customBase64Encode
 *
 * @module modules/utils
 */

import { pluginCoreState, sendProgressUpdate, initializePlugin, updateSettings } from "./utils/plugin.js";
import { delay, generateCommandId, uniqBy, setCharacters, canAcceptChildren } from "./utils/helpers.js";
import { customBase64Encode } from "./utils/encoding.js";

// Export all utilities individually
export {
  pluginCoreState,
  sendProgressUpdate,
  initializePlugin,
  updateSettings,
  delay,
  generateCommandId,
  uniqBy,
  setCharacters,
  canAcceptChildren,
  customBase64Encode
};

// Namespace object for all utils
export const utilsOperations = {
  pluginCoreState,
  sendProgressUpdate,
  initializePlugin,
  updateSettings,
  delay,
  generateCommandId,
  uniqBy,
  setCharacters,
  canAcceptChildren,
  customBase64Encode
};
