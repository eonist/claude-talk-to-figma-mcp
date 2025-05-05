// Figma Plugin - Auto-generated code from build.js

// ----- Utils Module -----
// ----- Utils/plugin.js -----
/**
 * Plugin utilities for state management and core functionality
 * @module plugin-utils
 */

/**
 * Plugin state management object.
 * Maintains core configuration settings that persist across plugin sessions.
 *
 * @property {number} serverPort - The port number for plugin's backend connection (default: 3055)
 */
const state = {
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
function sendProgressUpdate(
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
async function initializePlugin() {
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
function updateSettings(settings) {
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


// ----- Utils/encoding.js -----
/**
 * Custom base64 encoding function for binary data.
 * 
 * Provides a manual implementation of base64 encoding for Uint8Array data.
 * This is useful for image data and other binary content that needs to be 
 * serialized for transmission, particularly for Figma plugin communication.
 *
 * @param {Uint8Array} bytes - The binary data to encode.
 * @returns {string} A base64 encoded string representation of the data.
 */
function customBase64Encode(bytes) {
  // Base64 character set lookup table
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let base64 = "";

  // Calculate padding requirements
  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;  // Calculate how many bytes don't fit in complete 3-byte groups
  const mainLength = byteLength - byteRemainder;  // Length that fits in complete 3-byte groups

  let a, b, c, d;
  let chunk;

  // Process all complete 3-byte chunks
  for (let i = 0; i < mainLength; i = i + 3) {
    // Combine three bytes into a 24-bit number
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    // Extract four 6-bit segments from the 24-bit chunk using bitmasks
    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18 - First 6 bits
    b = (chunk & 258048) >> 12;   // 258048 = (2^6 - 1) << 12 - Second 6 bits
    c = (chunk & 4032) >> 6;      // 4032 = (2^6 - 1) << 6 - Third 6 bits
    d = chunk & 63;               // 63 = 2^6 - 1 - Last 6 bits

    // Map each 6-bit value to the corresponding base64 character
    base64 += chars[a] + chars[b] + chars[c] + chars[d];
  }

  // Handle remaining bytes that don't form a complete 3-byte group
  if (byteRemainder === 1) {
    // For 1 remaining byte, pad with two '=' characters
    chunk = bytes[mainLength];
    a = (chunk & 252) >> 2;      // 252 = (2^6 - 1) << 2
    b = (chunk & 3) << 4;        // 3 = 2^2 - 1, shift left for padding
    base64 += chars[a] + chars[b] + "==";
  } else if (byteRemainder === 2) {
    // For 2 remaining bytes, pad with one '=' character
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
    a = (chunk & 64512) >> 10;   // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4;     // 1008 = (2^6 - 1) << 4
    c = (chunk & 15) << 2;       // 15 = 2^4 - 1, shift left for padding
    base64 += chars[a] + chars[b] + chars[c] + "=";
  }

  return base64;
}


// ----- Utils/helpers.js -----
/**
 * Collection of helper utilities for the Figma plugin
 */

/**
 * Returns a promise that resolves after a specified delay.
 * Useful for rate limiting, animations, or waiting for operations to complete.
 *
 * @param {number} ms - The delay duration in milliseconds.
 * @returns {Promise<void>} A promise that resolves after the delay.
 * 
 * @example
 * // Wait for 1 second before continuing
 * await delay(1000);
 * 
 * @example
 * // Use in an animation loop
 * for (let i = 0; i < steps; i++) {
 *   updateProgress(i);
 *   await delay(100); // 100ms between updates
 * }
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a unique command ID string.
 * 
 * Creates a random, unique identifier prefixed with 'cmd_' that can be used
 * to track and correlate command execution across the plugin. The ID combines
 * two random base-36 strings to ensure uniqueness.
 * 
 * @returns {string} A unique command ID string.
 * 
 * @example
 * const cmdId = generateCommandId();
 * // Returns something like: "cmd_k7f9vx2y3n8m4p1q"
 */
function generateCommandId() {
  return 'cmd_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Filters an array to contain only unique values based on a property or predicate function.
 * Similar to lodash's uniqBy but with a lighter implementation.
 * 
 * @param {Array} arr - The array to filter.
 * @param {string|Function} predicate - Either a property name or a function that returns a value to check for uniqueness.
 * @returns {Array} A new array containing only unique items.
 * 
 * @example
 * // Using a property name
 * const users = [
 *   { id: 1, name: 'John' },
 *   { id: 1, name: 'John' },
 *   { id: 2, name: 'Jane' }
 * ];
 * const uniqueUsers = uniqBy(users, 'id');
 * // Returns: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
 * 
 * @example
 * // Using a function
 * const nodes = [
 *   { id: 'rect1', type: 'RECTANGLE' },
 *   { id: 'rect2', type: 'RECTANGLE' },
 *   { id: 'text1', type: 'TEXT' }
 * ];
 * const uniqueByType = uniqBy(nodes, node => node.type);
 * // Returns: [{ id: 'rect1', type: 'RECTANGLE' }, { id: 'text1', type: 'TEXT' }]
 */
function uniqBy(arr, predicate) {
  const cb = typeof predicate === "function" 
    ? predicate 
    : (o) => o[predicate];
    
  return [
    ...arr
      .reduce((map, item) => {
        const key = item === null || item === undefined ? item : cb(item);
        map.has(key) || map.set(key, item);
        return map;
      }, new Map())
      .values(),
  ];
}

/**
 * Helper to safely set characters on a text node with font loading.
 * 
 * This function handles the complexities of setting text content on Figma text nodes,
 * including proper font loading and fallback handling for mixed-font nodes.
 * 
 * @param {SceneNode} node - The Figma text node to modify.
 * @param {string} characters - The text content to set.
 * @param {object} [options] - Optional configuration.
 * @param {object} [options.fallbackFont] - Font to use as fallback if loading fails.
 * @param {string} [options.fallbackFont.family="Inter"] - Fallback font family.
 * @param {string} [options.fallbackFont.style="Regular"] - Fallback font style.
 * 
 * @returns {Promise<boolean>} True if characters were set successfully, false otherwise.
 * 
 * @example
 * // Basic usage
 * const success = await setCharacters(textNode, "Hello World");
 * 
 * @example
 * // With custom fallback font
 * const success = await setCharacters(textNode, "Hello World", {
 *   fallbackFont: {
 *     family: "Roboto",
 *     style: "Medium"
 *   }
 * });
 * 
 * @example
 * // Handling mixed fonts
 * const mixedFontNode = figma.createText();
 * // The function will automatically handle mixed font scenarios
 * const success = await setCharacters(mixedFontNode, "Mixed font text");
 */
async function setCharacters(node, characters, options) {
  const fallbackFont = (options && options.fallbackFont) || {
    family: "Inter",
    style: "Regular",
  };
  
  try {
    if (node.fontName === figma.mixed) {
      const firstCharFont = node.getRangeFontName(0, 1);
      await figma.loadFontAsync(firstCharFont);
      node.fontName = firstCharFont;
    } else {
      await figma.loadFontAsync({
        family: node.fontName.family,
        style: node.fontName.style,
      });
    }
  } catch (err) {
    console.warn(
      `Failed to load font and replaced with fallback "${fallbackFont.family} ${fallbackFont.style}"`,
      err
    );
    await figma.loadFontAsync(fallbackFont);
    node.fontName = fallbackFont;
  }
  
  try {
    node.characters = characters;
    return true;
  } catch (err) {
    console.warn(`Failed to set characters. Skipped.`, err);
    return false;
  }
}


// ----- document Module -----
// Document operations module
// This module provides functions for retrieving information about the Figma document,
// including page details, selection state, and node information.

/**
 * Safely converts a node ID to a string.
 * Guards against passing objects as node IDs, which would result in "[object Object]"
 * 
 * @param {any} nodeId - The node ID to convert to a string
 * @returns {string} The node ID as a string
 * @throws {Error} If the node ID is an object (not null) or undefined
 */
function ensureNodeIdIsString(nodeId) {
  if (nodeId === null || nodeId === undefined) {
    throw new Error("Node ID cannot be null or undefined");
  }
  
  // Check if nodeId is an object but not a string (strings are also objects in JS)
  if (typeof nodeId === 'object' && nodeId !== null) {
    throw new Error(`Invalid node ID: Received an object instead of a string ID. Use the node's 'id' property instead of passing the whole node object.`);
  }
  
  return String(nodeId);
}

/**
 * Retrieves detailed information about the current Figma page and its contents.
 * 
 * @returns {Promise<{
 *   name: string,
 *   id: string,
 *   type: string,
 *   children: Array<{
 *     id: string,
 *     name: string,
 *     type: string
 *   }>,
 *   currentPage: {
 *     id: string,
 *     name: string,
 *     childCount: number
 *   },
 *   pages: Array<{
 *     id: string,
 *     name: string,
 *     childCount: number
 *   }>
 * }>} Object containing:
 *   - name: The page's name
 *   - id: The page's unique identifier
 *   - type: Always "PAGE"
 *   - children: Array of all top-level nodes on the page
 *   - currentPage: Detailed information about the current page
 *   - pages: Array containing the current page's information
 * 
 * @example
 * const info = await getDocumentInfo();
 * console.log(`Current page "${info.name}" has ${info.currentPage.childCount} children`);
 */
async function getDocumentInfo() {
  const page = figma.currentPage;
  return {
    name: page.name,
    id: page.id,
    type: "PAGE",
    children: page.children.map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type || "UNKNOWN",
    })),
    currentPage: {
      id: page.id,
      name: page.name,
      childCount: page.children.length,
    },
    pages: [
      {
        id: page.id,
        name: page.name,
        childCount: page.children.length,
      },
    ],
  };
}

/**
 * Retrieves information about the currently selected nodes on the active Figma page.
 * If no nodes are selected, returns an empty selection array.
 *
 * @returns {Promise<{
 *   selectionCount: number,
 *   selection: Array<{
 *     id: string,
 *     name: string,
 *     type: string,
 *     visible: boolean
 *   }>
 * }>} Object containing:
 *   - selectionCount: Number of selected nodes
 *   - selection: Array of selected nodes with their properties
 *
 * @example
 * const selection = await getSelection();
 * if (selection.selectionCount > 0) {
 *   console.log(`Selected ${selection.selectionCount} nodes`);
 * } else {
 *   console.log('Nothing is selected');
 * }
 */
async function getSelection() {
  // Getting the selection from figma.currentPage.selection if available
  const selection = figma.currentPage.selection || [];
  return {
    selectionCount: selection.length,
    selection: selection.map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type || "UNKNOWN",
      visible: node.visible,
    })),
  };
}

/**
 * Retrieves detailed information about a specific node in the Figma document.
 * Attempts to the node in JSON_REST_V1 format, falling back to basic
 * properties if is not supported for the node type.
 *
 * @param {string|Object} nodeIdOrParams - The unique identifier of the node to retrieve,
 *   an object containing an id property, or an MCP params object with nodeId property
 * @returns {Promise<Object>} The node's exported document data or basic properties:
 *   - If succeeds: Complete node data in JSON_REST_V1 format
 *   - If fails: Basic node properties (id, name, type)
 *
 * @throws {Error} If the node with the specified ID cannot be found
 *
 * @example
 * try {
 *   const nodeData = await getNodeInfo("123:456");
 *   console.log(`Retrieved data for node "${nodeData.name}"`);
 * } catch (error) {
 *   console.error('Node not found:', error.message);
 * }
 */
async function getNodeInfo(nodeIdOrParams) {
  let id;
  
  // Handle both direct nodeId strings and MCP parameter objects
  if (typeof nodeIdOrParams === 'object' && nodeIdOrParams !== null) {
    // If this is the params object from MCP with nodeId property
    if (nodeIdOrParams.nodeId !== undefined) {
      id = ensureNodeIdIsString(nodeIdOrParams.nodeId);
    }
    // Otherwise if it's an object with id property (for backward compatibility)
    else if (nodeIdOrParams.id !== undefined) {
      id = ensureNodeIdIsString(nodeIdOrParams.id);
    }
    else {
      throw new Error("Invalid node ID: Received an object without nodeId or id property");
    }
  } else {
    // If it's already a string or primitive
    id = ensureNodeIdIsString(nodeIdOrParams);
  }

  console.log('Getting node info for ID:', id);
  const node = await figma.getNodeByIdAsync(id);

  if (!node) {
    throw new Error(`Node not found with ID: ${id}`);
  }

  try {
    const response = await node.exportAsync({
      format: "JSON_REST_V1",
    });

    return response.document;
  } catch (error) {
    // If the exportAsync method doesn't work as expected, return basic node info
    return {
      id: node.id,
      name: node.name,
      type: node.type || "UNKNOWN"
    };
  }
}

/**
 * Retrieves information for multiple nodes simultaneously using parallel processing.
 * Nodes that cannot be found are automatically filtered out of the results.
 *
 * @param {Array<string|Object>|Object} nodeIdsOrParams - Array of node IDs or objects containing id properties,
 *   or an MCP params object with nodeIds property
 * @returns {Promise<Array<{
 *   nodeId: string,
 *   document: Object
 * }>>} Array of objects, each containing:
 *   - nodeId: The ID of the processed node
 *   - document: Either the full JSON_REST_V1 data or basic node properties
 *     if is not supported
 *
 * @throws {Error} If a critical error occurs during the batch processing
 *
 * @example
 * try {
 *   const nodesInfo = await getNodesInfo(["123:456", "789:012"]);
 *   console.log(`Successfully processed ${nodesInfo.length} nodes`);
 * } catch (error) {
 *   console.error('Failed to process nodes:', error.message);
 * }
 */
async function getNodesInfo(nodeIdsOrParams) {
  try {
    let idsToProcess;
    
    // Handle both direct nodeIds array and MCP parameter objects
    if (typeof nodeIdsOrParams === 'object' && nodeIdsOrParams !== null && !Array.isArray(nodeIdsOrParams)) {
      // If this is the params object from MCP with nodeIds property
      if (nodeIdsOrParams.nodeIds !== undefined) {
        idsToProcess = nodeIdsOrParams.nodeIds;
      } else {
        throw new Error("Invalid parameter: Expected an array of node IDs or an object with a nodeIds property");
      }
    } else {
      // If it's already an array
      idsToProcess = nodeIdsOrParams;
    }
    
    if (!Array.isArray(idsToProcess)) {
      throw new Error(`Expected an array of node IDs, but got: ${typeof idsToProcess}`);
    }

    // Use the ensureNodeIdIsString function for each ID in the array
    const processedIds = idsToProcess.map(id => ensureNodeIdIsString(id));
    
    console.log('Getting info for nodes:', processedIds);
    
    // Load all nodes in parallel
    const nodes = await Promise.all(
      processedIds.map((id) => figma.getNodeByIdAsync(id))
    );

    // Filter out any null values (nodes that weren't found)
    const validNodes = nodes.filter((node) => node !== null);

    // Export all valid nodes in parallel
    const responses = await Promise.all(
      validNodes.map(async (node) => {
        try {
          const response = await node.exportAsync({
            format: "JSON_REST_V1",
          });
          
          return {
            nodeId: node.id,
            document: response.document,
          };
        } catch (error) {
          // If the fails, return basic info
          return {
            nodeId: node.id,
            document: {
              id: node.id,
              name: node.name,
              type: node.type || "UNKNOWN"
            }
          };
        }
      })
    );

    return responses;
  } catch (error) {
    throw new Error(`Error getting nodes info: ${error.message}`);
  }
}

// Export all document operations as a named group for convenient importing
const documentOperations = {
  getDocumentInfo,
  getSelection,
  getNodeInfo,
  getNodesInfo,
  ensureNodeIdIsString
};


// ----- shapes Module -----
// Shapes module
// This module provides helper functions for creating and manipulating various shape nodes in a Figma document.
// It includes functions for creating rectangles, frames, ellipses, polygons, stars, vectors, and lines,
// as well as utilities for modifying node properties such as fills, strokes, resizing, and cloning.


