// Plugin state and core functionality

/**
 * Plugin state.
 *
 * The state holds default configuration for the plugin. Currently it includes the default
 * server port that the plugin uses to communicate with its backend.
 */
export const state = {
  serverPort: 3055, // Default port for the plugin's backend connection
};

/**
 * Sends a progress update message to the plugin UI.
 *
 * This function constructs a detailed progress update object containing command information,
 * current progress status, counts of processed and total items, and an optional data payload.
 * It then sends this update to the plugin's UI via `figma.ui.postMessage` and logs the update
 * to the console. The returned object includes a timestamp indicating when the update was created.
 *
 * @param {string} commandId - Unique identifier for the command execution.
 * @param {string} commandType - Type of command (e.g., 'scan_text_nodes').
 * @param {string} status - Current status of the command ('started', 'in_progress', 'completed', 'error').
 * @param {number} progress - Completion percentage (range 0-100).
 * @param {number} totalItems - Total number of items to process.
 * @param {number} processedItems - Number of items processed so far.
 * @param {string} message - Descriptive message accompanying the update.
 * @param {object} [payload=null] - Optional extra data such as chunk information (e.g., currentChunk, totalChunks, chunkSize).
 *
 * @returns {object} The progress update object with a timestamp.
 *
 * @example
 * const update = sendProgressUpdate(
 *   "cmd123",
 *   "scan_text_nodes",
 *   "in_progress",
 *   50,
 *   100,
 *   50,
 *   "Halfway done scanning text nodes",
 *   { currentChunk: 1, totalChunks: 2, chunkSize: 50 }
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
  
  // Add any optional chunk information if provided in the payload.
  if (payload) {
    if (payload.currentChunk !== undefined && payload.totalChunks !== undefined) {
      update.currentChunk = payload.currentChunk;
      update.totalChunks = payload.totalChunks;
      update.chunkSize = payload.chunkSize;
    }
    update.payload = payload;
  }
  
  // Send the prepared update object to the plugin UI.
  figma.ui.postMessage(update);
  console.log(`Progress update: ${status} - ${progress}% - ${message}`);
  
  return update;
}

/**
 * Initializes the plugin settings on load.
 *
 * This function attempts to retrieve previously saved settings from the Figma client storage.
 * If settings are found (for instance, a saved server port), it updates the plugin state accordingly.
 * After updating the state, it sends an initialization message with the current settings to the UI.
 *
 * @returns {Promise<void>} Resolves when initialization is complete.
 *
 * @example
 * // Called when the plugin initializes.
 * await initializePlugin();
 */
export async function initializePlugin() {
  try {
    const savedSettings = await figma.clientStorage.getAsync("settings");
    if (savedSettings) {
      if (savedSettings.serverPort) {
        state.serverPort = savedSettings.serverPort;
      }
    }

    // Notify the UI with the initial settings.
    figma.ui.postMessage({
      type: "init-settings",
      settings: {
        serverPort: state.serverPort,
      },
    });
  } catch (error) {
    console.error("Error loading settings:", error);
  }
}

/**
 * Updates plugin settings by saving changes to state and persistent storage.
 *
 * This function updates the plugin's local state with new settings and persists these settings
 * using Figma's client storage system. Currently, the server port is the main setting handled.
 *
 * @param {{ serverPort: number }} settings - The settings object containing new configuration values.
 *
 * @example
 * updateSettings({ serverPort: 4000 });
 */
export function updateSettings(settings) {
  if (settings.serverPort) {
    state.serverPort = settings.serverPort;
  }

  // Persist the updated settings to client storage.
  figma.clientStorage.setAsync("settings", {
    serverPort: state.serverPort,
  });
}
