/**
 * Plugin utilities module.
 * Provides state management, configuration, and progress update functionality for the plugin.
 *
 * Exposed functions:
 * - state: { serverPort: number }
 * - sendProgressUpdate(commandId, commandType, status, progress, totalItems, processedItems, message, payload?): object
 * - initializePlugin(): Promise<void>
 * - updateSettings(settings): void
 *
 * @module plugin
 * @example
 * import { initializePlugin, updateSettings } from './utils/plugin.js';
 * await initializePlugin();
 * updateSettings({ serverPort: 4000 });
 */

/**
 * Plugin state management object.
 * Maintains core configuration settings that persist across plugin sessions.
 *
 * @property {number} serverPort - The port number for plugin's backend connection (default: 3055)
 */
export const state = {
  serverPort: 3055,
};

/**
 * Sends a progress update message to the plugin UI.
 *
 * This function constructs a detailed progress update object for tracking long-running
 * operations in the plugin. It handles both simple progress updates and chunked operations
 * where work is divided into multiple parts.
 *
 * @param {string} commandId - Unique identifier for the command execution.
 * @param {string} commandType - Type of command being executed.
 * @param {('started'|'in_progress'|'completed'|'error')} status - Current execution status.
 * @param {number} progress - Completion percentage (0-100).
 * @param {number} totalItems - Total number of items to process.
 * @param {number} processedItems - Number of items processed so far.
 * @param {string} message - Human-readable progress message.
 * @param {object} [payload] - Optional additional data.
 * @param {number} [payload.currentChunk] - Current chunk being processed.
 * @param {number} [payload.totalChunks] - Total number of chunks.
 * @param {number} [payload.chunkSize] - Size of each chunk.
 *
 * @returns {object} The progress update object with timestamp.
 * 
 * @throws {Error} If required parameters are missing or invalid.
 * 
 * @example
 * // Simple progress update
 * sendProgressUpdate(
 *   'cmd_123',
 *   'scan_text_nodes',
 *   'in_progress',
 *   50,
 *   100,
 *   50,
 *   'Processing text nodes...'
 * );
 * 
 * @example
 * // Progress update with chunked processing
 * sendProgressUpdate(
 *   'cmd_123',
 *   'export_images',
 *   'in_progress',
 *   33,
 *   300,
 *   100,
 *   'Exporting image batch 1/3',
 *   { currentChunk: 1, totalChunks: 3, chunkSize: 100 }
 * );
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
  // Validate required parameters
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
    timestamp: Date.now()
  };
  
  if (payload) {
    // Add chunk information if provided
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
 * Handles the plugin initialization process by:
 * 1. Loading saved settings from Figma client storage
 * 2. Updating plugin state with saved values
 * 3. Notifying UI of current settings
 * 
 * Error handling:
 * - If client storage access fails, logs error but continues with defaults
 * - If settings are corrupted, falls back to default values
 * - Always ensures UI receives valid settings, even if using defaults
 *
 * @returns {Promise<void>} Resolves when initialization is complete
 * 
 * @example
 * // Initialize plugin with error handling
 * try {
 *   await initializePlugin();
 *   console.log('Plugin initialized successfully');
 * } catch (error) {
 *   console.error('Plugin initialization failed:', error);
 *   // Plugin will still function with default settings
 * }
 */
export async function initializePlugin() {
  try {
    const savedSettings = await figma.clientStorage.getAsync("settings");
    if (savedSettings) {
      if (savedSettings.serverPort) {
        state.serverPort = savedSettings.serverPort;
      }
    }

    // Notify the UI with the initial settings
    figma.ui.postMessage({
      type: "init-settings",
      settings: {
        serverPort: state.serverPort,
      },
    });
  } catch (error) {
    console.error("Error loading settings:", error);
    // Ensure UI still gets default settings even if load fails
    figma.ui.postMessage({
      type: "init-settings",
      settings: {
        serverPort: state.serverPort,
      },
    });
  }
}

/**
 * Updates plugin settings and persists them to storage.
 * 
 * Updates both the in-memory state and persists settings to Figma's client storage.
 * Settings are validated before being applied to ensure plugin stability.
 *
 * @param {{ serverPort: number }} settings - New settings to apply
 * @throws {Error} If settings validation fails
 * 
 * @example
 * // Update server port with validation
 * try {
 *   updateSettings({ serverPort: 4000 });
 * } catch (error) {
 *   console.error('Failed to update settings:', error);
 *   // Previous settings remain unchanged
 * }
 */
export function updateSettings(settings) {
  // Validate settings before applying
  if (settings.serverPort && (
    typeof settings.serverPort !== 'number' ||
    settings.serverPort < 1 ||
    settings.serverPort > 65535
  )) {
    throw new Error('Invalid server port. Must be a number between 1 and 65535');
  }

  if (settings.serverPort) {
    state.serverPort = settings.serverPort;
  }

  // Persist the updated settings
  figma.clientStorage.setAsync("settings", {
    serverPort: state.serverPort,
  }).catch(error => {
    console.error('Failed to persist settings:', error);
    // State is still updated even if persistence fails
  });
}