/**
 * Creates a new rectangle node in the Figma document.
 *
 * The function instantiates a rectangle with the specified position, dimensions, and name.
 * Optionally, if a parentId is provided, the rectangle is appended as a child of that node;
 * otherwise, it is added to the current page.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - The X coordinate where the rectangle will be placed.
 * @param {number} [params.y=0] - The Y coordinate where the rectangle will be placed.
 * @param {number} [params.width=100] - The width of the rectangle.
 * @param {number} [params.height=100] - The height of the rectangle.
 * @param {string} [params.name="Rectangle"] - The display name for the rectangle.
 * @param {string} [params.parentId] - The ID of the node to which the rectangle should be appended.
 * @param {object} [params.fillColor] - The fill color given as an object {r, g, b, a}.
 * @param {object} [params.strokeColor] - The stroke color given as an object {r, g, b, a}.
 * @param {number} [params.strokeWeight] - The width of the stroke outline.
 *
 * @returns {object} An object containing details of the created rectangle, including its id, name, position, dimensions, and parent id (if applicable).
 *
 * @throws Will throw an error if the specified parent node cannot be found or does not support children.
 */
async function createRectangle(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    name = "Rectangle",
    parentId,
    fillColor,
    strokeColor,
    strokeWeight,
  } = params || {};

  const rect = figma.createRectangle();
  rect.x = x;
  rect.y = y;
  rect.resize(width, height);
  rect.name = name;

  // Apply fill color if provided.
  if (fillColor) {
    setFill(rect, fillColor);
  }

  // Apply stroke properties if provided.
  if (strokeColor) {
    setStroke(rect, strokeColor, strokeWeight);
  }

  // Add the rectangle to a specified parent or to the current page.
  if (parentId) {
    const parentNode = await figma.getNodeByIdAsync(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(rect);
  } else {
    figma.currentPage.appendChild(rect);
  }

  return {
    id: rect.id,
    name: rect.name,
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    parentId: rect.parent ? rect.parent.id : undefined,
  };
}

/**
 * Creates a new frame node in the Figma document.
 *
 * A frame is a container that can include other nodes. This function creates a frame with
 * specified position, dimensions, and optional visual styles. If a parentId is provided,
 * the frame is added as a child of the specified node; otherwise, it is added to the current page.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - The X coordinate of the frame.
 * @param {number} [params.y=0] - The Y coordinate of the frame.
 * @param {number} [params.width=100] - The frame's width.
 * @param {number} [params.height=100] - The frame's height.
 * @param {string} [params.name="Frame"] - The name assigned to the frame.
 * @param {string} [params.parentId] - The ID of the parent node that will contain the frame.
 * @param {object} [params.fillColor] - Optional fill color in the form {r, g, b, a}.
 * @param {object} [params.strokeColor] - Optional stroke color in the form {r, g, b, a}.
 * @param {number} [params.strokeWeight] - Optional stroke width.
 *
 * @returns {object} An object containing the created frame's details.
 */
async function createFrame(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    name = "Frame",
    parentId,
    fillColor,
    strokeColor,
    strokeWeight,
  } = params || {};

  const frame = figma.createFrame();
  frame.x = x;
  frame.y = y;
  frame.resize(width, height);
  frame.name = name;

  // Apply fill color if provided.
  if (fillColor) {
    setFill(frame, fillColor);
  }

  // Apply stroke properties if provided.
  if (strokeColor) {
    setStroke(frame, strokeColor, strokeWeight);
  }

  // Add the frame to a specific parent or to the current page.
  if (parentId) {
    const parentNode = await figma.getNodeByIdAsync(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(frame);
  } else {
    figma.currentPage.appendChild(frame);
  }

  return {
    id: frame.id,
    name: frame.name,
    x: frame.x,
    y: frame.y,
    width: frame.width,
    height: frame.height,
    fills: frame.fills,
    strokes: frame.strokes,
    strokeWeight: frame.strokeWeight,
    parentId: frame.parent ? frame.parent.id : undefined,
  };
}

/**
 * Creates a new ellipse node.
 *
 * This function creates an ellipse with the given position, size, and name.
 * Optional fill and stroke properties can be applied.
 * If a parentId is provided, the ellipse will be appended to that node.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - X coordinate for the ellipse.
 * @param {number} [params.y=0] - Y coordinate for the ellipse.
 * @param {number} [params.width=100] - Ellipse width.
 * @param {number} [params.height=100] - Ellipse height.
 * @param {string} [params.name="Ellipse"] - The ellipse's name.
 * @param {string} [params.parentId] - ID of the parent node.
 * @param {object} [params.fillColor] - Fill color as {r, g, b, a}.
 * @param {object} [params.strokeColor] - Stroke color as {r, g, b, a}.
 * @param {number} [params.strokeWeight] - Stroke width.
 *
 * @returns {object} An object with the ellipse node's details.
 */
async function createFrames(params) {
  const { frames = [] } = params || {};
  const created = [];
  for (const cfg of frames) {
    // Reuse createFrame helper for each configuration
    const frameNode = await createFrame(cfg);
    created.push(frameNode.id);
  }
  return { ids: created };
}

async function createEllipse(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    name = "Ellipse",
    parentId,
    fillColor,
    strokeColor,
    strokeWeight
  } = params || {};

  // Create and configure the ellipse.
  const ellipse = figma.createEllipse();
  ellipse.name = name;
  ellipse.x = x;
  ellipse.y = y;
  ellipse.resize(width, height);

  // Apply fill color if provided.
  if (fillColor) {
    setFill(ellipse, fillColor);
  }
  
  // Apply stroke properties if provided.
  if (strokeColor) {
    setStroke(ellipse, strokeColor, strokeWeight);
  }

  // Attach the ellipse to a parent node or the current page.
  if (parentId) {
    const parentNode = await figma.getNodeByIdAsync(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(ellipse);
  } else {
    figma.currentPage.appendChild(ellipse);
  }
  
  return {
    id: ellipse.id,
    name: ellipse.name,
    type: ellipse.type,
    x: ellipse.x,
    y: ellipse.y,
    width: ellipse.width,
    height: ellipse.height,
    parentId: ellipse.parent ? ellipse.parent.id : undefined
  };
}

/**
 * Creates a new polygon node.
 *
 * A polygon is created with the specified position and size along with a configurable number of sides (minimum 3).
 * Optional fill and stroke settings can be applied.
 * The polygon is appended to a parent node if a valid parentId is specified.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - X coordinate for the polygon.
 * @param {number} [params.y=0] - Y coordinate for the polygon.
 * @param {number} [params.width=100] - Polygon width.
 * @param {number} [params.height=100] - Polygon height.
 * @param {number} [params.sides=6] - Number of sides (must be at least 3).
 * @param {string} [params.name="Polygon"] - The name for the polygon.
 * @param {string} [params.parentId] - ID of the parent node.
 * @param {object} [params.fillColor] - Fill color as {r, g, b, a}.
 * @param {object} [params.strokeColor] - Stroke color as {r, g, b, a}.
 * @param {number} [params.strokeWeight] - Stroke width.
 *
 * @returns {object} An object containing details about the polygon.
 */
async function createPolygon(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    sides = 6,
    name = "Polygon",
    parentId,
    fillColor,
    strokeColor,
    strokeWeight
  } = params || {};

  // Create and configure the polygon.
  const polygon = figma.createPolygon();
  polygon.x = x;
  polygon.y = y;
  polygon.resize(width, height);
  polygon.name = name;
  
  // Set number of sides if valid.
  if (sides >= 3) {
    polygon.pointCount = sides;
  }

  // Apply fill color if provided.
  if (fillColor) {
    setFill(polygon, fillColor);
  }

  // Apply stroke properties if provided.
  if (strokeColor) {
    setStroke(polygon, strokeColor, strokeWeight);
  }

  // Append the polygon to a parent node or current page.
  if (parentId) {
    const parentNode = await figma.getNodeByIdAsync(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(polygon);
  } else {
    figma.currentPage.appendChild(polygon);
  }

  return {
    id: polygon.id,
    name: polygon.name,
    type: polygon.type,
    x: polygon.x,
    y: polygon.y,
    width: polygon.width,
    height: polygon.height,
    pointCount: polygon.pointCount,
    parentId: polygon.parent ? polygon.parent.id : undefined
  };
}

/**
 * Creates a new star node.
 *
 * A star is generated with a configurable number of points and an inner radius ratio (relative to its outer radius).
 * The star’s position, dimensions, and optional visual styles can be specified.
 * It is appended to a parent node if a valid parentId is given.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - X coordinate for the star.
 * @param {number} [params.y=0] - Y coordinate for the star.
 * @param {number} [params.width=100] - Star width.
 * @param {number} [params.height=100] - Star height.
 * @param {number} [params.points=5] - Number of points on the star (minimum 3).
 * @param {number} [params.innerRadius=0.5] - Inner radius ratio (between 0.01 and 0.99).
 * @param {string} [params.name="Star"] - Name for the star.
 * @param {string} [params.parentId] - ID of the parent node.
 * @param {object} [params.fillColor] - Fill color as {r, g, b, a}.
 * @param {object} [params.strokeColor] - Stroke color as {r, g, b, a}.
 * @param {number} [params.strokeWeight] - Stroke width.
 *
 * @returns {object} An object with details of the created star.
 */
async function createStar(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    points = 5,
    innerRadius = 0.5,
    name = "Star",
    parentId,
    fillColor,
    strokeColor,
    strokeWeight
  } = params || {};

  // Create and configure the star.
  const star = figma.createStar();
  star.x = x;
  star.y = y;
  star.resize(width, height);
  star.name = name;
  
  // Set the number of points if valid.
  if (points >= 3) {
    star.pointCount = points;
  }

  // Set inner radius ratio if within valid range.
  if (innerRadius > 0 && innerRadius < 1) {
    star.innerRadius = innerRadius;
  }

  // Apply fill color if provided.
  if (fillColor) {
    setFill(star, fillColor);
  }

  // Apply stroke properties if provided.
  if (strokeColor) {
    setStroke(star, strokeColor, strokeWeight);
  }

  // Append the star to a parent node or current page.
  if (parentId) {
    const parentNode = await figma.getNodeByIdAsync(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(star);
  } else {
    figma.currentPage.appendChild(star);
  }

  return {
    id: star.id,
    name: star.name,
    type: star.type,
    x: star.x,
    y: star.y,
    width: star.width,
    height: star.height,
    pointCount: star.pointCount,
    innerRadius: star.innerRadius,
    parentId: star.parent ? star.parent.id : undefined
  };
}

/**
 * Creates a new vector node.
 *
 * A vector node is rendered using SVG-like vector path data. This function creates a vector with
 * specified dimensions, position, and an optional set of vector paths. Visual properties are optionally applied.
 * If a parentId is provided, the vector is appended to that node; otherwise, it is added to the current page.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - X coordinate for the vector.
 * @param {number} [params.y=0] - Y coordinate for the vector.
 * @param {number} [params.width=100] - Vector width.
 * @param {number} [params.height=100] - Vector height.
 * @param {string} [params.name="Vector"] - Name for the vector.
 * @param {string} [params.parentId] - ID of the parent node.
 * @param {Array} [params.vectorPaths] - Array of vector path definitions.
 * @param {object} [params.fillColor] - Fill color as {r, g, b, a}.
 * @param {object} [params.strokeColor] - Stroke color as {r, g, b, a}.
 * @param {number} [params.strokeWeight] - Stroke width.
 *
 * @returns {object} An object with details regarding the vector node.
 */
async function createVector(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    name = "Vector",
    parentId,
    vectorPaths = [],
    fillColor,
    strokeColor,
    strokeWeight
  } = params || {};

  // Create and configure the vector node.
  const vector = figma.createVector();
  vector.x = x;
  vector.y = y;
  vector.resize(width, height);
  vector.name = name;

  // Process and assign vector path definitions if provided.
  if (vectorPaths && vectorPaths.length > 0) {
    vector.vectorPaths = vectorPaths.map(path => {
      return {
        windingRule: path.windingRule || "EVENODD",
        data: path.data || ""
      };
    });
  }

  // Apply fill color if provided.
  if (fillColor) {
    setFill(vector, fillColor);
  }

  // Apply stroke properties if provided.
  if (strokeColor) {
    setStroke(vector, strokeColor, strokeWeight);
  }

  // Attach the vector to a specified parent or the current page.
  if (parentId) {
    const parentNode = await figma.getNodeByIdAsync(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(vector);
  } else {
    figma.currentPage.appendChild(vector);
  }

  return {
    id: vector.id,
    name: vector.name,
    type: vector.type,
    x: vector.x,
    y: vector.y,
    width: vector.width,
    height: vector.height,
    vectorPaths: vector.vectorPaths,
    parentId: vector.parent ? vector.parent.id : undefined
  };
}

/**
 * Creates a new line by generating a vector node representing a straight line.
 *
 * The function computes the dimensions of the line based on its starting and ending coordinates.
 * It generates SVG path data for the line and applies stroke properties.
 * The line is attached to a parent node if a valid parentId is specified.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x1=0] - The starting X coordinate.
 * @param {number} [params.y1=0] - The starting Y coordinate.
 * @param {number} [params.x2=100] - The ending X coordinate.
 * @param {number} [params.y2=0] - The ending Y coordinate.
 * @param {string} [params.name="Line"] - The name assigned to the line.
 * @param {string} [params.parentId] - The ID of the parent node.
 * @param {object} [params.strokeColor={r: 0, g: 0, b: 0, a: 1}] - Stroke color as {r, g, b, a}.
 * @param {number} [params.strokeWeight=1] - Stroke width.
 * @param {string} [params.strokeCap="NONE"] - Stroke cap style. Options: "NONE", "ROUND", "SQUARE", "ARROW_LINES", or "ARROW_EQUILATERAL".
 *
 * @returns {object} An object containing details of the created line.
 */
