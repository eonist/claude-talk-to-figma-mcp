/**
 * Font operations module.
 * Provides functions for manipulating font properties of text nodes in Figma via MCP.
 *
 * Exposed functions:
 * - setFontName(params)
 * - setFontSize(params)
 * - setFontWeight(params)
 * - setLetterSpacing(params)
 * - setLineHeight(params)
 * - setParagraphSpacing(params)
 * - loadFontAsyncWrapper(params)
 * - setBulkFont(params)
 *
 * @module modules/font
 * @example
 * import { fontOperations } from './modules/font.js';
 * const result = await fontOperations.setFontName({ nodeId, family: 'Inter', style: 'Bold' });
 * console.log('Updated font:', result.fontName);
 */

import { generateCommandId } from './utils.js';

/**
 * Returns a promise that resolves after a specified delay.
 *
 * @param {number} ms - The delay duration in milliseconds.
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sends a progress update message to the plugin UI.
 * @function sendProgressUpdate
 *
 * @param {string} commandId - Unique identifier for the command execution.
 * @param {string} commandType - Type of command (e.g., 'set_bulk_font').
 * @param {string} status - Current status ('started', 'in_progress', 'completed', 'error').
 * @param {number} progress - Completion percentage (0-100).
 * @param {number} totalItems - Total number of items to process.
 * @param {number} processedItems - Number of items processed so far.
 * @param {string} message - Descriptive progress message.
 * @param {object} [payload=null] - Optional additional data, including chunk info.
 *
 * @returns {object} Progress update object with timestamp.
 */
