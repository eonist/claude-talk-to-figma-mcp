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

/**
 * Unified handler for SUBSCRIBE_EVENT plugin command.
 * @async
 * @function subscribeEventUnified
 * @param {object} params
 * @returns {Promise<any>}
 */
export async function subscribeEventUnified(params) {
  if (typeof sendCommand !== "function") throw new Error("sendCommand is not defined in this context.");
  // params: { eventType, filter, subscribe, subscriptionId? }
  return await sendCommand("subscribe_event", params);
}



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
  customBase64Encode,
  subscribeEventUnified
};