async function createLine(params) {
  const {
    x1 = 0,
    y1 = 0,
    x2 = 100,
    y2 = 0,
    name = "Line",
    parentId,
    strokeColor = { r: 0, g: 0, b: 0, a: 1 },
    strokeWeight = 1,
    strokeCap = "NONE"
  } = params || {};

  // Create a vector node to represent the line.
  const line = figma.createVector();
  line.name = name;
  
  // Position node at the starting coordinates.
  line.x = x1;
  line.y = y1;
  
  // Determine the dimensions of the vector based on the endpoints.
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  line.resize(width > 0 ? width : 1, height > 0 ? height : 1);
  
  // Calculate relative coordinates for the SVG path data in the vector's local system.
  const dx = x2 - x1;
  const dy = y2 - y1;
  const endX = dx > 0 ? width : 0;
  const endY = dy > 0 ? height : 0;
  const startX = dx > 0 ? 0 : width;
  const startY = dy > 0 ? 0 : height;
  
  // Generate SVG path data for a straight line.
  const pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
  line.vectorPaths = [{
    windingRule: "NONZERO",
    data: pathData
  }];
  
  // Apply stroke properties.
  setStroke(line, strokeColor, strokeWeight);
  
  // Set stroke cap style if it is one of the supported options.
  if (["NONE", "ROUND", "SQUARE", "ARROW_LINES", "ARROW_EQUILATERAL"].includes(strokeCap)) {
    line.strokeCap = strokeCap;
  }
  
  // Remove fill for the line.
  line.fills = [];
  
  // Append the line to a parent node or the current page.
  if (parentId) {
    const parentNode = await figma.getNodeByIdAsync(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(line);
  } else {
    figma.currentPage.appendChild(line);
  }
  
  return {
    id: line.id,
    name: line.name,
    type: line.type,
    x: line.x,
    y: line.y,
    width: line.width,
    height: line.height,
    strokeWeight: line.strokeWeight,
    strokeCap: line.strokeCap,
    vectorPaths: line.vectorPaths,
    parentId: line.parent ? line.parent.id : undefined
  };
}

/**
 * Sets the corner radius of a node.
 *
 * This helper function is intended to update the corner radius of a specified node.
 *
 * @param {object} params - Parameters for updating the corner radius.
 * @param {string} params.nodeId - The ID of the node to modify.
 * @param {number} params.radius - The corner radius value.
 * @param {boolean[]} [params.corners] - Optional boolean array specifying which corners to round: [topLeft, topRight, bottomRight, bottomLeft].
 *
 * @returns {object} An object with the node's id and updated corner radius.
 */
async function setCornerRadius(params) {
  return { id: params.nodeId, cornerRadius: params.radius };
}

/**
 * Resizes a node to the specified dimensions.
 *
 * @param {object} params - Resize parameters.
 * @param {string} params.nodeId - The ID of the node to resize.
 * @param {number} params.width - The new width value.
 * @param {number} params.height - The new height value.
 *
 * @returns {object} An object with the node's id and its updated dimensions.
 */
async function resizeNode(params) {
  return { id: params.nodeId, width: params.width, height: params.height };
}

/**
 * Deletes a specified node from the Figma document.
 *
 * @param {object} params - Deletion parameters.
 * @param {string} params.nodeId - The ID of the node to delete.
 *
 * @returns {object} An object indicating the node's id and that it has been deleted.
 */
async function deleteNode(params) {
  return { id: params.nodeId, deleted: true };
}

async function deleteNodes(params) {
  const { nodeIds = [] } = params;
  const success = [];
  const failed = [];
  for (const id of nodeIds) {
    try {
      const node = await figma.getNodeByIdAsync(id);
      if (node && typeof node.remove === "function") {
        node.remove();
        success.push(id);
      } else {
        failed.push(id);
      }
    } catch (error) {
      failed.push(id);
    }
  }
  return { success, failed };
}

/**
 * Moves a node to a new position.
 *
 * @param {object} params - Movement parameters.
 * @param {string} params.nodeId - The ID of the node to move.
 * @param {number} params.x - The new X coordinate.
 * @param {number} params.y - The new Y coordinate.
 *
 * @returns {object} An object with the node's id and its updated coordinates.
 */
async function moveNode(params) {
  return { id: params.nodeId, x: params.x, y: params.y };
}

 /**
  * Moves multiple nodes to a new absolute position in Figma.
  *
  * @param {object} params - Movement parameters.
  * @param {string[]} params.nodeIds - Array of node IDs to move.
  * @param {number} params.x - The new X coordinate for all nodes.
  * @param {number} params.y - The new Y coordinate for all nodes.
  *
  * @returns {object} An object indicating how many nodes were moved.
  */
async function moveNodes(params) {
  const { nodeIds = [], x, y } = params || {};
  const nodes = nodeIds
    .map(id => figma.getNodeById(id))
    .filter(node => node != null);
  for (const node of nodes) {
    node.x = x;
    node.y = y;
  }
  return { count: nodes.length };
}

/**
 * Clones an existing node.
 *
 * This function simulates cloning a node by returning a new id.
 * Optionally, new coordinates can be provided for the cloned node.
 *
 * @param {object} params - Parameters for cloning.
 * @param {string} params.nodeId - The ID of the node to clone.
 * @param {number} [params.x] - Optional new X coordinate for the clone.
 * @param {number} [params.y] - Optional new Y coordinate for the clone.
 *
 * @returns {object} An object containing the new clone's id and a reference to the original node's id.
 */
async function cloneNode(params) {
  return { id: "cloned-" + params.nodeId, original: params.nodeId };
}

/**
 * Clones multiple nodes in Figma.
 *
 * @param {object} params - Clone parameters.
 * @param {string[]} params.nodeIds - Array of node IDs to clone.
 * @param {{x:number,y:number}[]} [params.positions] - Optional explicit positions.
 * @param {number} [params.offsetX] - Uniform X offset.
 * @param {number} [params.offsetY] - Uniform Y offset.
 * @returns {object} An object containing array of cloned IDs.
 */
async function cloneNodes(params) {
  const { nodeIds = [], positions, offsetX = 0, offsetY = 0 } = params || {};
  const clonedIds = [];
  for (let i = 0; i < nodeIds.length; i++) {
    const id = nodeIds[i];
    let x, y;
    if (positions && positions[i]) {
      x = positions[i].x;
      y = positions[i].y;
    } else {
      x = offsetX * (i + 1);
      y = offsetY * (i + 1);
    }
    const result = await cloneNode({ nodeId: id, x, y });
    clonedIds.push(result.id);
  }
  return { clonedIds };
}

/**
 * Flattens a vector-based node.
 *
 * This function simulates the flattening of a vector node into a simpler shape.
 *
 * @param {object} params - Parameters for flattening.
 * @param {string} params.nodeId - The ID of the node to flatten.
 *
 * @returns {object} An object with the node's id and a flag indicating it has been flattened.
 */
async function flattenNode(params) {
  return { id: params.nodeId, flattened: true };
}

async function createLines(params) {
  const { lines = [] } = params || {};
  const ids = [];
  for (const cfg of lines) {
    try {
      const result = await createLine(cfg);
      ids.push(result.id);
    } catch (error) {
      // continue on error
    }
  }
  return { ids };
}

// Helper functions

/**
 * Applies a solid fill color to a node.
 *
 * @param {object} node - The node to update.
 * @param {object} color - The fill color as {r, g, b, a}.
 * @private
 */
function setFill(node, color) {
  const paintStyle = {
    type: "SOLID",
    color: {
      r: parseFloat(color.r.toString()) || 0,
      g: parseFloat(color.g.toString()) || 0,
      b: parseFloat(color.b.toString()) || 0,
    },
    opacity: parseFloat((color.a || 1).toString()),
  };
  node.fills = [paintStyle];
}

/**
 * Applies stroke color and stroke width to a node.
 *
 * @param {object} node - The node to update.
 * @param {object} color - The stroke color as {r, g, b, a}.
 * @param {number} [weight] - Optional stroke width.
 * @private
 */
function setStroke(node, color, weight) {
  const strokeStyle = {
    type: "SOLID",
    color: {
      r: parseFloat(color.r.toString()) || 0,
      g: parseFloat(color.g.toString()) || 0,
      b: parseFloat(color.b.toString()) || 0,
    },
    opacity: parseFloat((color.a || 1).toString()),
  };
  node.strokes = [strokeStyle];
  
  if (weight !== undefined) {
    node.strokeWeight = weight;
  }
}

/**
 * Creates a new vector node from an SVG string
 * 
 * Converts the provided SVG string into a Figma vector object and places it at the specified
 * coordinates. If a parentId is provided, the vector is appended to that node; otherwise it's
 * added to the current page.
 * 
 * @param {object} params - Configuration parameters
 * @param {string} params.svg - SVG string content to convert to Figma vector
 * @param {number} [params.x=0] - X position for the created node
 * @param {number} [params.y=0] - Y position for the created node
 * @param {string} [params.name="SVG Vector"] - Name for the created node
 * @param {string} [params.parentId] - Optional parent node ID
 * @returns {object} Information about the created SVG vector node
 */
async function createSvgVector(params) {
  const {
    svg,
    x = 0,
    y = 0,
    name = "SVG Vector",
    parentId
  } = params || {};

  if (!svg) {
    throw new Error("SVG string is required");
  }

  try {
    // Create node from SVG
    const node = figma.createNodeFromSvg(svg);
    
    // Set position and name
    node.x = x;
    node.y = y;
    if (name) node.name = name;
    
    // Add to parent if specified, otherwise add to current page
    if (parentId) {
      const parentNode = await figma.getNodeByIdAsync(parentId);
      if (!parentNode) {
        throw new Error(`Parent node not found with ID: ${parentId}`);
      }
      if (!("appendChild" in parentNode)) {
        throw new Error(`Parent node does not support children: ${parentId}`);
      }
      parentNode.appendChild(node);
    } else {
      figma.currentPage.appendChild(node);
    }
    
    return {
      id: node.id,
      name: node.name,
      type: node.type,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      parentId: node.parent ? node.parent.id : undefined
    };
  } catch (error) {
    throw new Error(`Failed to create SVG node: ${error.message}`);
  }
}

// Export the shape operations as a grouped object for external use.
async function createRectangles(params) {
  const { rectangles = [] } = params || {};
  const created = [];
  for (const cfg of rectangles) {
    const rectNode = await createRectangle(cfg);
    if (cfg.cornerRadius !== undefined) {
      await setCornerRadius({ nodeId: rectNode.id, radius: cfg.cornerRadius });
    }
    created.push(rectNode.id);
  }
  return { ids: created };
}

const shapeOperations = {
  createRectangle,
  createRectangles,
  createFrame,
  createEllipse,
  createPolygon,
  createStar,
  createVector,
  createLine,
  createLines,
  createSvgVector,
  setCornerRadius,
  resizeNode,
  deleteNode,
  deleteNodes,
  moveNode,
  flattenNode
};


// ----- text Module -----
// Text module providing functions to create and modify text nodes in Figma.


/**
 * Sends a progress update message to the plugin UI.
 *
 * @param {string} commandId - Unique identifier for the command execution.
 * @param {string} commandType - Type of command (e.g., 'scan_text_nodes').
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
  
  // Add optional chunk information if present
  if (payload) {
    if (payload.currentChunk !== undefined && payload.totalChunks !== undefined) {
      update.currentChunk = payload.currentChunk;
      update.totalChunks = payload.totalChunks;
      update.chunkSize = payload.chunkSize;
    }
    update.payload = payload;
  }
  
  // Send to UI
  figma.ui.postMessage(update);
  console.log(`Progress update: ${status} - ${progress}% - ${message}`);
  
  return update;
}

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
 * Create a new text node in the Figma document.
 *
 * This asynchronous function creates a text node at specified x,y coordinates,
 * applies fonts and colors, and appends it to the given parent node if provided.
 *
 * @param {object} params - Object containing text node configuration.
 * @param {number} [params.x=0] - Horizontal coordinate for the text node.
 * @param {number} [params.y=0] - Vertical coordinate for the text node.
 * @param {string} [params.text="Text"] - The text content to display.
 * @param {number} [params.fontSize=14] - Font size in pixels.
 * @param {number} [params.fontWeight=400] - Numeric font weight (commonly 100-900).
 * @param {object} [params.fontColor={r:0, g:0, b:0, a:1}] - RGBA font color.
 * @param {string} [params.name="Text"] - Node name.
 * @param {string} [params.parentId] - ID of the parent node for appending the text node.
 *
 * @returns {Promise<object>} Details of the created text node.
 * @throws {Error} When the parent node is not found or cannot have child nodes.
 */
async function createText(params) {
  const {
    x = 0,
    y = 0,
    text = "Text",
    fontSize = 14,
    fontWeight = 400,
    fontColor = { r: 0, g: 0, b: 0, a: 1 },
    name = "Text",
    parentId,
  } = params || {};

  // Map given numeric font weight to corresponding string font style.
  const getFontStyle = (weight) => {
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
  };

  try {
    const textNode = figma.createText();
    textNode.x = x;
    textNode.y = y;
    textNode.name = name;
    
    try {
      // Load the necessary font before applying its settings.
      await figma.loadFontAsync({
        family: "Inter",
        style: getFontStyle(fontWeight),
      });
      textNode.fontName = { family: "Inter", style: getFontStyle(fontWeight) };
      textNode.fontSize = fontSize;
    } catch (error) {
      console.error("Error setting font", error);
    }
    
    // Set text content using helper function.
    await setCharacters(textNode, text);

    // Configure the fill style using the provided RGBA color values.
    const paintStyle = {
      type: "SOLID",
      color: {
        r: parseFloat(fontColor.r.toString()) || 0,
        g: parseFloat(fontColor.g.toString()) || 0,
        b: parseFloat(fontColor.b.toString()) || 0,
      },
      opacity: parseFloat((fontColor.a || 1).toString()),
    };
    textNode.fills = [paintStyle];

    // Append the text node to the parent node if an id is provided, or to the current page.
    if (parentId) {
      const parentNode = await figma.getNodeByIdAsync(parentId);
      if (!parentNode) {
        throw new Error(`Parent node not found with ID: ${parentId}`);
      }
      if (!("appendChild" in parentNode)) {
        throw new Error(`Parent node does not support children: ${parentId}`);
      }
      parentNode.appendChild(textNode);
    } else {
      figma.currentPage.appendChild(textNode);
    }

    return {
      id: textNode.id,
      name: textNode.name,
      x: textNode.x,
      y: textNode.y,
      width: textNode.width,
      height: textNode.height,
      characters: textNode.characters,
      fontSize: textNode.fontSize,
      fontWeight: fontWeight,
      fontColor: fontColor,
      fontName: textNode.fontName,
      fills: textNode.fills,
      parentId: textNode.parent ? textNode.parent.id : undefined,
    };
  } catch (error) {
    console.error("Error creating text", error);
    throw error;
  }
}

/**
 * Update the text content of an existing text node.
 *
 * This function changes the text of a specified text node after ensuring the node exists
 * and is of type "TEXT". The font associated with the node is loaded prior to modification.
 *
 * @param {object} params - Configuration object.
 * @param {string} params.nodeId - ID of the target text node.
 * @param {string} params.text - New text content.
 *
 * @returns {Promise<object>} Updated node information including id, name, and characters.
 * @throws {Error} If the node is not found, not a text node, or if parameters are missing.
 *
 * @example
 * const result = await setTextContent({ nodeId: "12345", text: "Hello World" });
 * console.log(result.characters);
 */
async function setTextContent(params) {
  const { nodeId, text } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (text === undefined) {
    throw new Error("Missing text parameter");
  }

  try {
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) {
      throw new Error(`Node not found with ID: ${nodeId}`);
    }

    if (node.type !== "TEXT") {
      throw new Error(`Node is not a text node: ${nodeId}`);
    }

    await figma.loadFontAsync(node.fontName);
    await setCharacters(node, text);

    return {
      id: node.id,
      name: node.name,
      characters: node.characters,
      fontName: node.fontName,
    };
  } catch (error) {
    console.error("Error setting text content", error);
    throw error;
  }
}

/**
 * Scan text nodes within a specified parent node.
 *
 * This function scans for all text nodes under the given node ID. It includes options
 * for chunked processing for performance considerations with progress reporting.
 *
 * @param {object} params - Parameters for scanning.
 * @param {string} params.nodeId - ID of the parent node to scan.
 * @param {boolean} [params.useChunking=true] - Whether to process nodes in chunks.
 * @param {number} [params.chunkSize=10] - Number of nodes per chunk.
 * @param {string} [params.commandId] - Optional identifier for progress tracking.
 *
 * @returns {Promise<object>} Result object with metadata about the scan.
 * @throws {Error} If scanning fails or the parent node is not found.
 */
