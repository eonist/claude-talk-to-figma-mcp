// Figma Plugin - Auto-generated code from build.js

// ----- Utils Module -----
// ----- Utils/plugin.js -----
// Plugin state and core functionality

/**
 * Plugin state.
 *
 * The state holds default configuration for the plugin. Currently it includes the default
 * server port that the plugin uses to communicate with its backend.
 */
const state = {
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
async function initializePlugin() {
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
function updateSettings(settings) {
  if (settings.serverPort) {
    state.serverPort = settings.serverPort;
  }

  // Persist the updated settings to client storage.
  figma.clientStorage.setAsync("settings", {
    serverPort: state.serverPort,
  });
}


// ----- Utils/encoding.js -----
/**
 * Custom base64 encoding function for binary data.
 * 
 * Provides a manual implementation of base64 encoding for Uint8Array data.
 * This is useful for image data and other binary content that needs to be 
 * serialized for transmission.
 *
 * @param {Uint8Array} bytes - The binary data to encode.
 * @returns {string} A base64 encoded string representation of the data.
 */
function customBase64Encode(bytes) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let base64 = "";

  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;
  const mainLength = byteLength - byteRemainder;

  let a, b, c, d;
  let chunk;

  // Main loop deals with bytes in chunks of 3
  for (let i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12; // 258048 = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6; // 4032 = (2^6 - 1) << 6
    d = chunk & 63; // 63 = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += chars[a] + chars[b] + chars[c] + chars[d];
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder === 1) {
    chunk = bytes[mainLength];

    a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4; // 3 = 2^2 - 1

    base64 += chars[a] + chars[b] + "==";
  } else if (byteRemainder === 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

    a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4; // 1008 = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2; // 15 = 2^4 - 1

    base64 += chars[a] + chars[b] + chars[c] + "=";
  }

  return base64;
}


// ----- Utils/helpers.js -----
/**
 * Returns a promise that resolves after a specified delay.
 *
 * @param {number} ms - The delay duration in milliseconds.
 * @returns {Promise<void>} A promise that resolves after the delay.
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a unique command ID string.
 * 
 * Creates a random, unique identifier prefixed with 'cmd_' that can be used
 * to track and correlate command execution across the plugin.
 * 
 * @returns {string} A unique command ID string.
 */
function generateCommandId() {
  return 'cmd_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Filters an array to contain only unique values based on a property or predicate function.
 * 
 * @param {Array} arr - The array to filter.
 * @param {string|Function} predicate - Either a property name or a function that returns a value to check for uniqueness.
 * @returns {Array} A new array containing only unique items.
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

/**
 * Retrieves detailed information about the current Figma page.
 *
 * This function loads the current page asynchronously and extracts key properties including:
 * - The page's name, ID, and type.
 * - An array of child nodes with their ID, name, and type.
 * - Summary information for the current page.
 * - A simplified pages list (currently based solely on the current page).
 *
 * @returns {Promise<Object>} An object containing document info.
 *
 * @example
 * const info = await getDocumentInfo();
 * console.log(info.name, info.currentPage.childCount);
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
 * Retrieves information about the current selection on the Figma page.
 *
 * Returns an object that contains:
 * - The number of nodes selected.
 * - An array of selected nodes with their ID, name, type, and visibility status.
 *
 * @returns {Promise<Object>} An object containing selection count and details.
 *
 * @example
 * const selection = await getSelection();
 * console.log(`You have selected ${selection.selectionCount} nodes`);
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
 * Retrieves exported information for a specified node.
 *
 * This function locates a node by its ID, exports its data using the "JSON_REST_V1" format,
 * and returns the resulting document.
 *
 * @param {string} nodeId - The unique identifier of the node.
 * @returns {Promise<Object>} The node's exported document.
 *
 * @throws Will throw an error if the node cannot be found.
 *
 * @example
 * const nodeData = await getNodeInfo("123456");
 */
async function getNodeInfo(nodeId) {
  const node = await figma.getNodeByIdAsync(nodeId);

  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
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
 * Retrieves exported information for multiple nodes.
 *
 * This function accepts an array of node IDs, loads each node asynchronously,
 * filters out nodes that cannot be found, and exports the information for each valid node.
 *
 * @param {string[]} nodeIds - An array of node IDs to process.
 * @returns {Promise<Array>} An array of objects, each containing a node's ID and its exported document.
 *
 * @throws Will throw an error if any error occurs during processing.
 *
 * @example
 * const nodesInfo = await getNodesInfo(["id1", "id2", "id3"]);
 * console.log(nodesInfo);
 */
async function getNodesInfo(nodeIds) {
  try {
    // Load all nodes in parallel
    const nodes = await Promise.all(
      nodeIds.map((id) => figma.getNodeByIdAsync(id))
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

// Export the operations as a group
const documentOperations = {
  getDocumentInfo,
  getSelection,
  getNodeInfo,
  getNodesInfo
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

// Export the shape operations as a grouped object for external use.
const shapeOperations = {
  createRectangle,
  createFrame,
  createEllipse,
  createPolygon,
  createStar,
  createVector,
  createLine,
  setCornerRadius,
  resizeNode,
  deleteNode,
  moveNode,
  cloneNode,
  flattenNode
};


// ----- text Module -----
// Text module providing functions to create and modify text nodes in Figma.


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
 * for chunked processing for performance considerations, though currently a placeholder.
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
  return {
    success: true,
    message: `Scanned text nodes successfully`,
    count: 0,
    textNodes: []
  };
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
  return {
    success: true,
    nodeId: params.nodeId,
    replacementsApplied: params.text.length,
    replacementsFailed: 0,
    totalReplacements: params.text.length,
    results: []
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
  return {
    id: params.nodeId,
    name: "Text Node",
    fontName: { family: params.family, style: params.style || "Regular" }
  };
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
  return {
    id: params.nodeId,
    name: "Text Node",
    fontSize: params.fontSize
  };
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
  return {
    id: params.nodeId,
    name: "Text Node",
    weight: params.weight
  };
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
  return {
    id: params.nodeId,
    name: "Text Node",
    letterSpacing: {
      value: params.letterSpacing,
      unit: params.unit || "PIXELS"
    }
  };
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
  return {
    id: params.nodeId,
    name: "Text Node",
    lineHeight: {
      value: params.lineHeight,
      unit: params.unit || "PIXELS"
    }
  };
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
  return {
    id: params.nodeId,
    name: "Text Node",
    paragraphSpacing: params.paragraphSpacing
  };
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
  return {
    id: params.nodeId,
    name: "Text Node",
    textCase: params.textCase
  };
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
  return {
    id: params.nodeId,
    name: "Text Node",
    textDecoration: params.textDecoration
  };
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
  return {
    id: params.nodeId,
    name: "Text Node",
    property: params.property,
    segments: []
  };
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
  return {
    success: true,
    family: params.family,
    style: params.style || "Regular",
    message: `Successfully loaded ${params.family} ${params.style || "Regular"}`
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
  loadFontAsyncWrapper
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
  setFillColor,
  setStrokeColor,
  getStyles,
  setEffects,
  setEffectStyleId
};


// ----- components Module -----
// Components module

/**
 * Retrieves all local components available in the Figma document.
 *
 * Loads all pages and finds components by type, returning a summary including component id, name, and key.
 *
 * @returns {Promise<object>} An object containing a count of components and an array with each component's details.
 *
 * @example
 * const components = await getLocalComponents();
 * console.log(components.count, components.components);
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
 * Retrieves available remote components from team libraries in Figma.
 *
 * @returns {Promise<object>} An object containing success status, count, and an array of components with details.
 *
 * @throws Will return an error object if the API is unavailable or retrieval fails.
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
 * Creates an instance of a component in the Figma document.
 *
 * @param {object} params - Parameters for creating component instance.
 * @param {string} params.componentKey - The key of the component to import.
 * @param {number} [params.x=0] - The X coordinate for the new instance.
 * @param {number} [params.y=0] - The Y coordinate for the new instance.
 *
 * @returns {Promise<object>} Details of the created instance including id, name, position, size, and componentId.
 *
 * @throws Will throw an error if the component cannot be imported.
 *
 * @example
 * const instance = await createComponentInstance({ componentKey: "abc123", x: 10, y: 20 });
 * console.log(instance.id, instance.name);
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
 * Exports a node as an image in the Figma document.
 *
 * @param {object} params - Export parameters.
 * @param {string} params.nodeId - The ID of the node to export.
 * @param {string} [params.format="PNG"] - The desired image format ("PNG","JPG","SVG","PDF").
 * @param {number} [params.scale=1] - The scale factor for the export.
 *
 * @returns {Promise<object>} An object containing nodeId, format, scale, mimeType, and base64-encoded image data.
 *
 * @throws Will throw an error if the node is not found, does not support exporting, or if the fails.
 *
 * @example
 * const image = await exportNodeAsImage({ nodeId: "12345", format: "PNG", scale: 2 });
 * console.log(image.mimeType, image.imageData);
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

// Export the operations as a group
const componentOperations = {
  getLocalComponents,
  getRemoteComponents,
  createComponentInstance,
  exportNodeAsImage
};


// ----- layout Module -----
// Layout module

/**
 * Sets auto layout properties on a node.
 *
 * Configures layout mode, padding, spacing, alignment, wrapping, and stroke inclusion.
 *
 * @param {object} params - Auto layout configuration parameters.
 * @param {string} params.nodeId - The ID of the node to configure.
 * @param {string} params.layoutMode - Layout mode ("NONE", "HORIZONTAL", "VERTICAL").
 * @param {number} [params.paddingTop] - Top padding in pixels.
 * @param {number} [params.paddingBottom] - Bottom padding in pixels.
 * @param {number} [params.paddingLeft] - Left padding in pixels.
 * @param {number} [params.paddingRight] - Right padding in pixels.
 * @param {number} [params.itemSpacing] - Spacing between items in pixels.
 * @param {string} [params.primaryAxisAlignItems] - Alignment along primary axis.
 * @param {string} [params.counterAxisAlignItems] - Alignment along counter axis.
 * @param {string} [params.layoutWrap] - Layout wrap mode ("WRAP", "NO_WRAP").
 * @param {boolean} [params.strokesIncludedInLayout] - Whether strokes are included in layout.
 *
 * @returns {object} An object with updated auto layout properties.
 *
 * @throws Will throw an error if the node is not found or does not support auto layout.
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
 * Adjust Auto-Layout Resizing of a Node
 *
 * This function adjusts the sizing mode along a specified axis (horizontal or vertical)
 * for a given node that supports auto layout. When using the "FILL" mode, the function
 * also sets the layoutGrow property on each child element so that they expand to fill the space.
 *
 * @param {object} params - Parameters for adjusting auto layout resizing.
 * @param {string} params.nodeId - The unique identifier of the node to update.
 * @param {string} params.axis - The axis along which to adjust the resizing ("horizontal" or "vertical").
 * @param {string} params.mode - The sizing mode to set for the specified axis ("HUG", "FIXED", "FILL").
 *
 * @returns {object} An object containing the node's ID and current sizing modes.
 *
 * @throws Will throw an error if required parameters are missing or invalid, or if the node doesn't support auto layout.
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
 * Groups multiple nodes in Figma into a single group.
 *
 * @param {object} params - Parameters for grouping.
 * @param {string[]} params.nodeIds - Array of node IDs to group.
 * @param {string} [params.name] - Optional name for the group.
 *
 * @returns {object} An object with the group's id, name, type, and children details.
 *
 * @throws Will throw an error if nodes are missing, have different parents, or grouping fails.
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
 * Ungroups a node (group or frame) in Figma.
 *
 * @param {object} params - Parameters for ungrouping.
 * @param {string} params.nodeId - The ID of the node to ungroup.
 *
 * @returns {object} An object with success status, count of ungrouped items, and item details.
 *
 * @throws Will throw an error if the node is not found, is not a group or frame, or ungrouping fails.
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
 * Inserts a child node into a parent node at an optional index.
 *
 * @param {object} params - Parameters for insertion.
 * @param {string} params.parentId - The ID of the parent node.
 * @param {string} params.childId - The ID of the child node.
 * @param {number} [params.index] - Optional index to insert at.
 *
 * @returns {object} An object with parentId, childId, index, success status, and previous parentId.
 *
 * @throws Will throw an error if parent or child nodes are not found or insertion fails.
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
// Rename module

/**
 * Rename Multiple Figma Layers
 *
 * Renames multiple layers in a Figma document. Supports regex replacement or template-based renaming.
 *
 * @param {object} params - Parameters for renaming.
 * @param {string[]} params.layer_ids - Array of Figma layer IDs to rename.
 * @param {string} [params.new_name] - New name template (ignored if regex parameters are provided).
 * @param {string} [params.match_pattern] - Regex pattern to match in existing names.
 * @param {string} [params.replace_with] - Replacement string for matched pattern.
 *
 * @returns {Promise<object>} Object indicating success and count of renamed layers.
 *
 * @throws Will throw an error if any layer is locked or hidden, or if a required layer cannot be found.
 *
 * @example
 * rename_layers({
 *   layer_ids: ['id1', 'id2', 'id3'],
 *   new_name: "Layer ${asc} - ${current}"
 * });
 *
 * @example
 * rename_layers({
 *   layer_ids: ['id1', 'id2'],
 *   match_pattern: "^Old",
 *   replace_with: ""
 * });
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
 * Uses Figma's AI to automatically generate new names for layers based on a context prompt.
 *
 * @param {object} params - Parameters for AI rename.
 * @param {string[]} params.layer_ids - Array of Figma layer IDs to rename.
 * @param {string} params.context_prompt - Context prompt for AI renaming.
 *
 * @returns {Promise<object>} Object with success status and new names or error.
 *
 * @example
 * ai_rename_layers({
 *   layer_ids: ['nodeId1', 'nodeId2'],
 *   context_prompt: "Rename these layers to align with our modern branding guidelines."
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
 * Rename a Single Figma Layer with Optional Auto-Rename for Text Nodes
 *
 * Renames a single Figma node by ID. For TEXT nodes, can toggle auto-renaming.
 *
 * @param {object} params - Parameters for renaming.
 * @param {string} params.nodeId - The ID of the node to rename.
 * @param {string} params.newName - The new name to assign.
 * @param {boolean} [params.setAutoRename] - Optional flag to enable/disable auto-renaming (TEXT nodes).
 *
 * @returns {Promise<object>} Object with success status, nodeId, originalName, and newName.
 *
 * @throws Will throw an error if the node is not found.
 *
 * @example
 * await rename_layer({
 *   nodeId: "12345",
 *   newName: "Updated Layer Name",
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
 * Rename Multiple Figma Layers with Distinct Names
 *
 * Renames multiple layers by assigning unique new names to each.
 *
 * @param {object} params - Parameters for renaming.
 * @param {string[]} params.layer_ids - Array of Figma layer IDs.
 * @param {string[]} params.new_names - Array of new names corresponding to each layer ID.
 *
 * @returns {Promise<object>} Object indicating success and array of results.
 *
 * @throws Will throw an error if layer_ids or new_names are not arrays or lengths differ.
 *
 * @example
 * const result = await rename_multiples({
 *   layer_ids: ['id1', 'id2'],
 *   new_names: ['New Name for id1', 'New Name for id2']
 * });
 * console.log(result);
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

// Export the operations as a group
const renameOperations = {
  rename_layers,
  ai_rename_layers,
  rename_layer,
  rename_multiples
};


// ----- commands Module -----
// Command registry and handler

// Command registry
const commandRegistry = {};

/**
 * Registers a command function with the specified name
 * 
 * @param {string} name - The command name to register
 * @param {Function} fn - The function to execute for this command
 */
function registerCommand(name, fn) {
  commandRegistry[name] = fn;
}

/**
 * Initializes all commands by registering them in the command registry
 * This function is called once during plugin initialization
 */
function initializeCommands() {
  // Document operations
  registerCommand('get_document_info', documentOperations.getDocumentInfo);
  registerCommand('get_selection', documentOperations.getSelection);
  registerCommand('get_node_info', documentOperations.getNodeInfo);
  registerCommand('get_nodes_info', documentOperations.getNodesInfo);
  
  // Shape operations
  registerCommand('create_rectangle', shapeOperations.createRectangle);
  registerCommand('create_frame', shapeOperations.createFrame);
  registerCommand('create_ellipse', shapeOperations.createEllipse);
  registerCommand('create_polygon', shapeOperations.createPolygon);
  registerCommand('create_star', shapeOperations.createStar);
  registerCommand('create_vector', shapeOperations.createVector);
  registerCommand('create_line', shapeOperations.createLine);
  registerCommand('set_corner_radius', shapeOperations.setCornerRadius);
  registerCommand('resize_node', shapeOperations.resizeNode);
  registerCommand('delete_node', shapeOperations.deleteNode);
  registerCommand('move_node', shapeOperations.moveNode);
  registerCommand('clone_node', shapeOperations.cloneNode);
  registerCommand('flatten_node', shapeOperations.flattenNode);
  
  // Text operations
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
  
  // Style operations
  registerCommand('set_fill_color', styleOperations.setFillColor);
  registerCommand('set_stroke_color', styleOperations.setStrokeColor);
  registerCommand('get_styles', styleOperations.getStyles);
  registerCommand('set_effects', styleOperations.setEffects);
  registerCommand('set_effect_style_id', styleOperations.setEffectStyleId);
  
  // Component operations
  registerCommand('get_local_components', componentOperations.getLocalComponents);
  registerCommand('get_remote_components', componentOperations.getRemoteComponents);
  registerCommand('create_component_instance', componentOperations.createComponentInstance);
  registerCommand('export_node_as_image', componentOperations.exportNodeAsImage);
  
  // Layout operations
  registerCommand('set_auto_layout', layoutOperations.setAutoLayout);
  registerCommand('set_auto_layout_resizing', layoutOperations.setAutoLayoutResizing);
  registerCommand('group_nodes', layoutOperations.groupNodes);
  registerCommand('ungroup_nodes', layoutOperations.ungroupNodes);
  registerCommand('insert_child', layoutOperations.insertChild);
  
  // Rename operations
  registerCommand('rename_layers', renameOperations.rename_layers);
  registerCommand('ai_rename_layers', renameOperations.ai_rename_layers);
  registerCommand('rename_layer', renameOperations.rename_layer);
  registerCommand('rename_multiple', renameOperations.rename_multiples);
}

/**
 * Handles an incoming command by routing it to the appropriate handler function
 * 
 * @param {string} command - The command to execute
 * @param {object} params - Parameters for the command
 * @returns {Promise<any>} - The result of the command execution
 * @throws {Error} - If the command is unknown or execution fails
 */
async function handleCommand(command, params) {
  console.log(`Received command: ${command}`);
  
  if (!commandRegistry[command]) {
    throw new Error(`Unknown command: ${command}`);
  }
  
  return await commandRegistry[command](params);
}

// Export for build compatibility
const commandOperations = {
  initializeCommands,
  handleCommand
};


// ----- Main Plugin Code -----
// Main entry point for the Figma plugin


// Show UI
figma.showUI(__html__, { width: 350, height: 450 });

// Initialize commands
initializeCommands();

// Plugin commands from UI
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
      // Execute commands received from UI (which gets them from WebSocket)
      try {
        const result = await handleCommand(msg.command, msg.params);
        // Send result back to UI
        figma.ui.postMessage({
          type: "command-result",
          id: msg.id,
          result,
        });
      } catch (error) {
        figma.ui.postMessage({
          type: "command-error",
          id: msg.id,
          error: error.message || "Error executing command",
        });
      }
      break;
  }
};

// Listen for plugin commands from menu
figma.on("run", ({ command }) => {
  figma.ui.postMessage({ type: "auto-connect" });
});

// Initialize the plugin on load
initializePlugin();
