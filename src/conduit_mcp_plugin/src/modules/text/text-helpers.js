/**
 * Helper functions for text operations (progress updates, delays, etc.)
 */

/**
 * Sends a progress update message to the plugin UI.
 *
 * @function
 * @param {string} commandId - Unique command identifier.
 * @param {string} commandType - Type of command.
 * @param {string} status - Status string (e.g., "in_progress", "done").
 * @param {number} progress - Progress percentage (0-100).
 * @param {number} totalItems - Total number of items to process.
 * @param {number} processedItems - Number of items processed so far.
 * @param {string} message - Progress message.
 * @param {Object} [payload=null] - Optional additional payload (may include chunk info).
 * @returns {Object} The progress update object sent to the UI.
 */
export function sendProgressUpdate(commandId, commandType, status, progress, totalItems, processedItems, message, payload = null) {
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
 * Returns a promise that resolves after a specified delay.
 *
 * @function
 * @param {number} ms - The delay duration in milliseconds.
 * @returns {Promise<void>} Promise that resolves after the delay.
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