async function scanTextNodes(params) {
  console.log(`Starting to scan text nodes from node ID: ${params.nodeId}`);
  const { nodeId, useChunking = true, chunkSize = 10, commandId = generateCommandId() } = params || {};
  
  const node = await figma.getNodeByIdAsync(nodeId);

  if (!node) {
    console.error(`Node with ID ${nodeId} not found`);
    // Send error progress update
    sendProgressUpdate(
      commandId,
      'scan_text_nodes',
      'error',
      0,
      0,
      0,
      `Node with ID ${nodeId} not found`,
      { error: `Node not found: ${nodeId}` }
    );
    throw new Error(`Node with ID ${nodeId} not found`);
  }

  // If chunking is not enabled, use the original implementation
  if (!useChunking) {
    const textNodes = [];
    try {
      // Send started progress update
      sendProgressUpdate(
        commandId,
        'scan_text_nodes',
        'started',
        0,
        1, // Not known yet how many nodes there are
        0,
        `Starting scan of node "${node.name || nodeId}" without chunking`,
        null
      );

      await findTextNodes(node, [], 0, textNodes);
      
      // Send completed progress update
      sendProgressUpdate(
        commandId,
        'scan_text_nodes',
        'completed',
        100,
        textNodes.length,
        textNodes.length,
        `Scan complete. Found ${textNodes.length} text nodes.`,
        { textNodes }
      );

      return {
        success: true,
        message: `Scanned ${textNodes.length} text nodes.`,
        count: textNodes.length,
        textNodes: textNodes, 
        commandId
      };
    } catch (error) {
      console.error("Error scanning text nodes:", error);
      
      // Send error progress update
      sendProgressUpdate(
        commandId,
        'scan_text_nodes',
        'error',
        0,
        0,
        0,
        `Error scanning text nodes: ${error.message}`,
        { error: error.message }
      );
      
      throw new Error(`Error scanning text nodes: ${error.message}`);
    }
  }
  
  // Chunked implementation
  console.log(`Using chunked scanning with chunk size: ${chunkSize}`);
  
  // First, collect all nodes to process (without processing them yet)
  const nodesToProcess = [];
  
  // Send started progress update
  sendProgressUpdate(
    commandId,
    'scan_text_nodes',
    'started',
    0,
    0, // Not known yet how many nodes there are
    0,
    `Starting chunked scan of node "${node.name || nodeId}"`,
    { chunkSize }
  );
  
  await collectNodesToProcess(node, [], 0, nodesToProcess);
  
  const totalNodes = nodesToProcess.length;
  console.log(`Found ${totalNodes} total nodes to process`);
  
  // Calculate number of chunks needed
  const totalChunks = Math.ceil(totalNodes / chunkSize);
  console.log(`Will process in ${totalChunks} chunks`);
  
  // Send update after node collection
  sendProgressUpdate(
    commandId,
    'scan_text_nodes',
    'in_progress',
    5, // 5% progress for collection phase
    totalNodes,
    0,
    `Found ${totalNodes} nodes to scan. Will process in ${totalChunks} chunks.`,
    {
      totalNodes,
      totalChunks,
      chunkSize
    }
  );
  
  // Process nodes in chunks
  const allTextNodes = [];
  let processedNodes = 0;
  let chunksProcessed = 0;
  
  for (let i = 0; i < totalNodes; i += chunkSize) {
    const chunkEnd = Math.min(i + chunkSize, totalNodes);
    console.log(`Processing chunk ${chunksProcessed + 1}/${totalChunks} (nodes ${i} to ${chunkEnd - 1})`);
    
    // Send update before processing chunk
    sendProgressUpdate(
      commandId,
      'scan_text_nodes',
      'in_progress',
      Math.round(5 + ((chunksProcessed / totalChunks) * 90)), // 5-95% for processing
      totalNodes,
      processedNodes,
      `Processing chunk ${chunksProcessed + 1}/${totalChunks}`,
      {
        currentChunk: chunksProcessed + 1,
        totalChunks,
        textNodesFound: allTextNodes.length
      }
    );
    
    const chunkNodes = nodesToProcess.slice(i, chunkEnd);
    const chunkTextNodes = [];
    
    // Process each node in this chunk
    for (const nodeInfo of chunkNodes) {
      if (nodeInfo.node.type === "TEXT") {
        try {
          const textNodeInfo = await processTextNode(nodeInfo.node, nodeInfo.parentPath, nodeInfo.depth);
          if (textNodeInfo) {
            chunkTextNodes.push(textNodeInfo);
          }
        } catch (error) {
          console.error(`Error processing text node: ${error.message}`);
          // Continue with other nodes
        }
      }
      
      // Brief delay to allow UI updates and prevent freezing
      await delay(5);
    }
    
    // Add results from this chunk
    allTextNodes.push(...chunkTextNodes);
    processedNodes += chunkNodes.length;
    chunksProcessed++;
    
    // Send update after processing chunk
    sendProgressUpdate(
      commandId,
      'scan_text_nodes',
      'in_progress',
      Math.round(5 + ((chunksProcessed / totalChunks) * 90)), // 5-95% for processing
      totalNodes,
      processedNodes,
      `Processed chunk ${chunksProcessed}/${totalChunks}. Found ${allTextNodes.length} text nodes so far.`,
      {
        currentChunk: chunksProcessed,
        totalChunks,
        processedNodes,
        textNodesFound: allTextNodes.length,
        chunkResult: chunkTextNodes
      }
    );
    
    // Small delay between chunks to prevent UI freezing
    if (i + chunkSize < totalNodes) {
      await delay(50);
    }
  }
  
  // Send completed progress update
  sendProgressUpdate(
    commandId,
    'scan_text_nodes',
    'completed',
    100,
    totalNodes,
    processedNodes,
    `Scan complete. Found ${allTextNodes.length} text nodes.`,
    {
      textNodes: allTextNodes,
      processedNodes,
      chunks: chunksProcessed
    }
  );
  
  return {
    success: true,
    message: `Chunked scan complete. Found ${allTextNodes.length} text nodes.`,
    totalNodes: totalNodes,
    processedNodes: processedNodes,
    chunks: chunksProcessed,
    textNodes: allTextNodes,
    commandId
  };
}

/**
 * Recursively collects all nodes to be processed starting from a given node.
 *
 * @param {object} node - The starting node.
 * @param {Array<string>} [parentPath=[]] - The path of parent node names.
 * @param {number} [depth=0] - The current depth in the node tree.
 * @param {Array} [nodesToProcess=[]] - Accumulator array for nodes to process.
 *
 * @returns {Promise<void>}
 */
async function collectNodesToProcess(node, parentPath = [], depth = 0, nodesToProcess = []) {
  // Skip invisible nodes
  if (node.visible === false) return;
  
  // Get the path to this node
  const nodePath = [...parentPath, node.name || `Unnamed ${node.type}`];
  
  // Add this node to the processing list
  nodesToProcess.push({
    node: node,
    parentPath: nodePath,
    depth: depth
  });
  
  // Recursively add children
  if ("children" in node) {
    for (const child of node.children) {
      await collectNodesToProcess(child, nodePath, depth + 1, nodesToProcess);
    }
  }
}

/**
 * Processes a single text node to extract relevant information.
 *
 * @param {object} node - The text node to process.
 * @param {Array<string>} parentPath - The path of parent node names.
 * @param {number} depth - The depth of the node in the tree.
 *
 * @returns {Promise<object|null>} A safe representation of the text node or null if not a text node.
 */
async function processTextNode(node, parentPath, depth) {
  if (node.type !== "TEXT") return null;
  
  try {
    // Safely extract font information
    let fontFamily = "";
    let fontStyle = "";

    if (node.fontName) {
      if (typeof node.fontName === "object") {
        if ("family" in node.fontName) fontFamily = node.fontName.family;
        if ("style" in node.fontName) fontStyle = node.fontName.style;
      }
    }

    // Create a safe representation of the text node
    const safeTextNode = {
      id: node.id,
      name: node.name || "Text",
      type: node.type,
      characters: node.characters,
      fontSize: typeof node.fontSize === "number" ? node.fontSize : 0,
      fontFamily: fontFamily,
      fontStyle: fontStyle,
      x: typeof node.x === "number" ? node.x : 0,
      y: typeof node.y === "number" ? node.y : 0,
      width: typeof node.width === "number" ? node.width : 0,
      height: typeof node.height === "number" ? node.height : 0,
      path: parentPath.join(" > "),
      depth: depth,
    };

    // Highlight the node briefly (optional visual feedback)
    try {
      const originalFills = JSON.parse(JSON.stringify(node.fills));
      node.fills = [
        {
          type: "SOLID",
          color: { r: 1, g: 0.5, b: 0 },
          opacity: 0.3,
        },
      ];

      // Brief delay for the highlight to be visible
      await delay(100);
      
      try {
        node.fills = originalFills;
      } catch (err) {
        console.error("Error resetting fills:", err);
      }
    } catch (highlightErr) {
      console.error("Error highlighting text node:", highlightErr);
      // Continue anyway, highlighting is just visual feedback
    }

    return safeTextNode;
  } catch (nodeErr) {
    console.error("Error processing text node:", nodeErr);
    return null;
  }
}

/**
 * Recursively finds all text nodes within a node.
 *
 * @param {object} node - The node to search.
 * @param {Array<string>} [parentPath=[]] - The path of parent node names.
 * @param {number} [depth=0] - The current depth in the node tree.
 * @param {Array} [textNodes=[]] - Accumulator array for found text nodes.
 *
 * @returns {Promise<void>}
 */
async function findTextNodes(node, parentPath = [], depth = 0, textNodes = []) {
  // Skip invisible nodes
  if (node.visible === false) return;

  // Get the path to this node including its name
  const nodePath = [...parentPath, node.name || `Unnamed ${node.type}`];

  if (node.type === "TEXT") {
    try {
      // Safely extract font information to avoid Symbol serialization issues
      let fontFamily = "";
      let fontStyle = "";

      if (node.fontName) {
        if (typeof node.fontName === "object") {
          if ("family" in node.fontName) fontFamily = node.fontName.family;
          if ("style" in node.fontName) fontStyle = node.fontName.style;
        }
      }

      // Create a safe representation of the text node with only serializable properties
      const safeTextNode = {
        id: node.id,
        name: node.name || "Text",
        type: node.type,
        characters: node.characters,
        fontSize: typeof node.fontSize === "number" ? node.fontSize : 0,
        fontFamily: fontFamily,
        fontStyle: fontStyle,
        x: typeof node.x === "number" ? node.x : 0,
        y: typeof node.y === "number" ? node.y : 0,
        width: typeof node.width === "number" ? node.width : 0,
        height: typeof node.height === "number" ? node.height : 0,
        path: nodePath.join(" > "),
        depth: depth,
      };

      // Only highlight the node if it's not being done via API
      try {
        // Safe way to create a temporary highlight without causing serialization issues
        const originalFills = JSON.parse(JSON.stringify(node.fills));
        node.fills = [
          {
            type: "SOLID",
            color: { r: 1, g: 0.5, b: 0 },
            opacity: 0.3,
          },
        ];

        // Promise-based delay instead of setTimeout
        await delay(500);
        
        try {
          node.fills = originalFills;
        } catch (err) {
          console.error("Error resetting fills:", err);
        }
      } catch (highlightErr) {
        console.error("Error highlighting text node:", highlightErr);
        // Continue anyway, highlighting is just visual feedback
      }

      textNodes.push(safeTextNode);
    } catch (nodeErr) {
      console.error("Error processing text node:", nodeErr);
      // Skip this node but continue with others
    }
  }

  // Recursively process children of container nodes
  if ("children" in node) {
    for (const child of node.children) {
      await findTextNodes(child, nodePath, depth + 1, textNodes);
    }
  }
}

/**
 * Replace text content in multiple text nodes in a batch operation.
 *
 * This function applies text replacements to multiple nodes within a parent node.
 *
 * @param {object} params - Batch operation parameters.
 * @param {string} params.nodeId - ID of the parent node containing text nodes.
 * @param {Array<object>} params.text - Array of text replacement objects.
 * @param {string} [params.commandId] - Optional command identifier for progress.
 *
 * @returns {Promise<object>} Summary of the replacement operation.
 * @throws {Error} If required parameters are missing or invalid.
 */
async function setMultipleTextContents(params) {
  const { nodeId, text } = params || {};
  const commandId = params.commandId || generateCommandId();

  if (!nodeId || !text || !Array.isArray(text)) {
    const errorMsg = "Missing required parameters: nodeId and text array";
    
    // Send error progress update
    sendProgressUpdate(
      commandId,
      'set_multiple_text_contents',
      'error',
      0,
      0,
      0,
      errorMsg,
      { error: errorMsg }
    );
    
    throw new Error(errorMsg);
  }

  console.log(
    `Starting text replacement for node: ${nodeId} with ${text.length} text replacements`
  );
  
  // Send started progress update
  sendProgressUpdate(
    commandId,
    'set_multiple_text_contents',
    'started',
    0,
    text.length,
    0,
    `Starting text replacement for ${text.length} nodes`,
    { totalReplacements: text.length }
  );

  // Define the results array and counters
  const results = [];
  let successCount = 0;
  let failureCount = 0;

  // Split text replacements into chunks of 5
  const CHUNK_SIZE = 5;
  const chunks = [];
  
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }
  
  console.log(`Split ${text.length} replacements into ${chunks.length} chunks`);
  
  // Send chunking info update
  sendProgressUpdate(
    commandId,
    'set_multiple_text_contents',
    'in_progress',
    5, // 5% progress for planning phase
    text.length,
    0,
    `Preparing to replace text in ${text.length} nodes using ${chunks.length} chunks`,
    {
      totalReplacements: text.length,
      chunks: chunks.length,
      chunkSize: CHUNK_SIZE
    }
  );

  // Process each chunk sequentially
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    console.log(`Processing chunk ${chunkIndex + 1}/${chunks.length} with ${chunk.length} replacements`);
    
    // Send chunk processing start update
    sendProgressUpdate(
      commandId,
      'set_multiple_text_contents',
      'in_progress',
      Math.round(5 + ((chunkIndex / chunks.length) * 90)), // 5-95% for processing
      text.length,
      successCount + failureCount,
      `Processing text replacements chunk ${chunkIndex + 1}/${chunks.length}`,
      {
        currentChunk: chunkIndex + 1,
        totalChunks: chunks.length,
        successCount,
        failureCount
      }
    );
    
    // Process replacements within a chunk in parallel
    const chunkPromises = chunk.map(async (replacement) => {
      if (!replacement.nodeId || replacement.text === undefined) {
        console.error(`Missing nodeId or text for replacement`);
        return {
          success: false,
          nodeId: replacement.nodeId || "unknown",
          error: "Missing nodeId or text in replacement entry"
        };
      }

      try {
        console.log(`Attempting to replace text in node: ${replacement.nodeId}`);

        // Get the text node to update (just to check it exists and get original text)
        const textNode = await figma.getNodeByIdAsync(replacement.nodeId);

        if (!textNode) {
          console.error(`Text node not found: ${replacement.nodeId}`);
          return {
            success: false,
            nodeId: replacement.nodeId,
            error: `Node not found: ${replacement.nodeId}`
          };
        }

        if (textNode.type !== "TEXT") {
          console.error(`Node is not a text node: ${replacement.nodeId} (type: ${textNode.type})`);
          return {
            success: false,
            nodeId: replacement.nodeId,
            error: `Node is not a text node: ${replacement.nodeId} (type: ${textNode.type})`
          };
        }

        // Save original text for the result
        const originalText = textNode.characters;
        console.log(`Original text: "${originalText}"`);
        console.log(`Will translate to: "${replacement.text}"`);

        // Highlight the node before changing text
        let originalFills;
        try {
          // Save original fills for restoration later
          originalFills = JSON.parse(JSON.stringify(textNode.fills));
          // Apply highlight color (orange with 30% opacity)
          textNode.fills = [
            {
              type: "SOLID",
              color: { r: 1, g: 0.5, b: 0 },
              opacity: 0.3,
            },
          ];
        } catch (highlightErr) {
          console.error(`Error highlighting text node: ${highlightErr.message}`);
          // Continue anyway, highlighting is just visual feedback
        }

        // Use the existing setTextContent function to handle font loading and text setting
        await setTextContent({
          nodeId: replacement.nodeId,
          text: replacement.text
        });

        // Keep highlight for a moment after text change, then restore original fills
        if (originalFills) {
          try {
            // Use delay function for consistent timing
            await delay(500);
            textNode.fills = originalFills;
          } catch (restoreErr) {
            console.error(`Error restoring fills: ${restoreErr.message}`);
          }
        }

        console.log(`Successfully replaced text in node: ${replacement.nodeId}`);
        return {
          success: true,
          nodeId: replacement.nodeId,
          originalText: originalText,
          translatedText: replacement.text
        };
      } catch (error) {
        console.error(`Error replacing text in node ${replacement.nodeId}: ${error.message}`);
        return {
          success: false,
          nodeId: replacement.nodeId,
          error: `Error applying replacement: ${error.message}`
        };
      }
    });

    // Wait for all replacements in this chunk to complete
    const chunkResults = await Promise.all(chunkPromises);
    
    // Process results for this chunk
    chunkResults.forEach(result => {
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }
      results.push(result);
    });
    
    // Send chunk processing complete update with partial results
    sendProgressUpdate(
      commandId,
      'set_multiple_text_contents',
      'in_progress',
      Math.round(5 + (((chunkIndex + 1) / chunks.length) * 90)), // 5-95% for processing
      text.length,
      successCount + failureCount,
      `Completed chunk ${chunkIndex + 1}/${chunks.length}. ${successCount} successful, ${failureCount} failed so far.`,
      {
        currentChunk: chunkIndex + 1,
        totalChunks: chunks.length,
        successCount,
        failureCount,
        chunkResults: chunkResults
      }
    );
    
    // Add a small delay between chunks to avoid overloading Figma
    if (chunkIndex < chunks.length - 1) {
      console.log('Pausing between chunks to avoid overloading Figma...');
      await delay(1000); // 1 second delay between chunks
    }
  }

  console.log(
    `Replacement complete: ${successCount} successful, ${failureCount} failed`
  );
  
  // Send completed progress update
  sendProgressUpdate(
    commandId,
    'set_multiple_text_contents',
    'completed',
    100,
    text.length,
    successCount + failureCount,
    `Text replacement complete: ${successCount} successful, ${failureCount} failed`,
    {
      totalReplacements: text.length,
      replacementsApplied: successCount,
      replacementsFailed: failureCount,
      completedInChunks: chunks.length,
      results: results
    }
  );

  return {
    success: successCount > 0,
    nodeId: nodeId,
    replacementsApplied: successCount,
    replacementsFailed: failureCount,
    totalReplacements: text.length,
    results: results,
    completedInChunks: chunks.length,
    commandId
  };
}

