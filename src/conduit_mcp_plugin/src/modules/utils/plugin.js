/**
 * Plugin utilities module.
 *
 * This module consolidates plugin configuration management, state tracking,
 * and progress reporting helpers for the Conduit MCP Figma plugin.
 *
 * It exposes the current plugin state, functions to send progress updates,
 * initialize plugin settings on load, and update settings with persistence.
 *
 * Exposed functions:
 * - state: { serverPort: number, autoReconnect: boolean }
 * - sendProgressUpdate(...)
 * - initializePlugin(): Promise<void>
 * - updateSettings(settings: { serverPort?: number, autoReconnect?: boolean }): void
 * - sendThemeToUI(): void
 *
 * @module modules/utils/plugin
 */

/**
 * Plugin state object for server port and auto-reconnect settings.
 * @type {{ serverPort: number, autoReconnect: boolean }}
 */
export const pluginCoreState = {
  serverPort: 3055,
  autoReconnect: true,
};

/**
 * Sends a progress update message to the plugin UI.
 *
 * This function constructs a progress update object with details about the
 * current command execution status and sends it to the UI via postMessage.
 *
 * @param {string} commandId - Unique identifier for the command.
 * @param {string} commandType - Type of command being executed.
 * @param {string} status - Current status ('started', 'in_progress', 'completed', 'error').
 * @param {number} progress - Progress percentage (0-100).
 * @param {number} totalItems - Total number of items to process.
 * @param {number} processedItems - Number of items processed so far.
 * @param {string} message - Descriptive message about the progress.
 * @param {object} [payload=null] - Optional additional data, including chunk info.
 *
 * @returns {object} The progress update object sent to the UI.
 */
export function sendProgressUpdate(
  commandId,
  commandType,
  status,
  progress,
  totalItems,
  processedItems,
  message,
  payload = null
) {
  if (!commandId || !commandType || !status) {
    throw new Error('Missing required parameters for progress update');
  }
  if (progress < 0 || progress > 100) {
    throw new Error('Progress must be between 0 and 100');
  }
  const update = {
    type: 'command_progress',
    commandId,
    commandType,
    status,
    progress,
    totalItems,
    processedItems,
    message,
    timestamp: Date.now(),
  };
  if (payload) {
    if (payload.currentChunk !== undefined && payload.totalChunks !== undefined) {
      update.currentChunk = payload.currentChunk;
      update.totalChunks = payload.totalChunks;
      update.chunkSize = payload.chunkSize;
    }
    update.payload = payload;
  }
  figma.ui.postMessage(update);
  console.log(`Progress update: ${status} - ${progress}% - ${message}`);
  return update;
}

/**
 * Initializes the plugin settings on load.
 *
 * Loads saved settings from client storage and updates the plugin state accordingly.
 * Then notifies the UI with the initial settings to synchronize the front end.
 *
 * @returns {Promise<void>}
 */
export async function initializePlugin() {
  try {
    const savedSettings = await figma.clientStorage.getAsync("settings");
    if (savedSettings) {
      if (savedSettings.serverPort) {
        pluginCoreState.serverPort = savedSettings.serverPort;
      }
      if (savedSettings.autoReconnect !== undefined) {
        pluginCoreState.autoReconnect = savedSettings.autoReconnect;
      }
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }
  // Notify the UI with the initial settings
  figma.ui.postMessage({
    type: "init-settings",
    settings: {
      serverPort: pluginCoreState.serverPort,
      autoReconnect: pluginCoreState.autoReconnect,
    },
  });
}

/**
 * Updates plugin settings and persists them to storage.
 *
 * Validates and updates the plugin state with new settings, then saves them
 * asynchronously to client storage. Logs errors if persistence fails.
 *
 * @param {object} settings - Settings object with optional serverPort and autoReconnect.
 * @returns {void}
 */
export function updateSettings(settings) {
  if (settings.serverPort !== undefined) {
    if (
      typeof settings.serverPort !== 'number' ||
      settings.serverPort < 1 ||
      settings.serverPort > 65535
    ) {
      throw new Error('Invalid server port. Must be a number between 1 and 65535');
    }
    pluginCoreState.serverPort = settings.serverPort;
  }
  if (settings.autoReconnect !== undefined) {
    pluginCoreState.autoReconnect = !!settings.autoReconnect;
  }
  figma.clientStorage
    .setAsync("settings", {
      serverPort: pluginCoreState.serverPort,
      autoReconnect: pluginCoreState.autoReconnect,
    })
    .catch(error => {
      console.error('Failed to persist settings:', error);
    });
}

// Theme detection now handled by Figma's themeColors feature
