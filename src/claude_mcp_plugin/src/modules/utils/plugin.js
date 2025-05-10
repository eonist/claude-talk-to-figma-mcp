/**
 * Plugin utilities module.
 * Consolidates plugin configuration, state management, and progress reporting helpers.
 *
 * Exposed functions:
 * - state: { serverPort: number, autoReconnect: boolean }
 * - sendProgressUpdate(...)
 * - initializePlugin(): Promise<void>
 * - updateSettings(settings: { serverPort?: number, autoReconnect?: boolean }): void
 *
 * @module modules/utils/plugin
 */

export const state = {
  serverPort: 3055,
  autoReconnect: true,
};

/**
 * Sends a progress update message to the plugin UI.
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
 */
export async function initializePlugin() {
  try {
    const savedSettings = await figma.clientStorage.getAsync("settings");
    if (savedSettings) {
      if (savedSettings.serverPort) {
        state.serverPort = savedSettings.serverPort;
      }
      if (savedSettings.autoReconnect !== undefined) {
        state.autoReconnect = savedSettings.autoReconnect;
      }
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }
  // Notify the UI with the initial settings
  figma.ui.postMessage({
    type: "init-settings",
    settings: {
      serverPort: state.serverPort,
      autoReconnect: state.autoReconnect,
    },
  });
}

/**
 * Updates plugin settings and persists them to storage.
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
    state.serverPort = settings.serverPort;
  }
  if (settings.autoReconnect !== undefined) {
    state.autoReconnect = !!settings.autoReconnect;
  }
  figma.clientStorage
    .setAsync("settings", {
      serverPort: state.serverPort,
      autoReconnect: state.autoReconnect,
    })
    .catch(error => {
      console.error('Failed to persist settings:', error);
    });
}