/**
 * Update the font family and style of a text node.
 *
 * This function allows changing the font family and optionally the style, returning the
 * updated font details.
 *
 * @param {object} params - Configuration for font update.
 * @param {string} params.nodeId - ID of the text node.
 * @param {string} params.family - New font family.
 * @param {string} [params.style="Regular"] - New font style.
 *
 * @returns {Promise<object>} Updated node information including font name.
 * @throws {Error} If the node is not found or not a text node.
 */
async function setFontName(params) {
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
 * Change the font size and return the updated node information.
 *
 * @param {object} params - Configuration for font size update.
 * @param {string} params.nodeId - ID of the text node.
 * @param {number} params.fontSize - New font size in pixels.
 *
 * @returns {Promise<object>} Updated node information including font size.
 * @throws {Error} If the node is not found or not a text node.
 */
async function setFontSize(params) {
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
 * Adjust the font weight and return the updated font settings.
 *
 * @param {object} params - Configuration for font weight update.
 * @param {string} params.nodeId - ID of the text node.
 * @param {number} params.weight - New font weight (100-900).
 *
 * @returns {Promise<object>} Updated node information including new weight.
 * @throws {Error} If the node is not found or not a text node.
 */
async function setFontWeight(params) {
  const { nodeId, weight } = params || {};
  
  if (!nodeId || weight === undefined) {
    throw new Error("Missing nodeId or weight");
  }
  
  // Map weight to font style
  const getFontStyle = (weight) => {
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
  };
  
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
 * This modifies the spacing between letters with an option to specify the unit of measure.
 *
 * @param {object} params - Configuration for letter spacing.
 * @param {string} params.nodeId - ID of the text node.
 * @param {number} params.letterSpacing - New letter spacing value.
 * @param {string} [params.unit="PIXELS"] - Unit for letter spacing ("PIXELS" or "PERCENT").
 *
 * @returns {Promise<object>} Updated node information with new letter spacing.
 * @throws {Error} If the node is not found or not a text node.
 */
async function setLetterSpacing(params) {
  const { nodeId, letterSpacing, unit = "PIXELS" } = params || {};
  
  if (!nodeId || letterSpacing === undefined) {
    throw new Error("Missing nodeId or letterSpacing");
  }
  
  // Validate the unit parameter
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
    // Load the font to ensure we can modify the text
    await figma.loadFontAsync(node.fontName);
    
    // Set the letter spacing with the specified unit
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
 * This adjusts the vertical spacing of lines within the text node.
 *
 * @param {object} params - Configuration for line height update.
 * @param {string} params.nodeId - ID of the text node.
 * @param {number} params.lineHeight - New line height value.
 * @param {string} [params.unit="PIXELS"] - Unit for line height ("PIXELS", "PERCENT", or "AUTO").
 *
 * @returns {Promise<object>} Updated node information including line height.
 * @throws {Error} If the node is not found or not a text node.
 */
async function setLineHeight(params) {
  const { nodeId, lineHeight, unit = "PIXELS" } = params || {};
  
  if (!nodeId || lineHeight === undefined) {
    throw new Error("Missing nodeId or lineHeight");
  }
  
  // Validate the unit parameter
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
    // Load the font to ensure we can modify the text
    await figma.loadFontAsync(node.fontName);
    
    // Special handling for AUTO unit
    if (unit === "AUTO") {
      node.lineHeight = { unit: "AUTO" };
    } else {
      // Set the line height with the specified unit and value
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
 * Sets the spacing (in pixels) between paragraphs in the text node.
 *
 * @param {object} params - Configuration for paragraph spacing.
 * @param {string} params.nodeId - ID of the text node.
 * @param {number} params.paragraphSpacing - New paragraph spacing in pixels.
 *
 * @returns {Promise<object>} Updated node information including paragraph spacing.
 * @throws {Error} If the node is not found or not a text node.
 */
async function setParagraphSpacing(params) {
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
    // Load the font to ensure we can modify the text
    await figma.loadFontAsync(node.fontName);
    
    // Set the paragraph spacing
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
 * Update the text case of a text node.
 *
 * Changes the case transformation applied to the text content.
 *
 * @param {object} params - Configuration for text case update.
 * @param {string} params.nodeId - ID of the text node.
 * @param {string} params.textCase - New text case ("ORIGINAL", "UPPER", "LOWER", "TITLE").
 *
 * @returns {Promise<object>} Updated node information including text case.
 * @throws {Error} If the node is not found or not a text node.
 */
async function setTextCase(params) {
  const { nodeId, textCase } = params || {};
  
  if (!nodeId || textCase === undefined) {
    throw new Error("Missing nodeId or textCase");
  }
  
  // Validate the textCase parameter
  const validTextCases = ["ORIGINAL", "UPPER", "LOWER", "TITLE"];
  if (!validTextCases.includes(textCase)) {
    throw new Error(`Invalid textCase: must be one of ${validTextCases.join(", ")}`);
  }
  
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }
  
  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }
  
  try {
    // Load the font to ensure we can modify the text
    await figma.loadFontAsync(node.fontName);
    
    // Set the text case
    node.textCase = textCase;
    
    return {
      id: node.id,
      name: node.name,
      textCase: node.textCase
    };
  } catch (error) {
    throw new Error(`Error setting text case: ${error.message}`);
  }
}

/**
 * Update the text decoration of a text node.
 *
 * This function sets the decoration style of the text such as underline or strikethrough.
 *
 * @param {object} params - Configuration for text decoration.
 * @param {string} params.nodeId - ID of the text node.
 * @param {string} params.textDecoration - Decoration style ("NONE", "UNDERLINE", "STRIKETHROUGH").
 *
 * @returns {Promise<object>} Updated node information including text decoration.
 * @throws {Error} If the node is not found or not a text node.
 */
async function setTextDecoration(params) {
  const { nodeId, textDecoration } = params || {};
  
  if (!nodeId || textDecoration === undefined) {
    throw new Error("Missing nodeId or textDecoration");
  }
  
  // Validate the textDecoration parameter
  const validDecorations = ["NONE", "UNDERLINE", "STRIKETHROUGH"];
  if (!validDecorations.includes(textDecoration)) {
    throw new Error(`Invalid textDecoration: must be one of ${validDecorations.join(", ")}`);
  }
  
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }
  
  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }
  
  try {
    // Load the font to ensure we can modify the text
    await figma.loadFontAsync(node.fontName);
    
    // Set the text decoration
    node.textDecoration = textDecoration;
    
    return {
      id: node.id,
      name: node.name,
      textDecoration: node.textDecoration
    };
  } catch (error) {
    throw new Error(`Error setting text decoration: ${error.message}`);
  }
}

/**
 * Retrieve styled text segments based on a specified property.
 *
 * Identifies sections of the text that share the same style (e.g., fontName or fontSize)
 * and returns the segments for further processing.
 *
 * @param {object} params - Configuration for retrieving styled segments.
 * @param {string} params.nodeId - ID of the text node.
 * @param {string} params.property - Name of the property to scan (e.g., "fontName", "fontSize").
 *
 * @returns {Promise<object>} Object containing the styled segments of the node.
 * @throws {Error} If the node is not found, not a text node, or the property is invalid.
 */
async function getStyledTextSegments(params) {
  const { nodeId, property } = params || {};
  
  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  
  if (!property) {
    throw new Error("Missing property parameter");
  }
  
  // Validate property name
  const validProperties = ["fillStyleId", "fontName", "fontSize", "textCase", 
                           "textDecoration", "textStyleId", "fills", 
                           "letterSpacing", "lineHeight", "fontWeight"];
                           
  if (!validProperties.includes(property)) {
    throw new Error(`Invalid property: must be one of ${validProperties.join(", ")}`);
  }
  
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }
  
  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }
  
  try {
    // Load the font to ensure we can access text properties
    await figma.loadFontAsync(node.fontName);
    
    // Get the text content
    const text = node.characters;
    
    // Get style ranges for the specified property
    let styleRanges = [];
    
    if (property === "fontWeight") {
      // Special handling for fontWeight which is derived from fontName.style
      const ranges = node.getStyledTextSegments(['fontName']);
      styleRanges = ranges.map(range => {
        // Extract weight from font style
        let weight = 400; // Default to Regular weight
        const style = range.fontName.style;
        
        // Map common font style names to weights
        if (/thin/i.test(style)) weight = 100;
        else if (/extra\s*light/i.test(style)) weight = 200;
        else if (/light/i.test(style)) weight = 300;
        else if (/regular/i.test(style)) weight = 400;
        else if (/medium/i.test(style)) weight = 500;
        else if (/semi\s*bold/i.test(style)) weight = 600;
        else if (/bold/i.test(style)) weight = 700;
        else if (/extra\s*bold/i.test(style)) weight = 800;
        else if (/black/i.test(style)) weight = 900;
        
        return {
          characters: range.characters,
          start: range.start,
          end: range.end,
          fontWeight: weight
        };
      });
    } else {
      // For all other properties, use the standard Figma method
      styleRanges = node.getStyledTextSegments([property]).map(range => {
        // Create a copy of the range with just the needed properties
        const result = {
          characters: range.characters,
          start: range.start,
          end: range.end
        };
        
        // Add the specific style property
        result[property] = range[property];
        
        return result;
      });
    }
    
    return {
      id: node.id,
      name: node.name,
      characters: text,
      property: property,
      segments: styleRanges
    };
  } catch (error) {
    throw new Error(`Error getting styled text segments: ${error.message}`);
  }
}

/**
 * Load a font asynchronously.
 *
 * Wraps the Figma font loading functionality and returns a success message along with
 * the loaded font details.
 *
 * @param {object} params - Configuration for font loading.
 * @param {string} params.family - Font family to load.
 * @param {string} [params.style="Regular"] - Font style to load.
 *
 * @returns {Promise<object>} Details about the loaded font including family and style.
 * @throws {Error} If font loading fails.
 */
async function loadFontAsyncWrapper(params) {
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
async function setBulkFont(params) {
  const { targets, commandId = generateCommandId() } = params;

  if (!targets || !Array.isArray(targets)) {
    throw new Error("targets parameter must be an array");
  }

  // Process each target configuration
  const results = [];
  let totalSuccessCount = 0;
  let totalFailureCount = 0;
  let totalNodes = 0;

  // Send initial progress update
  sendProgressUpdate(commandId, 'set_bulk_font', 'started', 0, 0, 0, 
    `Starting bulk font update for multiple configurations`, { totalConfigs: targets.length });

  for (let targetIndex = 0; targetIndex < targets.length; targetIndex++) {
    const target = targets[targetIndex];
    let targetNodeIds = target.nodeIds || [];

    // If parentId is provided, scan for text nodes
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
      
      // Determine whether to include all descendant nodes or only direct children
      const inherit = target.inherit !== undefined ? target.inherit : true;
      
      if (inherit) {
        // If inherit is true (default), scan all descendants (existing behavior)
        const scanResult = await scanTextNodes({ nodeId: target.parentId });
        targetNodeIds = scanResult.textNodes.map(node => node.id);
      } else {
        // If inherit is false, only include direct children that are text nodes
        if ("children" in parent) {
          // Find only direct children that are text nodes
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

    // Initialize progress tracking for this target
    let successCount = 0;
    let failureCount = 0;
    const configTotal = targetNodeIds.length;
    totalNodes += configTotal;

    // Process in chunks to avoid overwhelming Figma
    const CHUNK_SIZE = 5;
    const chunks = [];
    for (let i = 0; i < targetNodeIds.length; i += CHUNK_SIZE) {
      chunks.push(targetNodeIds.slice(i, i + CHUNK_SIZE));
    }

    // Process each chunk
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];
      const chunkPromises = chunk.map(async nodeId => {
        try {
          const node = await figma.getNodeByIdAsync(nodeId);
          if (!node || node.type !== "TEXT") {
            return { success: false, nodeId, error: "Not a valid text node" };
          }

          // Load and apply font settings
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

      // Update progress for current configuration
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

      // Add delay between chunks
      if (chunkIndex < chunks.length - 1) {
        await delay(100);
      }
    }
  }

  // Send completion update
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

// Group for all text operations.
const textOperations = {
  createText,
  setTextContent,
  scanTextNodes,
  setMultipleTextContents,
  setFontName,
  setFontSize,
  setFontWeight,
  setLetterSpacing,
  setLineHeight,
  setParagraphSpacing,
  setTextCase,
  setTextDecoration,
  getStyledTextSegments,
  loadFontAsyncWrapper,
  setBulkFont
};


// ----- styles Module -----
// Styles module

/**
 * Sets the fill color of a specified node.
 *
 * Retrieves the node by its ID, validates that it supports fills, and then applies
 * a solid fill with the provided RGBA color.
 *
 * @param {object} params - Parameters for setting the fill color.
 * @param {string} params.nodeId - The ID of the node to update.
 * @param {object} params.color - The RGBA color object.
 * @param {number} params.color.r - Red component (0–1).
 * @param {number} params.color.g - Green component (0–1).
 * @param {number} params.color.b - Blue component (0–1).
 * @param {number} [params.color.a=1] - Alpha component (0–1).
 * @returns {object} An object containing the node's id, name, and updated fills.
 * @throws {Error} If the nodeId is missing, the node is not found, or the node does not support fills.
 */
async function setFillColor(params) {
  const {
    nodeId,
    color: { r, g, b, a },
  } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }
  if (!("fills" in node)) {
    throw new Error(`Node does not support fills: ${nodeId}`);
  }

  // Prepare RGBA color values
  const rgbColor = {
    r: parseFloat(r) || 0,
    g: parseFloat(g) || 0,
    b: parseFloat(b) || 0,
    a: parseFloat(a) || 1,
  };

  // Define a SOLID paint style with the specified color and opacity
  const paintStyle = {
    type: "SOLID",
    color: {
      r: parseFloat(rgbColor.r),
      g: parseFloat(rgbColor.g),
      b: parseFloat(rgbColor.b),
    },
    opacity: parseFloat(rgbColor.a),
  };

  node.fills = [paintStyle];

  return {
    id: node.id,
    name: node.name,
    fills: [paintStyle],
  };
}

/**
 * Sets the stroke color and weight for a specified node.
 *
 * Retrieves the node by its ID, validates stroke support, and then applies
 * the specified stroke color (RGBA) and weight.
 *
 * @param {object} params - Parameters for setting the stroke.
 * @param {string} params.nodeId - The ID of the node to update.
 * @param {object} params.color - The RGBA color object.
 * @param {number} params.color.r - Red component (0–1).
 * @param {number} params.color.g - Green component (0–1).
 * @param {number} params.color.b - Blue component (0–1).
 * @param {number} [params.color.a=1] - Alpha component (0–1).
 * @param {number} [params.weight=1] - Stroke weight.
 * @returns {object} An object containing the node's id, name, updated strokes, and strokeWeight.
 * @throws {Error} If the nodeId is missing, the node is not found, or the node does not support strokes.
 */
async function setStrokeColor(params) {
  const {
    nodeId,
    color: { r, g, b, a },
    weight = 1,
  } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }
  if (!("strokes" in node)) {
    throw new Error(`Node does not support strokes: ${nodeId}`);
  }

  // Prepare RGBA color values with defaults
  const rgbColor = {
    r: r !== undefined ? r : 0,
    g: g !== undefined ? g : 0,
    b: b !== undefined ? b : 0,
    a: a !== undefined ? a : 1,
  };

  // Define a SOLID paint style for strokes
  const paintStyle = {
    type: "SOLID",
    color: {
      r: rgbColor.r,
      g: rgbColor.g,
      b: rgbColor.b,
    },
    opacity: rgbColor.a,
  };

  node.strokes = [paintStyle];

  // Apply stroke weight if supported
  if ("strokeWeight" in node) {
    node.strokeWeight = weight;
  }

  return {
    id: node.id,
    name: node.name,
    strokes: node.strokes,
    strokeWeight: "strokeWeight" in node ? node.strokeWeight : undefined,
  };
}

/**
 * Retrieves local style definitions from the Figma document.
 *
 * Collects local paint, text, effect, and grid styles then maps each style to a simplified
 * serializable format with key properties.
 *
 * @returns {Promise<object>} An object containing arrays for colors, texts, effects, and grids.
 * @example
 * const styles = await getStyles();
 * console.log(styles.colors, styles.texts);
 */
async function setStyle(params) {
  const { nodeId, fillProps, strokeProps } = params || {};
  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  // Apply fill properties if provided
  if (fillProps) {
    await setFillColor({
      nodeId,
      color: {
        r: Array.isArray(fillProps.color) ? fillProps.color[0] : 0,
        g: Array.isArray(fillProps.color) ? fillProps.color[1] : 0,
        b: Array.isArray(fillProps.color) ? fillProps.color[2] : 0,
        a: Array.isArray(fillProps.color) ? fillProps.color[3] : 1
      }
    });
  }
  // Apply stroke properties if provided
  if (strokeProps) {
    await setStrokeColor({
      nodeId,
      color: {
        r: Array.isArray(strokeProps.color) ? strokeProps.color[0] : 0,
        g: Array.isArray(strokeProps.color) ? strokeProps.color[1] : 0,
        b: Array.isArray(strokeProps.color) ? strokeProps.color[2] : 0,
        a: Array.isArray(strokeProps.color) ? strokeProps.color[3] : 1
      },
      weight: strokeProps.weight != null ? strokeProps.weight : 1
    });
  }
  const node = await figma.getNodeByIdAsync(nodeId);
  return {
    id: node.id,
    name: node.name,
    fills: node.fills,
    strokes: node.strokes
  };
}

/**
 * Apply styles to multiple nodes in one call.
 *
 * @param {Array} entries - Array of objects { nodeId, fillProps?, strokeProps? }
 */
async function setStyles(entries) {
  const results = [];
  for (const entry of entries) {
    const res = await setStyle(entry);
    results.push(res);
  }
  return results;
}

async function getStyles() {
  const styles = {
    colors: await figma.getLocalPaintStylesAsync(),
    texts: await figma.getLocalTextStylesAsync(),
    effects: await figma.getLocalEffectStylesAsync(),
    grids: await figma.getLocalGridStylesAsync(),
  };

  return {
    colors: styles.colors.map((style) => ({
      id: style.id,
      name: style.name,
      key: style.key,
      paint: style.paints[0],
    })),
    texts: styles.texts.map((style) => ({
      id: style.id,
      name: style.name,
      key: style.key,
      fontSize: style.fontSize,
      fontName: style.fontName,
    })),
    effects: styles.effects.map((style) => ({
      id: style.id,
      name: style.name,
      key: style.key,
    })),
    grids: styles.grids.map((style) => ({
      id: style.id,
      name: style.name,
      key: style.key,
    })),
  };
}

/**
 * Applies visual effects to a specified node.
 *
 * Converts incoming effects to valid Figma effects based on effect type and applies them.
 *
 * @param {object} params - Parameters for applying effects.
 * @param {string} params.nodeId - The ID of the node to update.
 * @param {Array} params.effects - An array of effect objects to apply.
 * @returns {Promise<object>} An object with the node's id, name, and applied effects.
 * @throws {Error} If the nodeId is missing, the effects parameter is invalid, the node doesn't support effects, or an effect type is unsupported.
 */
async function setEffects(params) {
  const { nodeId, effects } = params || {};
  
  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  
  if (!effects || !Array.isArray(effects)) {
    throw new Error("Missing or invalid effects parameter. Must be an array.");
  }
  
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }
  
  if (!("effects" in node)) {
    throw new Error(`Node does not support effects: ${nodeId}`);
  }
  
  try {
    // Validate and map each effect to a proper Figma effect object
    const validEffects = effects.map(effect => {
      if (!effect.type) {
        throw new Error("Each effect must have a type property");
      }
      
      switch (effect.type) {
        case "DROP_SHADOW":
        case "INNER_SHADOW":
          return {
            type: effect.type,
            color: effect.color || { r: 0, g: 0, b: 0, a: 0.5 },
            offset: effect.offset || { x: 0, y: 0 },
            radius: effect.radius || 5,
            spread: effect.spread || 0,
            visible: effect.visible !== undefined ? effect.visible : true,
            blendMode: effect.blendMode || "NORMAL"
          };
        case "LAYER_BLUR":
        case "BACKGROUND_BLUR":
          return {
            type: effect.type,
            radius: effect.radius || 5,
            visible: effect.visible !== undefined ? effect.visible : true
          };
        default:
          throw new Error(`Unsupported effect type: ${effect.type}`);
      }
    });
    
    node.effects = validEffects;
    
    return {
      id: node.id,
      name: node.name,
      effects: node.effects
    };
  } catch (error) {
    throw new Error(`Error setting effects: ${error.message}`);
  }
}

/**
 * Applies an effect style to a specified node.
 *
 * Finds the effect style by its ID from local styles and applies it to the node.
 *
 * @param {object} params - Parameters for applying the effect style.
 * @param {string} params.nodeId - The ID of the node to update.
 * @param {string} params.effectStyleId - The ID of the effect style to apply.
 * @returns {Promise<object>} An object with the node's id, name, applied effectStyleId, and current effects.
 * @throws {Error} If required parameters are missing, node not found, node does not support effect styles, or the style cannot be found.
 */
async function setEffectStyleId(params) {
  const { nodeId, effectStyleId } = params || {};
  
  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  
  if (!effectStyleId) {
    throw new Error("Missing effectStyleId parameter");
  }
  
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }
  
  if (!("effectStyleId" in node)) {
    throw new Error(`Node does not support effect styles: ${nodeId}`);
  }
  
  try {
    // Retrieve local effect styles and find the matching style by ID
    const effectStyles = await figma.getLocalEffectStylesAsync();
    const foundStyle = effectStyles.find(style => style.id === effectStyleId);
    
    if (!foundStyle) {
      throw new Error(`Effect style not found with ID: ${effectStyleId}`);
    }
    
    // Apply the effect style to the node
    node.effectStyleId = effectStyleId;
    
    return {
      id: node.id,
      name: node.name,
      effectStyleId: node.effectStyleId,
      appliedEffects: node.effects
    };
  } catch (error) {
    throw new Error(`Error setting effect style ID: ${error.message}`);
  }
}

// Export all style operations as a grouped object
const styleOperations = {
  setStyle,
  setFillColor,
  setStrokeColor,
  getStyles,
  setEffects,
  setEffectStyleId
};


// ----- components Module -----
// Components module - Provides functionality for working with Figma components
// including local components, team library components, and component instances

/**
 * Retrieves all local components available in the Figma document. 
 * 
 * First loads all pages in the document to ensure complete component discovery,
 * then searches for all components using Figma's node traversal API.
 *
 * @returns {Promise<object>} Component data object
 * @property {number} count - Total number of local components found
 * @property {Array<object>} components - Array of component details
 * @property {string} components[].id - Unique Figma node ID of the component
 * @property {string} components[].name - Display name of the component
 * @property {string|null} components[].key - Component's key for team library usage, null if not available
 *
 * @example
 * const { count, components } = await getLocalComponents();
 * console.log(`Found ${count} components:`);
 * components.forEach(c => console.log(`- ${c.name} (${c.id})`));
 */
async function getLocalComponents() {
  await figma.loadAllPagesAsync();

  const components = figma.root.findAllWithCriteria({
    types: ["COMPONENT"],
  });

  return {
    count: components.length,
    components: components.map((component) => ({
      id: component.id,
      name: component.name,
      key: "key" in component ? component.key : null,
    })),
  };
}

/**
 * Retrieves available components from all team libraries accessible to the current user. 
 * 
 * Performs API availability checks and implements timeout protection against potential
 * deadlocks when fetching remote components.
 *
 * @returns {Promise<object>} Response object with component data or error information
 * @property {boolean} success - Whether the operation was successful
 * @property {number} [count] - Number of components found (only if successful)
 * @property {Array<object>} [components] - Array of component details (only if successful)
 * @property {string} components[].key - Unique key of the component in the team library
 * @property {string} components[].name - Display name of the component
 * @property {string} components[].description - Component description from the library
 * @property {string} components[].libraryName - Name of the team library containing the component
 * @property {boolean} [error] - Whether an error occurred
 * @property {string} [message] - Error message if applicable
 * @property {boolean} [apiAvailable] - Whether the team library API is available
 * @property {string} [stack] - Error stack trace if available
 *
 * @throws Returns error object instead of throwing if API is unavailable or retrieval fails
 */
async function getRemoteComponents() {
  try {
    // Check if figma.teamLibrary is available
    if (!figma.teamLibrary) {
      console.error("Error: figma.teamLibrary API is not available");
      return {
        error: true,
        message: "The figma.teamLibrary API is not available in this context",
        apiAvailable: false
      };
    }
    
    // Check if figma.teamLibrary.getAvailableComponentsAsync exists
    if (!figma.teamLibrary.getAvailableComponentsAsync) {
      console.error("Error: figma.teamLibrary.getAvailableComponentsAsync is not available");
      return {
        error: true,
        message: "The getAvailableComponentsAsync method is not available",
        apiAvailable: false
      };
    }
    
    console.log("Starting remote components retrieval...");
    
    // Set up a manual timeout to detect deadlocks
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Internal timeout while retrieving remote components (15s)"));
      }, 15000); // 15 seconds internal timeout
    });
    
    // Execute the request with a manual timeout
    const fetchPromise = figma.teamLibrary.getAvailableComponentsAsync();
    
    // Use Promise.race to implement the timeout
    const teamComponents = await Promise.race([fetchPromise, timeoutPromise])
      .finally(() => {
        clearTimeout(timeoutId); // Clear the timeout
      });
    
    console.log(`Retrieved ${teamComponents.length} remote components`);
    
    return {
      success: true,
      count: teamComponents.length,
      components: teamComponents.map(component => ({
        key: component.key,
        name: component.name,
        description: component.description || "",
        libraryName: component.libraryName
      }))
    };
  } catch (error) {
    console.error(`Detailed error retrieving remote components: ${error.message || "Unknown error"}`);
    console.error(`Stack trace: ${error.stack || "Not available"}`);
    
    return {
      error: true,
      message: `Error retrieving remote components: ${error.message}`,
      stack: error.stack,
      apiAvailable: true,
      methodExists: true
    };
  }
}