function sendProgressUpdate(commandId, commandType, status, progress, totalItems, processedItems, message, payload = null) {
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
 * Helper to map numeric font weight to Figma style string.
 * @param {number} weight
 * @returns {string}
 */
function getFontStyle(weight) {
  switch (weight) {
    case 100: return "Thin";
    case 200: return "Extra Light";
    case 300: return "Light";
    case 400: return "Regular";
    case 500: return "Medium";
    case 600: return "Semi Bold";
    case 700: return "Bold";
    case 800: return "Extra Bold";
    case 900: return "Black";
    default: return "Regular";
  }
}

/**
 * Update the font family and style of a text node.
 *
 * @param {object} params - Configuration for font update.
 * @param {string} params.nodeId - ID of the text node.
 * @param {string} params.family - New font family.
 * @param {string} [params.style="Regular"] - New font style.
 *
 * @returns {Promise<object>} Updated node information including font name.
 * @throws {Error} If the node is not found or not a text node.
 */
export async function setFontName(params) {
  const { nodeId, family, style = "Regular" } = params || {};

  if (!nodeId || !family) {
    throw new Error("Missing nodeId or font family");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }

  try {
    await figma.loadFontAsync({ family, style });
    node.fontName = { family, style };
    return {
      id: node.id,
      name: node.name,
      fontName: node.fontName
    };
  } catch (error) {
    throw new Error(`Error setting font name: ${error.message}`);
  }
}

/**
 * Update the font size of a text node.
 *
 * @param {object} params - Configuration for font size update.
 * @param {string} params.nodeId - ID of the text node.
 * @param {number} params.fontSize - New font size in pixels.
 *
 * @returns {Promise<object>} Updated node information including font size.
 * @throws {Error} If the node is not found or not a text node.
 */
export async function setFontSize(params) {
  const { nodeId, fontSize } = params || {};

  if (!nodeId || fontSize === undefined) {
    throw new Error("Missing nodeId or fontSize");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }

  try {
    await figma.loadFontAsync(node.fontName);
    node.fontSize = fontSize;
    return {
      id: node.id,
      name: node.name,
      fontSize: node.fontSize
    };
  } catch (error) {
    throw new Error(`Error setting font size: ${error.message}`);
  }
}

/**
 * Update the font weight of a text node.
 *
 * @param {object} params - Configuration for font weight update.
 * @param {string} params.nodeId - ID of the text node.
 * @param {number} params.weight - New font weight (100-900).
 *
 * @returns {Promise<object>} Updated node information including new weight.
 * @throws {Error} If the node is not found or not a text node.
 */
export async function setFontWeight(params) {
  const { nodeId, weight } = params || {};

  if (!nodeId || weight === undefined) {
    throw new Error("Missing nodeId or weight");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }

  try {
    const family = node.fontName.family;
    const style = getFontStyle(weight);
    await figma.loadFontAsync({ family, style });
    node.fontName = { family, style };
    return {
      id: node.id,
      name: node.name,
      fontName: node.fontName,
      weight: weight
    };
  } catch (error) {
    throw new Error(`Error setting font weight: ${error.message}`);
  }
}

/**
 * Update the letter spacing of a text node.
 *
 * @param {object} params - Configuration for letter spacing.
 * @param {string} params.nodeId - ID of the text node.
 * @param {number} params.letterSpacing - New letter spacing value.
 * @param {string} [params.unit="PIXELS"] - Unit for letter spacing ("PIXELS" or "PERCENT").
 *
 * @returns {Promise<object>} Updated node information with new letter spacing.
 * @throws {Error} If the node is not found or not a text node.
 */
export async function setLetterSpacing(params) {
  const { nodeId, letterSpacing, unit = "PIXELS" } = params || {};

  if (!nodeId || letterSpacing === undefined) {
    throw new Error("Missing nodeId or letterSpacing");
  }

  if (unit !== "PIXELS" && unit !== "PERCENT") {
    throw new Error("Invalid unit: must be 'PIXELS' or 'PERCENT'");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }

  try {
    await figma.loadFontAsync(node.fontName);
    node.letterSpacing = {
      value: letterSpacing,
      unit: unit
    };
    return {
      id: node.id,
      name: node.name,
      letterSpacing: node.letterSpacing
    };
  } catch (error) {
    throw new Error(`Error setting letter spacing: ${error.message}`);
  }
}

/**
 * Update the line height of a text node.
 *
 * @param {object} params - Configuration for line height update.
 * @param {string} params.nodeId - ID of the text node.
 * @param {number} params.lineHeight - New line height value.
 * @param {string} [params.unit="PIXELS"] - Unit for line height ("PIXELS", "PERCENT", or "AUTO").
 *
 * @returns {Promise<object>} Updated node information including line height.
 * @throws {Error} If the node is not found or not a text node.
 */
export async function setLineHeight(params) {
  const { nodeId, lineHeight, unit = "PIXELS" } = params || {};

  if (!nodeId || lineHeight === undefined) {
    throw new Error("Missing nodeId or lineHeight");
  }

  if (unit !== "PIXELS" && unit !== "PERCENT" && unit !== "AUTO") {
    throw new Error("Invalid unit: must be 'PIXELS', 'PERCENT', or 'AUTO'");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }

  try {
    await figma.loadFontAsync(node.fontName);
    if (unit === "AUTO") {
      node.lineHeight = { unit: "AUTO" };
    } else {
      node.lineHeight = {
        value: lineHeight,
        unit: unit
      };
    }
    return {
      id: node.id,
      name: node.name,
      lineHeight: node.lineHeight
    };
  } catch (error) {
    throw new Error(`Error setting line height: ${error.message}`);
  }
}

/**
 * Update the paragraph spacing of a text node.
 *
 * @param {object} params - Configuration for paragraph spacing.
 * @param {string} params.nodeId - ID of the text node.
 * @param {number} params.paragraphSpacing - New paragraph spacing in pixels.
 *
 * @returns {Promise<object>} Updated node information including paragraph spacing.
 * @throws {Error} If the node is not found or not a text node.
 */
export async function setParagraphSpacing(params) {
  const { nodeId, paragraphSpacing } = params || {};

  if (!nodeId || paragraphSpacing === undefined) {
    throw new Error("Missing nodeId or paragraphSpacing");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }

  try {
    await figma.loadFontAsync(node.fontName);
    node.paragraphSpacing = paragraphSpacing;
    return {
      id: node.id,
      name: node.name,
      paragraphSpacing: node.paragraphSpacing
    };
  } catch (error) {
    throw new Error(`Error setting paragraph spacing: ${error.message}`);
  }
}

/**
 * Load a font asynchronously.
 *
 * @param {object} params - Configuration for font loading.
 * @param {string} params.family - Font family to load.
 * @param {string} [params.style="Regular"] - Font style to load.
 *
 * @returns {Promise<object>} Details about the loaded font including family and style.
 * @throws {Error} If font loading fails.
 */
export async function loadFontAsyncWrapper(params) {
  const { family, style = "Regular" } = params || {};

  if (!family) {
    throw new Error("Missing font family");
  }

  try {
    await figma.loadFontAsync({ family, style });
    return {
      success: true,
      family: family,
      style: style,
      message: `Successfully loaded ${family} ${style}`
    };
  } catch (error) {
    throw new Error(`Error loading font: ${error.message}`);
  }
}

/**
 * Apply font settings to multiple text nodes at once
 *
 * @param {object} params - Configuration for bulk font update
 * @param {Array<{nodeIds?: string[], parentId?: string, inherit?: boolean, font: object}>} params.targets - Array of target configurations
 * @param {string} [params.commandId] - Optional command identifier for progress tracking
 * 
 * @returns {Promise<object>} Summary of the bulk update operation
 */
export async function setBulkFont(params) {
  const { targets, commandId = generateCommandId() } = params;

  if (!targets || !Array.isArray(targets)) {
    throw new Error("targets parameter must be an array");
  }

  const results = [];
  let totalSuccessCount = 0;
  let totalFailureCount = 0;
  let totalNodes = 0;

  sendProgressUpdate(commandId, 'set_bulk_font', 'started', 0, 0, 0, 
    `Starting bulk font update for multiple configurations`, { totalConfigs: targets.length });

  for (let targetIndex = 0; targetIndex < targets.length; targetIndex++) {
    const target = targets[targetIndex];
    let targetNodeIds = target.nodeIds || [];

    if (target.parentId) {
      const parent = await figma.getNodeByIdAsync(target.parentId);
      if (!parent) {
        results.push({
          success: false,
          error: `Parent node not found with ID: ${target.parentId}`,
          config: targetIndex
        });
        continue;
      }

      const inherit = target.inherit !== undefined ? target.inherit : true;

      if (inherit) {
        // If inherit is true (default), scan all descendants (existing behavior)
        // NOTE: This requires scanTextNodes to be available in the context.
        // If not, this block should be adapted to your project.
        if (typeof scanTextNodes === "function") {
          const scanResult = await scanTextNodes({ nodeId: target.parentId });
          targetNodeIds = scanResult.textNodes.map(node => node.id);
        } else {
          // Fallback: only direct children
          if ("children" in parent) {
            for (const child of parent.children) {
              if (child.type === "TEXT" && child.visible !== false) {
                targetNodeIds.push(child.id);
              }
            }
          }
        }
      } else {
        if ("children" in parent) {
          for (const child of parent.children) {
            if (child.type === "TEXT" && child.visible !== false) {
              targetNodeIds.push(child.id);
            }
          }
        }
      }
    }

    if (!targetNodeIds.length) {
      results.push({
        success: false,
        error: "No target nodes specified or found",
        config: targetIndex
      });
      continue;
    }

    let successCount = 0;
    let failureCount = 0;
    const configTotal = targetNodeIds.length;
    totalNodes += configTotal;

    const CHUNK_SIZE = 5;
    const chunks = [];
    for (let i = 0; i < targetNodeIds.length; i += CHUNK_SIZE) {
      chunks.push(targetNodeIds.slice(i, i + CHUNK_SIZE));
    }

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];
      const chunkPromises = chunk.map(async nodeId => {
        try {
          const node = await figma.getNodeByIdAsync(nodeId);
          if (!node || node.type !== "TEXT") {
            return { success: false, nodeId, error: "Not a valid text node" };
          }

          if (target.font.family || target.font.style) {
            const newFont = {
              family: target.font.family || node.fontName.family,
              style: target.font.style || node.fontName.style
            };
            await figma.loadFontAsync(newFont);
            node.fontName = newFont;
          }

          if (target.font.size) {
            node.fontSize = target.font.size;
          }

          if (target.font.weight) {
            const style = getFontStyle(target.font.weight);
            const newFont = {
              family: node.fontName.family,
              style: style
            };
            await figma.loadFontAsync(newFont);
            node.fontName = newFont;
          }

          return {
            success: true,
            nodeId,
            changes: {
              family: target.font.family,
              style: target.font.style,
              size: target.font.size,
              weight: target.font.weight
            }
          };

        } catch (error) {
          return { success: false, nodeId, error: error.message };
        }
      });

      const chunkResults = await Promise.all(chunkPromises);
      chunkResults.forEach(result => {
        if (result.success) {
          successCount++;
          totalSuccessCount++;
        } else {
          failureCount++;
          totalFailureCount++;
        }
        results.push({
          success: result.success,
          nodeId: result.nodeId,
          changes: result.changes,
          error: result.error,
          config: targetIndex
        });
      });

      sendProgressUpdate(commandId, 'set_bulk_font', 'in_progress',
        Math.round(((targetIndex * 100 + (chunkIndex + 1) / chunks.length * 100)) / targets.length),
        totalNodes,
        totalSuccessCount + totalFailureCount,
        `Processing configuration ${targetIndex + 1}/${targets.length}: ${successCount + failureCount} of ${configTotal} nodes`,
        { 
          totalSuccessCount,
          totalFailureCount,
          currentConfig: targetIndex + 1,
          totalConfigs: targets.length,
          currentChunk: chunkIndex + 1,
          totalChunks: chunks.length
        }
      );

      if (chunkIndex < chunks.length - 1) {
        await delay(100);
      }
    }
  }

  sendProgressUpdate(commandId, 'set_bulk_font', 'completed', 100,
    totalNodes, totalSuccessCount + totalFailureCount,
    `Completed bulk font update across ${targets.length} configurations: ${totalSuccessCount} successful, ${totalFailureCount} failed`,
    { totalSuccessCount, totalFailureCount, totalNodes }
  );

  return {
    success: totalSuccessCount > 0,
    totalNodes,
    successCount: totalSuccessCount,
    failureCount: totalFailureCount,
    results
  };
}

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