/**
 * Creates an instance of a component from either local components or team libraries. 
 * 
 * First imports the component by its key, then creates an instance at the specified
 * coordinates. The instance is automatically added to the current page.
 *
 * @param {object} params - Instance creation parameters
 * @param {string} params.componentKey - Unique key identifying the component to instantiate
 * @param {number} [params.x=0] - X coordinate for placement in the current page
 * @param {number} [params.y=0] - Y coordinate for placement in the current page
 *
 * @returns {Promise<object>} Created instance details
 * @property {string} id - Unique node ID of the created instance
 * @property {string} name - Name of the instance (inherited from component)
 * @property {number} x - Final X coordinate of the instance
 * @property {number} y - Final Y coordinate of the instance
 * @property {number} width - Width of the instance
 * @property {number} height - Height of the instance
 * @property {string} componentId - ID of the master component this is an instance of
 *
 * @throws {Error} If componentKey is missing or component import fails
 * @throws {Error} If instance creation or placement fails
 */
async function createComponentInstance(params) {
  const { componentKey, x = 0, y = 0 } = params || {};

  if (!componentKey) {
    throw new Error("Missing componentKey parameter");
  }

  try {
    const component = await figma.importComponentByKeyAsync(componentKey);
    const instance = component.createInstance();

    instance.x = x;
    instance.y = y;

    figma.currentPage.appendChild(instance);

    return {
      id: instance.id,
      name: instance.name,
      x: instance.x,
      y: instance.y,
      width: instance.width,
      height: instance.height,
      componentId: instance.componentId,
    };
  } catch (error) {
    throw new Error(`Error creating component instance: ${error.message}`);
  }
}

/**
 * Exports a Figma node (frame, component, instance, etc.) as an image. 
 * 
 * Supports multiple formats and custom scaling. The image data is returned
 * as a base64-encoded string suitable for data URLs or further processing.
 *
 * @param {object} params - Export configuration
 * @param {string} params.nodeId - ID of the node to * @param {('PNG'|'JPG'|'SVG'|'PDF')} [params.format='PNG'] - Output format
 * @param {number} [params.scale=1] - Export scale factor (1 = 100%)
 *
 * @returns {Promise<object>} Export result
 * @property {string} nodeId - ID of the exported node
 * @property {string} format - Format used for the * @property {number} scale - Scale factor used
 * @property {string} mimeType - MIME type of the exported data
 * @property {string} imageData - Base64-encoded image data
 *
 * @throws {Error} If node is not found
 * @throws {Error} If node doesn't support exporting
 * @throws {Error} If operation fails
 */
async function exportNodeAsImage(params) {
  const { nodeId, scale = 1 } = params || {};
  const format = "PNG";

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("exportAsync" in node)) {
    throw new Error(`Node does not support exporting: ${nodeId}`);
  }

  try {
    const settings = {
      format: format,
      constraint: { type: "SCALE", value: scale },
    };

    const bytes = await node.exportAsync(settings);

    let mimeType;
    switch (format) {
      case "PNG":
        mimeType = "image/png";
        break;
      case "JPG":
        mimeType = "image/jpeg";
        break;
      case "SVG":
        mimeType = "image/svg+xml";
        break;
      case "PDF":
        mimeType = "application/pdf";
        break;
      default:
        mimeType = "application/octet-stream";
    }

    // Convert Uint8Array to base64
    const base64 = customBase64Encode(bytes);

    return {
      nodeId,
      format,
      scale,
      mimeType,
      imageData: base64,
    };
  } catch (error) {
    throw new Error(`Error exporting node as image: ${error.message}`);
  }
}

/**
 * Collection of all component-related operations exposed by this module.
 * Use this object to access the component manipulation functions.
 */
const componentOperations = {
  getLocalComponents,
  getRemoteComponents,
  createComponentInstance,
  exportNodeAsImage
};


// ----- layout Module -----
/**
 * Layout module for configuring Figma node layouts and grouping operations.
 * This module provides functionality for auto-layout configuration, resizing,
 * and node grouping/ungrouping operations.
 */

/**
 * Sets auto layout properties on a node in Figma.
 * Auto layout allows for automatic arrangement and spacing of child elements
 * within a parent frame or group.
 *
 * @param {object} params - Auto layout configuration parameters
 * @param {string} params.nodeId - The ID of the node to configure
 * @param {('NONE'|'HORIZONTAL'|'VERTICAL')} params.layoutMode - Layout direction:
 *   - NONE: Disables auto layout
 *   - HORIZONTAL: Arranges items in a row
 *   - VERTICAL: Arranges items in a column
 * @param {number} [params.paddingTop] - Top padding in pixels
 * @param {number} [params.paddingBottom] - Bottom padding in pixels
 * @param {number} [params.paddingLeft] - Left padding in pixels
 * @param {number} [params.paddingRight] - Right padding in pixels
 * @param {number} [params.itemSpacing] - Spacing between items in pixels
 * @param {('MIN'|'CENTER'|'MAX'|'SPACE_BETWEEN')} [params.primaryAxisAlignItems] - Primary axis alignment:
 *   - MIN: Aligns to start
 *   - CENTER: Centers items
 *   - MAX: Aligns to end
 *   - SPACE_BETWEEN: Distributes space between items
 * @param {('MIN'|'CENTER'|'MAX')} [params.counterAxisAlignItems] - Counter axis alignment:
 *   - MIN: Aligns to start
 *   - CENTER: Centers items
 *   - MAX: Aligns to end
 * @param {('WRAP'|'NO_WRAP')} [params.layoutWrap] - Whether items should wrap to new lines
 * @param {boolean} [params.strokesIncludedInLayout] - Whether strokes affect layout spacing
 *
 * @returns {object} Updated auto layout properties including:
 *   - id: Node ID
 *   - name: Node name
 *   - layoutMode: Current layout mode
 *   - padding values
 *   - itemSpacing
 *   - alignment settings
 *   - wrap mode
 *   - stroke inclusion setting
 *
 * @throws {Error} If node is not found or doesn't support auto layout
 * 
 * @example
 * // Configure horizontal auto layout with padding and spacing
 * await setAutoLayout({
 *   nodeId: "123:456",
 *   layoutMode: "HORIZONTAL",
 *   paddingAll: 16,
 *   itemSpacing: 8,
 *   primaryAxisAlignItems: "SPACE_BETWEEN"
 * });
 */
async function setAutoLayout(params) {
  const { 
    nodeId, 
    layoutMode, 
    paddingTop, 
    paddingBottom, 
    paddingLeft, 
    paddingRight, 
    itemSpacing, 
    primaryAxisAlignItems, 
    counterAxisAlignItems, 
    layoutWrap, 
    strokesIncludedInLayout 
  } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (!layoutMode) {
    throw new Error("Missing layoutMode parameter");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  // Check if the node is a frame or group
  if (!("layoutMode" in node)) {
    throw new Error(`Node does not support auto layout: ${nodeId}`);
  }

  // Configure layout mode
  if (layoutMode === "NONE") {
    node.layoutMode = "NONE";
  } else {
    // Set auto layout properties
    node.layoutMode = layoutMode;
    
    // Configure padding if provided
    if (paddingTop !== undefined) node.paddingTop = paddingTop;
    if (paddingBottom !== undefined) node.paddingBottom = paddingBottom;
    if (paddingLeft !== undefined) node.paddingLeft = paddingLeft;
    if (paddingRight !== undefined) node.paddingRight = paddingRight;
    
    // Configure item spacing
    if (itemSpacing !== undefined) node.itemSpacing = itemSpacing;
    
    // Configure alignment
    if (primaryAxisAlignItems !== undefined) {
      node.primaryAxisAlignItems = primaryAxisAlignItems;
    }
    
    if (counterAxisAlignItems !== undefined) {
      node.counterAxisAlignItems = counterAxisAlignItems;
    }
    
    // Configure wrap
    if (layoutWrap !== undefined) {
      node.layoutWrap = layoutWrap;
    }
    
    // Configure stroke inclusion
    if (strokesIncludedInLayout !== undefined) {
      node.strokesIncludedInLayout = strokesIncludedInLayout;
    }
  }

  return {
    id: node.id,
    name: node.name,
    layoutMode: node.layoutMode,
    paddingTop: node.paddingTop,
    paddingBottom: node.paddingBottom,
    paddingLeft: node.paddingLeft,
    paddingRight: node.paddingRight,
    itemSpacing: node.itemSpacing,
    primaryAxisAlignItems: node.primaryAxisAlignItems,
    counterAxisAlignItems: node.counterAxisAlignItems,
    layoutWrap: node.layoutWrap,
    strokesIncludedInLayout: node.strokesIncludedInLayout
  };
}

/**
 * Adjusts auto-layout resizing behavior for a node along a specified axis.
 * This function controls how a node and its children resize within an auto-layout container.
 *
 * @param {object} params - Resizing configuration parameters
 * @param {string} params.nodeId - The node's unique identifier
 * @param {('horizontal'|'vertical')} params.axis - The axis to configure:
 *   - horizontal: Affects width/horizontal layout
 *   - vertical: Affects height/vertical layout
 * @param {('HUG'|'FIXED'|'FILL')} params.mode - The sizing behavior:
 *   - HUG: Node sizes to fit its content
 *   - FIXED: Node maintains a specific size
 *   - FILL: Node expands to fill available space
 *
 * @returns {object} Current sizing configuration:
 *   - id: Node ID
 *   - primaryAxisSizingMode: Primary axis sizing behavior
 *   - counterAxisSizingMode: Counter axis sizing behavior
 *
 * @throws {Error} If node not found or parameters invalid
 * 
 * @example
 * // Make a node fill available horizontal space
 * await setAutoLayoutResizing({
 *   nodeId: "123:456",
 *   axis: "horizontal",
 *   mode: "FILL"
 * });
 */
async function setAutoLayoutResizing(params) {
  const { nodeId, axis, mode } = params || {};
  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  if (!axis || (axis !== "horizontal" && axis !== "vertical")) {
    throw new Error("Invalid or missing axis parameter");
  }
  if (!mode || !["HUG", "FIXED", "FILL"].includes(mode)) {
    throw new Error("Invalid or missing mode parameter");
  }
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node || !("primaryAxisSizingMode" in node)) {
    throw new Error(`Node ${nodeId} does not support auto layout`);
  }
  if (mode === "HUG") {
    if (axis === "horizontal") {
      node.primaryAxisSizingMode = "AUTO";
    } else {
      node.counterAxisSizingMode = "AUTO";
    }
    for (const child of node.children) {
      if (axis === "horizontal") {
        if (node.layoutMode === "HORIZONTAL" && "layoutGrow" in child) {
          child.layoutGrow = 0;
        }
        if (node.layoutMode !== "HORIZONTAL" && "layoutAlign" in child) {
          child.layoutAlign = "INHERIT";
        }
      } else {
        if (node.layoutMode === "VERTICAL" && "layoutGrow" in child) {
          child.layoutGrow = 0;
        }
        if (node.layoutMode !== "VERTICAL" && "layoutAlign" in child) {
          child.layoutAlign = "INHERIT";
        }
      }
    }
  } else if (mode === "FILL") {
    if (axis === "horizontal") {
      node.primaryAxisSizingMode = "AUTO";
    } else {
      node.counterAxisSizingMode = "AUTO";
    }
    for (const child of node.children) {
      if (axis === "horizontal") {
        if (node.layoutMode === "HORIZONTAL" && "layoutGrow" in child) {
          child.layoutGrow = 1;
        }
        if (node.layoutMode !== "HORIZONTAL" && "layoutAlign" in child) {
          child.layoutAlign = "STRETCH";
        }
      } else {
        if (node.layoutMode === "VERTICAL" && "layoutGrow" in child) {
          child.layoutGrow = 1;
        }
        if (node.layoutMode !== "VERTICAL" && "layoutAlign" in child) {
          child.layoutAlign = "STRETCH";
        }
      }
    }
  } else {
    if (axis === "horizontal") {
      node.primaryAxisSizingMode = "FIXED";
    } else {
      node.counterAxisSizingMode = "FIXED";
    }
  }
  return {
    id: node.id,
    primaryAxisSizingMode: node.primaryAxisSizingMode,
    counterAxisSizingMode: node.counterAxisSizingMode
  };
}

/**
 * Groups multiple Figma nodes into a single group.
 * Grouped nodes maintain their relative positions but can be moved and manipulated together.
 *
 * @param {object} params - Grouping parameters
 * @param {string[]} params.nodeIds - Array of node IDs to group
 * @param {string} [params.name] - Optional name for the new group
 *
 * @returns {object} New group details:
 *   - id: Group node ID
 *   - name: Group name
 *   - type: Node type (always "GROUP")
 *   - children: Array of grouped node details
 *
 * @throws {Error} If:
 *   - Fewer than 2 nodes provided
 *   - Any node not found
 *   - Nodes have different parents
 *   - Grouping operation fails
 * 
 * @example
 * // Group three nodes together
 * await groupNodes({
 *   nodeIds: ["123:456", "123:457", "123:458"],
 *   name: "Button Group"
 * });
 */
async function groupNodes(params) {
  const { nodeIds, name } = params || {};
  
  if (!nodeIds || !Array.isArray(nodeIds) || nodeIds.length < 2) {
    throw new Error("Must provide at least two nodeIds to group");
  }
  
  try {
    // Get all nodes to be grouped
    const nodesToGroup = [];
    for (const nodeId of nodeIds) {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) {
        throw new Error(`Node not found with ID: ${nodeId}`);
      }
      nodesToGroup.push(node);
    }
    
    // Verify that all nodes have the same parent
    const parent = nodesToGroup[0].parent;
    for (const node of nodesToGroup) {
      if (node.parent !== parent) {
        throw new Error("All nodes must have the same parent to be grouped");
      }
    }
    
    // Create a group and add the nodes to it
    const group = figma.group(nodesToGroup, parent);
    
    // Optionally set a name for the group
    if (name) {
      group.name = name;
    }
    
    return {
      id: group.id,
      name: group.name,
      type: group.type,
      children: group.children.map(child => ({ id: child.id, name: child.name, type: child.type }))
    };
  } catch (error) {
    throw new Error(`Error grouping nodes: ${error.message}`);
  }
}

/**
 * Ungroups a Figma group or frame, promoting its children to the parent level.
 * This is the reverse of the groupNodes operation.
 *
 * @param {object} params - Ungrouping parameters
 * @param {string} params.nodeId - ID of group/frame to ungroup
 *
 * @returns {object} Ungrouping results:
 *   - success: Operation success status
 *   - ungroupedCount: Number of items ungrouped
 *   - items: Array of ungrouped node details
 *
 * @throws {Error} If:
 *   - Node not found
 *   - Node is not a group or frame
 *   - Ungrouping operation fails
 * 
 * @example
 * // Ungroup a group of elements
 * await ungroupNodes({
 *   nodeId: "123:456"
 * });
 */
async function ungroupNodes(params) {
  const { nodeId } = params || {};
  
  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  
  try {
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) {
      throw new Error(`Node not found with ID: ${nodeId}`);
    }
    
    // Verify that the node is a group or a frame
    if (node.type !== "GROUP" && node.type !== "FRAME") {
      throw new Error(`Node with ID ${nodeId} is not a GROUP or FRAME`);
    }
    
    // Get the parent and children before ungrouping
    const parent = node.parent;
    const children = [...node.children];
    
    // Ungroup the node
    const ungroupedItems = figma.ungroup(node);
    
    return {
      success: true,
      ungroupedCount: ungroupedItems.length,
      items: ungroupedItems.map(item => ({ id: item.id, name: item.name, type: item.type }))
    };
  } catch (error) {
    throw new Error(`Error ungrouping node: ${error.message}`);
  }
}

/**
 * Inserts a child node into a parent node at an optional index position.
 * This allows for precise control over node hierarchy and ordering.
 *
 * @param {object} params - Insertion parameters
 * @param {string} params.parentId - ID of the parent node
 * @param {string} params.childId - ID of the child node to insert
 * @param {number} [params.index] - Optional insertion index (0-based)
 *
 * @returns {object} Insertion results:
 *   - parentId: Parent node ID
 *   - childId: Child node ID
 *   - index: Final insertion index
 *   - success: Operation success status
 *   - previousParentId: Previous parent's ID (if node was moved)
 *
 * @throws {Error} If:
 *   - Parent/child not found
 *   - Parent cannot accept children
 *   - Insertion operation fails
 * 
 * @example
 * // Insert a node as the first child
 * await insertChild({
 *   parentId: "123:456",
 *   childId: "123:457",
 *   index: 0
 * });
 */
async function insertChild(params) {
  const { parentId, childId, index } = params || {};
  
  if (!parentId) {
    throw new Error("Missing parentId parameter");
  }
  
  if (!childId) {
    throw new Error("Missing childId parameter");
  }
  
  try {
    // Get the parent and child nodes
    const parent = await figma.getNodeByIdAsync(parentId);
    if (!parent) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    
    const child = await figma.getNodeByIdAsync(childId);
    if (!child) {
      throw new Error(`Child node not found with ID: ${childId}`);
    }
    
    // Check if the parent can have children
    if (!("appendChild" in parent)) {
      throw new Error(`Parent node with ID ${parentId} cannot have children`);
    }
    
    // Save child's current parent for proper handling
    const originalParent = child.parent;
    
    // Insert the child at the specified index or append it
    if (index !== undefined && index >= 0 && index <= parent.children.length) {
      parent.insertChild(index, child);
    } else {
      parent.appendChild(child);
    }
    
    // Verify that the insertion worked
    const newIndex = parent.children.indexOf(child);
    
    return {
      parentId: parent.id,
      childId: child.id,
      index: newIndex,
      success: newIndex !== -1,
      previousParentId: originalParent ? originalParent.id : null
    };
  } catch (error) {
    throw new Error(`Error inserting child: ${error.message}`);
  }
}

// Helper functions for auto layout resizing
/**
 * Sets a node to fill its container along the specified axis.
 * 
 * @param {object} node - The node to modify.
 * @param {string} axis - The axis to apply fill ("horizontal" or "vertical").
 * @private
 */
function setFillContainer(node, axis) {
  const parent = node.parent;
  if (!parent || parent.layoutMode === 'NONE') return;

  if (axis === 'horizontal') {
    parent.layoutMode === 'HORIZONTAL'
      ? node.layoutGrow = 1
      : node.layoutAlign = 'STRETCH';
  } else {
    parent.layoutMode === 'VERTICAL'
      ? node.layoutGrow = 1
      : node.layoutAlign = 'STRETCH';
  }
}

/**
 * Sets a node to hug its contents along the specified axis.
 * 
 * @param {object} node - The node to modify.
 * @param {string} axis - The axis to apply hug ("horizontal" or "vertical").
 * @private
 */
function setHugContents(node, axis) {
  const parent = node.parent;
  if (!parent || parent.layoutMode === 'NONE') return;

  if (axis === 'horizontal') {
    parent.layoutMode === 'HORIZONTAL'
      ? node.layoutGrow = 0
      : node.layoutAlign = 'INHERIT';
  } else {
    parent.layoutMode === 'VERTICAL'
      ? node.layoutGrow = 0
      : node.layoutAlign = 'INHERIT';
  }
}

/**
 * Sets a fixed size for a node along the specified axis.
 * 
 * @param {object} node - The node to resize.
 * @param {string} axis - The axis to resize ("horizontal" or "vertical").
 * @param {number} size - The size to set.
 * @private
 */
function setFixedSize(node, axis, size) {
  if (axis === 'horizontal') {
    node.resize(size, node.height);
    node.layoutGrow = 0;
  } else {
    node.resize(node.width, size);
    node.layoutGrow = 0;
  }
}

// Export the operations as a group
const layoutOperations = {
  setAutoLayout,
  setAutoLayoutResizing,
  groupNodes,
  ungroupNodes,
  insertChild
};


// ----- rename Module -----
// Rename module - Collection of functions for renaming Figma layers with various strategies

/**
 * Rename Multiple Figma Layers
 * 
 * Renames multiple layers in a Figma document using either template-based naming or regex pattern replacement.
 * Template naming supports special placeholders:
 * - ${current}: The current name of the layer
 * - ${asc}: Ascending number (1, 2, 3...)
 * - ${desc}: Descending number (total, total-1...)
 *
 * @param {object} params - Parameters for renaming operation
 * @param {string[]} params.layer_ids - Array of Figma layer IDs to rename
 * @param {string} [params.new_name] - Template string for new names. Uses placeholders ${current}, ${asc}, ${desc}
 * @param {string} [params.match_pattern] - Regex pattern to find in existing names. Used with replace_with
 * @param {string} [params.replace_with] - Replacement string for regex matches. Used with match_pattern
 *
 * @returns {Promise<object>} Object containing:
 *   - success: boolean indicating if operation completed
 *   - renamed_count: number of layers successfully renamed
 *
 * @throws {Error} When:
 *   - Any target layer is locked or hidden
 *   - A layer ID cannot be found
 *   - A layer lacks the name property
 *
 * @example Template-based renaming:
 * await rename_layers({
 *   layer_ids: ['id1', 'id2', 'id3'],
 *   new_name: "Component ${asc} - ${current}"
 * });
 * // Results: "Component 1 - Original", "Component 2 - Original2"...
 *
 * @example Regex-based renaming:
 * await rename_layers({
 *   layer_ids: ['id1', 'id2'],
 *   match_pattern: "Button\\s*-\\s*",
 *   replace_with: "btn_"
 * });
 * // "Button - Save" becomes "btn_Save"
 */
async function rename_layers(params) {
  const { layer_ids, new_name, match_pattern, replace_with } = params || {};
  
  const nodes = await Promise.all(
    layer_ids.map(id => figma.getNodeByIdAsync(id))
  );
  
  const total = nodes.length;
  
  nodes.forEach((node, i) => {
    // Skip nodes that are not valid or lack a name property
    if (!node || !('name' in node)) return;
    
    // Do not allow renaming of nodes that are hidden or locked
    if (!node.visible || node.locked) {
      throw new Error('Cannot rename locked or hidden layer: ' + node.id);
    }
    
    // Apply regex replacement mode if both parameters are provided
    if (match_pattern && replace_with) {
      node.name = node.name.replace(new RegExp(match_pattern), replace_with);
    } else {
      // Otherwise, generate a new name using the template and placeholders
      let base = new_name;
      base = base.replace(/\${current}/g, node.name);
      base = base.replace(/\${asc}/g, (i + 1).toString());
      base = base.replace(/\${desc}/g, (total - i).toString());
      node.name = base;
    }
  });
  
  return { success: true, renamed_count: total };
}

/**
 * Rename Multiple Figma Layers Using AI Assistance
 *
 * Leverages Figma's AI capabilities to intelligently rename layers based on their content
 * and context. Useful for batch renaming layers to follow naming conventions or improve clarity.
 *
 * @param {object} params - Parameters for AI-assisted renaming
 * @param {string[]} params.layer_ids - Array of Figma layer IDs to rename
 * @param {string} params.context_prompt - Instructions for AI renaming. Can include:
 *   - Naming conventions to follow
 *   - Style guidelines
 *   - Specific terminology preferences
 *
 * @returns {Promise<object>} Object containing:
 *   - success: boolean indicating if operation succeeded
 *   - names: array of new names (if successful)
 *   - error: error message (if failed)
 *
 * @example Using specific naming conventions:
 * await ai_rename_layers({
 *   layer_ids: ['nodeId1', 'nodeId2'],
 *   context_prompt: "Rename components using atomic design principles (atoms, molecules, organisms)"
 * });
 *
 * @example Improving descriptiveness:
 * await ai_rename_layers({
 *   layer_ids: ['nodeId1', 'nodeId2'],
 *   context_prompt: "Make layer names more descriptive based on their visual appearance and function"
 * });
 */
async function ai_rename_layers(params) {
  const { layer_ids, context_prompt } = params || {};
  
  const nodes = await Promise.all(
    layer_ids.map(id => figma.getNodeByIdAsync(id))
  );
  
  const result = await figma.ai.renameLayersAsync(nodes, {
    context: context_prompt
  });
  
  if (result.status === 'SUCCESS') {
    return { success: true, names: result.names };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Rename a Single Figma Layer
 *
 * Renames an individual Figma node with special handling for text nodes.
 * For text nodes, offers control over the auto-rename feature which automatically
 * updates the layer name when text content changes.
 *
 * @param {object} params - Parameters for renaming
 * @param {string} params.nodeId - ID of the Figma node to rename
 * @param {string} params.newName - New name to assign to the node
 * @param {boolean} [params.setAutoRename] - For TEXT nodes only:
 *   - true: layer name updates automatically with text content
 *   - false: layer name remains fixed regardless of content changes
 *
 * @returns {Promise<object>} Object containing:
 *   - success: boolean indicating success
 *   - nodeId: ID of the renamed node
 *   - originalName: previous name of the node
 *   - newName: updated name of the node
 *
 * @throws {Error} When:
 *   - Node with given ID cannot be found
 *   - Node is locked or hidden
 *
 * @example Renaming with auto-rename disabled:
 * await rename_layer({
 *   nodeId: "123:456",
 *   newName: "Header Text",
 *   setAutoRename: false
 * });
 */
async function rename_layer(params) {
  const { nodeId, newName, setAutoRename } = params || {};
  
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node with ID ${nodeId} not found`);
  
  const originalName = node.name;
  node.name = newName;
  
  if (node.type === 'TEXT' && setAutoRename !== undefined) {
    node.autoRename = Boolean(setAutoRename);
  }
  
  return { success: true, nodeId, originalName, newName: node.name };
}

/**
 * Rename Multiple Figma Layers with Individual Names
 *
 * Assigns specific names to multiple layers in a single operation.
 * Useful when each layer needs a unique, predetermined name.
 *
 * @param {object} params - Parameters for batch renaming
 * @param {string[]} params.layer_ids - Array of layer IDs to rename
 * @param {string[]} params.new_names - Array of new names to assign
 *   Must match layer_ids array in length and order
 *
 * @returns {Promise<object>} Object containing:
 *   - success: boolean indicating overall success
 *   - results: array of objects with:
 *     - nodeId: ID of the processed node
 *     - status: "renamed" or "error"
 *     - result: details of rename operation or error message
 *
 * @throws {Error} When:
 *   - layer_ids or new_names are not arrays
 *   - Arrays have different lengths
 *
 * @example Renaming multiple layers:
 * await rename_multiples({
 *   layer_ids: ['id1', 'id2'],
 *   new_names: ['Header Section', 'Navigation Menu']
 * });
 */
async function rename_multiples(params) {
  const { layer_ids, new_names } = params || {};
  
  if (!Array.isArray(layer_ids) || !Array.isArray(new_names)) {
    throw new Error("layer_ids and new_names must be arrays");
  }
  
  if (layer_ids.length !== new_names.length) {
    throw new Error("layer_ids and new_names must be of equal length");
  }
  
  const results = [];
  
  for (let i = 0; i < layer_ids.length; i++) {
    const nodeId = layer_ids[i];
    const newName = new_names[i];
    try {
      const result = await rename_layer({ nodeId, newName });
      results.push({ nodeId, status: "renamed", result });
    } catch (error) {
      results.push({ nodeId, status: "error", error: error.message || String(error) });
    }
  }
  
  return { success: true, results };
}

// Export all rename operations as a grouped object for convenience
const renameOperations = {
  rename_layers,
  ai_rename_layers,
  rename_layer,
  rename_multiples
};


// ----- commands Module -----
/**
 * Command Registry and Handler Module
 * 
 * This module manages the registration and execution of all available commands in the Figma plugin.
 * It provides a centralized system for registering command handlers and routing incoming commands
 * to their appropriate implementations.
 */


// Internal registry to store command handlers
const commandRegistry = {};

/**
 * Registers a command function with the specified name in the command registry
 * 
 * @param {string} name - The command name to register (e.g., 'create_rectangle', 'set_text_content')
 * @param {Function} fn - The handler function to execute for this command
 * @throws {Error} If the command name is already registered
 */
function registerCommand(name, fn) {
  commandRegistry[name] = fn;
}

/**
 * Initializes and registers all available commands in the plugin
 * This function is called once during plugin initialization to set up the command system
 * Commands are organized by functional categories for better maintainability
 */
function initializeCommands() {
  // Document Operations
  // Handles document-level operations like getting document info and selection state
  registerCommand('get_document_info', documentOperations.getDocumentInfo);
  registerCommand('get_selection', documentOperations.getSelection);
  registerCommand('get_node_info', documentOperations.getNodeInfo);
  registerCommand('get_nodes_info', documentOperations.getNodesInfo);
  
  // Shape Operations
  // Manages creation and modification of basic geometric shapes and vectors
  registerCommand('create_rectangle', shapeOperations.createRectangle);
  registerCommand('create_frame', shapeOperations.createFrame);
  registerCommand('create_frames', shapeOperations.createFrames);
  registerCommand('create_ellipse', shapeOperations.createEllipse);
  registerCommand('create_polygon', shapeOperations.createPolygon);
  registerCommand('create_star', shapeOperations.createStar);
  registerCommand('create_vector', shapeOperations.createVector);
  registerCommand('create_line', shapeOperations.createLine);
  registerCommand('create_lines', shapeOperations.createLines);
  registerCommand('insert_svg_vector', shapeOperations.createSvgVector);
  registerCommand('create_rectangles', shapeOperations.createRectangles);
  registerCommand('set_corner_radius', shapeOperations.setCornerRadius);
  registerCommand('resize_node', shapeOperations.resizeNode);
  registerCommand('resize_nodes', shapeOperations.resizeNodes);
  registerCommand('delete_node', shapeOperations.deleteNode);
  registerCommand('delete_nodes', shapeOperations.deleteNodes);
  registerCommand('move_node', shapeOperations.moveNode);
  registerCommand('move_nodes', shapeOperations.moveNodes);
  registerCommand('flatten_node', shapeOperations.flattenNode);
  registerCommand('clone_node', shapeOperations.cloneNode);
  // Clone multiple nodes
  registerCommand('clone_nodes', shapeOperations.cloneNodes);
  
  // Text Operations
  // Handles text creation, styling, and manipulation operations
  registerCommand('create_text', textOperations.createText);
  registerCommand('set_text_content', textOperations.setTextContent);
  registerCommand('scan_text_nodes', textOperations.scanTextNodes);
  registerCommand('set_multiple_text_contents', textOperations.setMultipleTextContents);
  registerCommand('set_font_name', textOperations.setFontName);
  registerCommand('set_font_size', textOperations.setFontSize);
  registerCommand('set_font_weight', textOperations.setFontWeight);
  registerCommand('set_letter_spacing', textOperations.setLetterSpacing);
  registerCommand('set_line_height', textOperations.setLineHeight);
  registerCommand('set_paragraph_spacing', textOperations.setParagraphSpacing);
  registerCommand('set_text_case', textOperations.setTextCase);
  registerCommand('set_text_decoration', textOperations.setTextDecoration);
  registerCommand('get_styled_text_segments', textOperations.getStyledTextSegments);
  registerCommand('load_font_async', textOperations.loadFontAsyncWrapper);
  registerCommand('set_bulk_font', textOperations.setBulkFont);
  
  // Style Operations
  // Controls visual styling like fills, strokes, and effects
  registerCommand('set_fill_color', styleOperations.setFillColor);
  registerCommand('set_stroke_color', styleOperations.setStrokeColor);
  registerCommand('get_styles', styleOperations.getStyles);
  registerCommand('set_effects', styleOperations.setEffects);
  registerCommand('set_effect_style_id', styleOperations.setEffectStyleId);
  registerCommand('set_style', styleOperations.setStyle);
  registerCommand('set_styles', styleOperations.setStyles);
  
  // Component Operations
  // Manages Figma components and their instances
  registerCommand('get_local_components', componentOperations.getLocalComponents);
  registerCommand('get_remote_components', componentOperations.getRemoteComponents);
  registerCommand('create_component_instance', componentOperations.createComponentInstance);
  registerCommand('export_node_as_image', componentOperations.exportNodeAsImage);
  
  // Layout Operations
  // Controls layout properties, grouping, and hierarchy
  registerCommand('set_auto_layout', layoutOperations.setAutoLayout);
  registerCommand('set_auto_layout_resizing', layoutOperations.setAutoLayoutResizing);
  registerCommand('group_nodes', layoutOperations.groupNodes);
  registerCommand('ungroup_nodes', layoutOperations.ungroupNodes);
  registerCommand('insert_child', layoutOperations.insertChild);
  
  // Rename Operations
  // Handles layer naming and batch renaming functionality
  registerCommand('rename_layers', renameOperations.rename_layers);
  registerCommand('ai_rename_layers', renameOperations.ai_rename_layers);
  registerCommand('rename_layer', renameOperations.rename_layer);
  registerCommand('rename_multiple', renameOperations.rename_multiples);
}

/**
 * Handles an incoming command by routing it to the appropriate registered handler function
 * 
 * @param {string} command - The name of the command to execute
 * @param {object} params - Parameters object containing command-specific arguments
 * @returns {Promise<any>} Result of the command execution
 * @throws {Error} If the command is not registered or execution fails
 * 
 * @example
 * // Example usage:
 * await handleCommand('create_rectangle', { x: 0, y: 0, width: 100, height: 100 });
 */
async function handleCommand(command, params) {
  console.log(`Received command: ${command}`);
  
  if (!commandRegistry[command]) {
    throw new Error(`Unknown command: ${command}`);
  }
  
  return await commandRegistry[command](params);
}

/**
 * @typedef {Object} CommandOperations
 * @property {Function} initializeCommands - Initializes all available commands
 * @property {Function} handleCommand - Handles execution of a specific command
 */

/** @type {CommandOperations} */
const commandOperations = {
  initializeCommands,
  handleCommand
};


// ----- Main Plugin Code -----
/**
 * Main entry point for the Figma plugin that enables communication with Claude AI.
 * This plugin acts as a bridge between Figma and the Model Context Protocol (MCP) server,
 * allowing AI-driven manipulation of Figma documents.
 */

// Import core operation modules for different Figma capabilities

// Initialize plugin UI with a fixed size window
figma.showUI(__html__, { width: 350, height: 450 });

// Set up command handlers for all supported operations
initializeCommands();

/**
 * Message handler for UI events. Processes different types of messages:
 * - update-settings: Updates plugin configuration
 * - notify: Shows notification in Figma
 * - close-plugin: Terminates the plugin
 * - execute-command: Processes commands received via WebSocket from the MCP server
 */
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case "update-settings":
      updateSettings(msg);
      break;
    case "notify":
      figma.notify(msg.message);
      break;
    case "close-plugin":
      figma.closePlugin();
      break;
    case "execute-command":
      try {
        // Execute the received command and collect results
        const result = await handleCommand(msg.command, msg.params);
        // Send command execution results back to UI
        figma.ui.postMessage({
          type: "command-result",
          id: msg.id,
          result,
        });
      } catch (error) {
        // Handle and report any errors during command execution
        figma.ui.postMessage({
          type: "command-error",
          id: msg.id,
          error: error.message || "Error executing command",
        });
      }
      break;
  }
};

// Handle plugin activation from Figma menu
figma.on("run", ({ command }) => {
  // Trigger automatic WebSocket connection when plugin starts
  figma.ui.postMessage({ type: "auto-connect" });
});

// Perform initial plugin setup and configuration
initializePlugin();
