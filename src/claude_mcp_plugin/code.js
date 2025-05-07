// Figma Plugin - Auto-generated code from build.js

// ----- Utils Module -----
// ----- Utils/plugin.js -----
/**
 * Plugin utilities module.
 * Consolidates plugin configuration, state management, and progress reporting helpers.
 *
 * Exposed functions:
 * - state: { serverPort: number }
 * - sendProgressUpdate(commandId: string, commandType: string, status: string, progress: number, totalItems: number, processedItems: number, message: string, payload?: object): object
 * - initializePlugin(): Promise<void>
 * - updateSettings(settings: { serverPort: number }): void
 *
 * @module modules/utils/plugin
 * @example
 *  * // Initialize with persisted settings
 * await initializePlugin();
 * // Update server port setting
 * updateSettings({ serverPort: 4000 });
 */

/**
 * Plugin state management object.
 * Maintains core configuration settings that persist across plugin sessions.
 *
 * @property {number} serverPort - The port number for plugin's backend connection (default: 3055)
 * @example
 * // Access current serverPort
 * console.log(state.serverPort);
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
 * Encoding operations module.
 * Provides functions to convert binary data to Base64 for image and other payload serialization.
 *
 * Exposed functions:
 * - customBase64Encode(bytes: Uint8Array): string
 *
 * @module modules/utils/encoding
 * @example
 *  * const base64 = customBase64Encode(new Uint8Array([72,65,84]));
 * console.log(base64); // "SEFU"
 */
function customBase64Encode(bytes) {
  // Base64 character set lookup table
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let base64 = "";

  // Calculate padding requirements
  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;
  const mainLength = byteLength - byteRemainder;

  let a, b, c, d;
  let chunk;

  // Process all complete 3-byte chunks
  for (let i = 0; i < mainLength; i += 3) {
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    a = (chunk & 0xfc0000) >> 18;
    b = (chunk & 0x03f000) >> 12;
    c = (chunk & 0x000fc0) >> 6;
    d = chunk & 0x00003f;
    base64 += chars[a] + chars[b] + chars[c] + chars[d];
  }

  // Handle remaining bytes
  if (byteRemainder === 1) {
    chunk = bytes[mainLength];
    a = (chunk & 0xfc) >> 2;
    b = (chunk & 0x03) << 4;
    base64 += chars[a] + chars[b] + "==";
  } else if (byteRemainder === 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
    a = (chunk & 0xfc00) >> 10;
    b = (chunk & 0x03f0) >> 4;
    c = (chunk & 0x000f) << 2;
    base64 += chars[a] + chars[b] + chars[c] + "=";
  }

  return base64;
}


// ----- Utils/helpers.js -----
/**
 * Helper utilities module.
 * Provides common utility functions for command execution, delays, and text manipulation.
 *
 * Exposed functions:
 * - delay(ms: number): Promise<void>
 * - generateCommandId(): string
 * - uniqBy(arr: any[], predicate: string | Function): any[]
 * - setCharacters(node: SceneNode, characters: string, options?: object): Promise<boolean>
 * - canAcceptChildren(node: SceneNode): boolean
 *
 * @module modules/utils/helpers
 * @example
 *  * // Use delay to pause execution
 * await delay(500);
 * // Generate a command ID
 * const cmdId = generateCommandId();
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

/**
 * Checks if a Figma node can accept children.
 * 
 * This utility function determines whether a given Figma node type can 
 * contain child nodes, which is important for creating proper node hierarchies.
 * 
 * @param {SceneNode} node - The Figma node to check
 * @returns {boolean} - True if the node can have children, false otherwise
 * 
 * @example
 * const frame = figma.createFrame();
 * const rect = figma.createRectangle();
 * 
 * canAcceptChildren(frame); // Returns true
 * canAcceptChildren(rect); // Returns false
 */
function canAcceptChildren(node) {
  if (!node) return false;
  
  // These are the node types that can have children in Figma
  const containerNodeTypes = [
    'FRAME', 'GROUP', 'COMPONENT', 'COMPONENT_SET', 
    'SECTION', 'INSTANCE', 'PAGE', 'DOCUMENT'
  ];
  
  // Check by node type or by presence of appendChild method
  return containerNodeTypes.includes(node.type) || 
    ('appendChild' in node && typeof node.appendChild === 'function');
}


// ----- document Module -----
/**
 * Document operations module.
 * Provides functions for retrieving document and selection details, and node exports via MCP.
 *
 * Exposed functions:
 * - ensureNodeIdIsString(nodeId): string
 * - getDocumentInfo(): Promise<{ name, id, type, children, currentPage, pages }>
 * - getSelection(): Promise<{ selectionCount, selection }>
 * - getNodeInfo(params|string): Promise<Object>
 * - getNodesInfo(params|Array): Promise<Array<{ nodeId, document }>>
 *
 * @module modules/document
 * @example
 *  * // Get basic document info
 * const doc = await documentOperations.getDocumentInfo();
 * console.log(`Doc name: ${doc.name}, child count: ${doc.currentPage.childCount}`);
 */

/**
 * Safely converts a node ID to a string.
 * @function ensureNodeIdIsString
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
 * @async
 * @function getDocumentInfo
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
 * @async
 * @function getSelection
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
 * @async
 * @function getNodeInfo
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
 * @async
 * @function getNodesInfo
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

/**
 * Named group of document operation functions for convenient importing.
 * @namespace documentOperations
 * @example
 * const { getSelection } = documentOperations;
 * const selection = await getSelection();
 */
const documentOperations = {
  getDocumentInfo,
  getSelection,
  getNodeInfo,
  getNodesInfo,
  ensureNodeIdIsString
};


// ----- shapes Module -----
/**
 * Shapes operations module.
 * Provides functions to create and manipulate geometric nodes in Figma via MCP.
 *
 * Exposed functions:
 * - createRectangle(params): Promise<{ id, name, x, y, width, height }>
 * - createRectangles(params): Promise<{ ids: string[] }>
 * - createFrame(params): Promise<{ id, name, width, height }>
 * - createFrames(params): Promise<{ ids: string[] }>
 * - createEllipse(params): Promise<{ id: string }>
 * - createEllipses(params): Promise<{ ids: string[] }>
 * - createPolygon(params): Promise<{ id: string }>
 * - createPolygons(params): Promise<{ ids: string[] }>
 * - createStar(params): Promise<{ id: string }>
 * - createVector(params): Promise<{ id: string }>
 * - createVectors(params): Promise<{ ids: string[] }>
 * - createLine(params): Promise<{ id: string }>
 * - createLines(params): Promise<{ ids: string[] }>
 * - setCornerRadius(params): Promise<{ success: boolean }> (works on rectangle and frame nodes)
 *
 * @example
 *  * const rect = await shapeOperations.createRectangle({ x: 10, y: 20, width: 50, height: 50 });
 * console.log('Created rectangle', rect);
 */

/**
 * Creates a new rectangle node in the Figma document.
 * @async
 * @function createRectangle
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - X position.
 * @param {number} [params.y=0] - Y position.
 * @param {number} [params.width=100] - Width of the rectangle.
 * @param {number} [params.height=100] - Height of the rectangle.
 * @param {string} [params.name="Rectangle"] - Name of the rectangle node.
 * @param {string} [params.parentId] - Optional parent node ID to append the rectangle.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.fillColor] - Optional RGBA fill color.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.strokeColor] - Optional RGBA stroke color.
 * @param {number} [params.strokeWeight] - Optional stroke weight.
 * @returns {Promise<{ id: string, name: string, x: number, y: number, width: number, height: number }>}
 * @example
 * const result = await createRectangle({ x: 0, y: 0, width: 100, height: 100 });
 */
async function createRectangle(params) {
  const {
    x = 0, y = 0, width = 100, height = 100,
    name = "Rectangle", parentId, fillColor, strokeColor, strokeWeight
  } = params || {};

  const rect = figma.createRectangle();
  rect.x = x; rect.y = y;
  rect.resize(width, height);
  rect.name = name;

  if (fillColor) setFill(rect, fillColor);
  if (strokeColor) setStroke(rect, strokeColor, strokeWeight);

  const parent = parentId
    ? await figma.getNodeByIdAsync(parentId)
    : figma.currentPage;
  if (parentId && !parent) throw new Error(`Parent not found: ${parentId}`);
  parent.appendChild(rect);

  return { id: rect.id, name: rect.name, x: rect.x, y: rect.y, width: rect.width, height: rect.height };
}

/**
 * Batch creates multiple rectangle nodes.
 * @async
 * @function createRectangles
 * @param {object} params - Parameters object.
 * @param {Array<object>} [params.rectangles] - Array of rectangle configuration objects.
 * @returns {Promise<{ ids: string[] }>} Created rectangle node IDs.
 * @example
 * const { ids } = await createRectangles({ rectangles: [ { x:0, y:0, width:50, height:50 } ] });
 */
async function createRectangles(params) {
  const { rectangles = [] } = params || {};
  const ids = [];
  for (const cfg of rectangles) {
    const res = await createRectangle(cfg);
    ids.push(res.id);
  }
  return { ids };
}

/**
 * Creates a new frame node in the Figma document.
 * @async
 * @function createFrame
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - X position.
 * @param {number} [params.y=0] - Y position.
 * @param {number} [params.width=100] - Width of the frame.
 * @param {number} [params.height=100] - Height of the frame.
 * @param {string} [params.name="Frame"] - Name of the frame node.
 * @param {string} [params.parentId] - Optional parent node ID to append the frame.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.fillColor] - Optional RGBA fill color.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.strokeColor] - Optional RGBA stroke color.
 * @param {number} [params.strokeWeight] - Optional stroke weight.
 * @returns {Promise<{ id: string, name: string, width: number, height: number }>}
 * @example
 * const frameResult = await createFrame({ x: 10, y: 10, width: 200, height: 150 });
 */
async function createFrame(params) {
  const {
    x = 0, y = 0, width = 100, height = 100,
    name = "Frame", parentId, fillColor, strokeColor, strokeWeight
  } = params || {};

  const frame = figma.createFrame();
  frame.x = x; frame.y = y;
  frame.resize(width, height);
  frame.name = name;

  if (fillColor) setFill(frame, fillColor);
  if (strokeColor) setStroke(frame, strokeColor, strokeWeight);

  const parent = parentId
    ? await figma.getNodeByIdAsync(parentId)
    : figma.currentPage;
  if (parentId && !parent) throw new Error(`Parent not found: ${parentId}`);
  parent.appendChild(frame);

  return { id: frame.id, name: frame.name, width: frame.width, height: frame.height };
}

/**
 * Batch creates multiple frame nodes.
 * @async
 * @function createFrames
 * @param {object} params - Parameters object.
 * @param {Array<object>} [params.frames] - Array of frame configuration objects.
 * @returns {Promise<{ ids: string[] }>} Created frame node IDs.
 * @example
 * const { ids } = await createFrames({ frames: [ { width:100, height:100 } ] });
 */
async function createFrames(params) {
  const { frames = [] } = params || {};
  const ids = [];
  for (const cfg of frames) {
    const res = await createFrame(cfg);
    ids.push(res.id);
  }
  return { ids };
}

/**
 * Creates a new ellipse node in the Figma document.
 * @async
 * @function createEllipse
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - X position.
 * @param {number} [params.y=0] - Y position.
 * @param {number} [params.width=100] - Width of the ellipse.
 * @param {number} [params.height=100] - Height of the ellipse.
 * @param {string} [params.name="Ellipse"] - Name of the ellipse node.
 * @param {string} [params.parentId] - Optional parent node ID to append the ellipse.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.fillColor] - Optional RGBA fill color.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.strokeColor] - Optional RGBA stroke color.
 * @param {number} [params.strokeWeight] - Optional stroke weight.
 * @returns {Promise<{ id: string }>}
 * @example
 * const ellipseRes = await createEllipse({ width: 80, height: 80 });
 */
async function createEllipse(params) {
  const {
    x = 0, y = 0, width = 100, height = 100,
    name = "Ellipse", parentId, fillColor, strokeColor, strokeWeight
  } = params || {};

  const ellipse = figma.createEllipse();
  ellipse.x = x; ellipse.y = y;
  ellipse.resize(width, height);
  ellipse.name = name;

  if (fillColor) setFill(ellipse, fillColor);
  if (strokeColor) setStroke(ellipse, strokeColor, strokeWeight);

  const parent = parentId
    ? await figma.getNodeByIdAsync(parentId)
    : figma.currentPage;
  if (parentId && !parent) throw new Error(`Parent not found: ${parentId}`);
  parent.appendChild(ellipse);

  return { id: ellipse.id };
}

/**
 * Batch ellipses.
 * @async
 * @function createEllipses
 */
async function createEllipses(params) {
  const { ellipses = [] } = params || {};
  const ids = [];
  for (const cfg of ellipses) {
    const res = await createEllipse(cfg);
    ids.push(res.id);
  }
  return { ids };
}

/**
 * Creates a polygon.
 */
/**
 * Creates a polygon node in the Figma document.
 *
 * @async
 * @function createPolygon
 * @param {{ x?: number, y?: number, width?: number, height?: number, sides?: number, name?: string, parentId?: string, fillColor?: {r:number,g:number,b:number,a?:number}, strokeColor?: {r:number,g:number,b:number,a?:number}, strokeWeight?: number }} params
 *   - x: X position (default 0)
 *   - y: Y position (default 0)
 *   - width: Width of polygon (default 100)
 *   - height: Height of polygon (default 100)
 *   - sides: Number of sides (default 6)
 *   - name: Node name (default "Polygon")
 *   - parentId: Optional parent node ID
 *   - fillColor: Optional fill color
 *   - strokeColor: Optional stroke color
 *   - strokeWeight: Optional stroke weight
 * @returns {Promise<{ id: string }>} Created polygon node ID
 * @example
 * const poly = await createPolygon({ x:10, y:10, width:80, height:80, sides:5 });
 * console.log(poly.id);
 */
async function createPolygon(params) {
  const {
    x = 0, y = 0, width = 100, height = 100,
    sides = 6, name="Polygon", parentId, fillColor, strokeColor, strokeWeight
  } = params || {};
  const poly = figma.createPolygon();
  poly.pointCount = sides;
  poly.x = x; poly.y = y;
  poly.resize(width, height);
  poly.name = name;
  if (fillColor) setFill(poly, fillColor);
  if (strokeColor) setStroke(poly, strokeColor, strokeWeight);
  const parent = parentId
    ? await figma.getNodeByIdAsync(parentId)
    : figma.currentPage;
  parent.appendChild(poly);
  return { id: poly.id };
}

/**
 * Batch polygons.
 */
/**
 * Batch creates multiple polygon nodes.
 *
 * @async
 * @function createPolygons
 * @param {{ polygons?: Array<object> }} params - Contains array of polygon configs.
 * @returns {Promise<{ ids: string[] }>} Array of created polygon IDs.
 * @example
 * const { ids } = await createPolygons({ polygons: [{ width:50, height:50 }] });
 */
async function createPolygons(params) {
  const { polygons = [] } = params || {};
  const ids = [];
  for (const cfg of polygons) {
    const res = await createPolygon(cfg);
    ids.push(res.id);
  }
  return { ids };
}

/**
 * Creates a star.
 */
/**
 * Creates a star-shaped node in the Figma document.
 *
 * @async
 * @function createStar
 * @param {{ x?: number, y?: number, width?: number, height?: number, points?: number, innerRadius?: number, name?: string, parentId?: string, fillColor?: object, strokeColor?: object, strokeWeight?: number }} params
 *   - points: Number of star points (default 5)
 *   - innerRadius: Inner radius ratio (default 0.5)
 * @returns {Promise<{ id: string }>} Created star node ID
 * @example
 * const star = await createStar({ points:7, innerRadius:0.4 });
 * console.log(star.id);
 */
async function createStar(params) {
  const {
    x=0,y=0,width=100,height=100,
    points=5,innerRadius=0.5,name="Star",parentId,fillColor,strokeColor,strokeWeight
  } = params||{};
  const star = figma.createStar();
  star.pointCount = points;
  star.innerRadius = innerRadius;
  star.x = x; star.y = y;
  star.resize(width,height);
  star.name=name;
  if(fillColor) setFill(star,fillColor);
  if(strokeColor) setStroke(star,strokeColor,strokeWeight);
  const parent= parentId?await figma.getNodeByIdAsync(parentId):figma.currentPage;
  parent.appendChild(star);
  return { id: star.id };
}

/**
 * Creates a vector node.
 */
/**
 * Creates a vector node with specified vectorPaths.
 *
 * @async
 * @function createVector
 * @param {{ x?: number, y?: number, width?: number, height?: number, vectorPaths?: Array<object>, name?: string, parentId?: string, fillColor?: object, strokeColor?: object, strokeWeight?: number }} params
 * @returns {Promise<{ id: string }>} Created vector node ID
 * @example
 * const vec = await createVector({ vectorPaths: [{ data: 'M0,0 L10,10' }] });
 * console.log(vec.id);
 */
async function createVector(params) {
  const {
    x=0,y=0,width=100,height=100,
    vectorPaths=[],name="Vector",parentId,fillColor,strokeColor,strokeWeight
  } = params||{};
  const vec = figma.createVector();
  vec.x = x; vec.y = y;
  vec.resize(width, height);
  vec.vectorPaths = vectorPaths;
  vec.name = name;
  if (fillColor) setFill(vec, fillColor);
  if (strokeColor) setStroke(vec, strokeColor, strokeWeight);
  const parent = parentId ? await figma.getNodeByIdAsync(parentId) : figma.currentPage;
  parent.appendChild(vec);
  return { id: vec.id };
}

/**
 * Creates a line.
 */
/**
 * Creates a line in the Figma document.
 *
 * @async
 * @function createLine
 * @param {{ x1?: number, y1?: number, x2?: number, y2?: number, strokeColor?: object, strokeWeight?: number, name?: string, parentId?: string }} params
 * @returns {Promise<{ id: string }>} Created line node ID
 * @example
 * const line = await createLine({ x1:0, y1:0, x2:100, y2:0 });
 * console.log(line.id);
 */
async function createLine(params) {
  const { x1=0,y1=0,x2=100,y2=0,strokeColor={r:0,g:0,b:0,a:1},strokeWeight=1,name="Line",parentId } = params||{};
  const line = figma.createVector();
  line.vectorPaths=[{ windingRule:"NONZERO", data:`M0,0 L${x2-x1},${y2-y1}` }];
  line.strokeCap="NONE";
  if(strokeColor) setStroke(line,strokeColor,strokeWeight);
  const parent= parentId?await figma.getNodeByIdAsync(parentId): figma.currentPage;
  parent.appendChild(line);
  return { id: line.id };
}

/**
 * Batch vectors.
 */
async function createVectors(params) {
  const { vectors = [] } = params||{};
  const ids=[];
  for(const cfg of vectors){
    const res=await createVector(cfg);
    ids.push(res.id);
  }
  return { ids };
}

/**
 * Batch lines.
 */
/**
 * Batch creates multiple lines.
 *
 * @async
 * @function createLines
 * @param {{ lines?: Array<object> }} params - Contains array of line configs.
 * @returns {Promise<{ ids: string[] }>} Created line IDs.
 * @example
 * const { ids } = await createLines({ lines: [{ x1:0, y1:0, x2:50, y2:50 }] });
 */
async function createLines(params) {
  const { lines=[] } = params||{};
  const ids=[];
  for(const cfg of lines){
    const res=await createLine(cfg);
    ids.push(res.id);
  }
  return { ids };
}


// Helper functions

/**
 * Helper: Applies a solid fill color to a node.
 *
 * @param {SceneNode} node - The Figma node to style.
 * @param {{ r: number, g: number, b: number, a?: number }} color - RGBA color.
 * @example
 * setFill(rect, { r:1, g:0, b:0 });
 */
function setFill(node, color) {
  node.fills=[{ type:"SOLID", color:{ r:color.r, g:color.g, b:color.b }, opacity:color.a||1 }];
}

/**
 * Helper: Applies a solid stroke color and weight to a node.
 *
 * @param {SceneNode} node - The Figma node to style.
 * @param {{ r: number, g: number, b: number, a?: number }} color - RGBA color.
 * @param {number} [weight] - Stroke weight.
 * @example
 * setStroke(rect, { r:0, g:0, b:1 }, 2);
 */
function setStroke(node, color, weight) {
  node.strokes=[{ type:"SOLID", color:{ r:color.r, g:color.g, b:color.b }, opacity:color.a||1 }];
  if(weight!==undefined) node.strokeWeight=weight;
}

/**
 * Sets the corner radius of a rectangle or frame node
 * @async
 * @function setCornerRadius
 * @param {object} params - Parameters
 * @param {string} params.nodeId - ID of the node to modify
 * @param {number} params.radius - Corner radius value
 * @param {Array<boolean>} [params.corners] - Optional array of 4 booleans to specify which corners to round
 * @returns {Promise<{success: boolean}>}
 * @example
 * const result = await setCornerRadius({ nodeId: 'rect-id', radius: 8 });
 * // Also works with frame nodes
 * const frameResult = await setCornerRadius({ nodeId: 'frame-id', radius: 12 });
 */
async function setCornerRadius(params) {
  const { nodeId, radius, corners } = params;
  const node = await figma.getNodeByIdAsync(nodeId);
  
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  
  if (node.type !== 'RECTANGLE' && node.type !== 'FRAME') {
    throw new Error('Corner radius can only be set on rectangle or frame nodes');
  }
  
  if (corners && corners.length === 4) {
    // Set individual corners
    node.topLeftRadius = corners[0] ? radius : 0;
    node.topRightRadius = corners[1] ? radius : 0;
    node.bottomRightRadius = corners[2] ? radius : 0;
    node.bottomLeftRadius = corners[3] ? radius : 0;
  } else {
    // Set all corners uniformly
    node.cornerRadius = radius;
  }
  
  return { success: true };
}

/**
 * Resizes a node to the specified dimensions
 * @async
 * @function resizeNode
 * @param {object} params - Parameters
 * @param {string} params.nodeId - ID of the node to resize
 * @param {number} params.width - New width
 * @param {number} params.height - New height
 * @returns {Promise<{success: boolean}>}
 */
async function resizeNode(params) {
  const { nodeId, width, height } = params;
  const node = await figma.getNodeByIdAsync(nodeId);
  
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  
  node.resize(width, height);
  return { success: true };
}

/**
 * Resizes multiple nodes to the same dimensions
 * @async
 * @function resizeNodes
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs to resize
 * @param {object} params.targetSize - Target dimensions
 * @param {number} params.targetSize.width - New width
 * @param {number} params.targetSize.height - New height
 * @returns {Promise<{success: boolean, resized: number}>}
 */
async function resizeNodes(params) {
  const { nodeIds, targetSize } = params;
  let resized = 0;
  
  for (const id of nodeIds) {
    const node = await figma.getNodeByIdAsync(id);
    if (node) {
      node.resize(targetSize.width, targetSize.height);
      resized++;
    }
  }
  
  return { success: true, resized };
}

/**
 * Deletes a node from the document
 * @async
 * @function deleteNode
 * @param {object} params - Parameters
 * @param {string} params.nodeId - ID of the node to delete
 * @returns {Promise<{success: boolean}>}
 */
async function deleteNode(params) {
  const { nodeId } = params;
  const node = await figma.getNodeByIdAsync(nodeId);
  
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  
  node.remove();
  return { success: true };
}

/**
 * Deletes multiple nodes from the document
 * @async
 * @function deleteNodes
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs to delete
 * @returns {Promise<{success: string[], failed: string[]}>}
 */
async function deleteNodes(params) {
  const { nodeIds } = params;
  const success = [];
  const failed = [];
  
  for (const id of nodeIds) {
    const node = await figma.getNodeByIdAsync(id);
    if (node) {
      node.remove();
      success.push(id);
    } else {
      failed.push(id);
    }
  }
  
  return { success, failed };
}

/**
 * Moves a node to a new position
 * @async
 * @function moveNode
 * @param {object} params - Parameters
 * @param {string} params.nodeId - ID of the node to move
 * @param {number} params.x - New X position
 * @param {number} params.y - New Y position
 * @returns {Promise<{success: boolean}>}
 */
async function moveNode(params) {
  const { nodeId, x, y } = params;
  const node = await figma.getNodeByIdAsync(nodeId);
  
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  
  node.x = x;
  node.y = y;
  return { success: true };
}

/**
 * Moves multiple nodes to a new position
 * @async
 * @function moveNodes
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs to move
 * @param {number} params.x - New X position
 * @param {number} params.y - New Y position
 * @returns {Promise<{success: boolean, moved: number}>}
 */
async function moveNodes(params) {
  const { nodeIds, x, y } = params;
  let moved = 0;
  
  for (const id of nodeIds) {
    const node = await figma.getNodeByIdAsync(id);
    if (node) {
      node.x = x;
      node.y = y;
      moved++;
    }
  }
  
  return { success: true, moved };
}

/**
 * Flattens a node
 * @async
 * @function flattenNode
 * @param {object} params - Parameters
 * @param {string} params.nodeId - ID of the node to flatten
 * @returns {Promise<{success: boolean, nodeId: string}>}
 */
async function flattenNode(params) {
  const { nodeId } = params;
  const node = await figma.getNodeByIdAsync(nodeId);
  
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  
  figma.currentPage.selection = [node];
  const flattened = figma.flatten();
  return { success: true, nodeId: flattened.id };
}

/**
 * Applies union boolean operation to selected nodes
 * @async
 * @function union_selection
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs to union
 * @returns {Promise<{success: boolean}>}
 */
async function union_selection(params) {
  const { nodeIds } = params;
  const nodes = [];
  
  for (const id of nodeIds) {
    const node = await figma.getNodeByIdAsync(id);
    if (node) nodes.push(node);
  }
  
  if (nodes.length < 2) {
    throw new Error('Need at least 2 nodes for boolean operation');
  }
  
  figma.currentPage.selection = nodes;
  figma.union();
  return { success: true };
}

/**
 * Applies subtract boolean operation to selected nodes
 * @async
 * @function subtract_selection
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs (first is bottom shape, rest are subtracted)
 * @returns {Promise<{success: boolean}>}
 */
async function subtract_selection(params) {
  const { nodeIds } = params;
  const nodes = [];
  
  for (const id of nodeIds) {
    const node = await figma.getNodeByIdAsync(id);
    if (node) nodes.push(node);
  }
  
  if (nodes.length < 2) {
    throw new Error('Need at least 2 nodes for boolean operation');
  }
  
  figma.currentPage.selection = nodes;
  figma.subtract();
  return { success: true };
}

/**
 * Applies intersect boolean operation to selected nodes
 * @async
 * @function intersect_selection
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs to intersect
 * @returns {Promise<{success: boolean}>}
 */
async function intersect_selection(params) {
  const { nodeIds } = params;
  const nodes = [];
  
  for (const id of nodeIds) {
    const node = await figma.getNodeByIdAsync(id);
    if (node) nodes.push(node);
  }
  
  if (nodes.length < 2) {
    throw new Error('Need at least 2 nodes for boolean operation');
  }
  
  figma.currentPage.selection = nodes;
  figma.intersect();
  return { success: true };
}

/**
 * Applies exclude boolean operation to selected nodes
 * @async
 * @function exclude_selection
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs to exclude
 * @returns {Promise<{success: boolean}>}
 */
async function exclude_selection(params) {
  const { nodeIds } = params;
  const nodes = [];
  
  for (const id of nodeIds) {
    const node = await figma.getNodeByIdAsync(id);
    if (node) nodes.push(node);
  }
  
  if (nodes.length < 2) {
    throw new Error('Need at least 2 nodes for boolean operation');
  }
  
  figma.currentPage.selection = nodes;
  figma.exclude();
  return { success: true };
}

/**
 * Registry of available shape operations for the plugin.
 */
const shapeOperations = {
  createRectangle,
  createRectangles,
  createFrame,
  createFrames,
  createEllipse,
  createEllipses,
  createPolygon,
  createPolygons,
  createStar,
  createVector,
  createVectors,
  createLine,
  createLines,
  setCornerRadius,
  resizeNode,
  resizeNodes,
  deleteNode,
  deleteNodes,
  moveNode,
  moveNodes,
  flattenNode,
  union_selection,
  subtract_selection,
  intersect_selection,
  exclude_selection
};


// ----- image Module -----
/**
 * Image operations module.
 * Provides functions to insert images via URL or local data into Figma via MCP.
 *
 * Exposed functions:
 * - insertImage(params)
 * - insertImages(params)
 * - insertLocalImage(params)
 * - insertLocalImages(params)
 *
 * @module modules/image
 * @example
 *  * // Insert from URL
 * const { id } = await imageOperations.insertImage({
 *   url: 'https://example.com/image.png',
 *   x: 10, y: 10, width: 100, height: 100
 * });
 * console.log('Inserted image node:', id);
 */

/**
 * Inserts a single image into the document.
 * Fetches image bytes from a URL and places them in a new rectangle node.
 *
 * @async
 * @function insertImage
 * @param {{ url: string, x?: number, y?: number, width?: number, height?: number, name?: string, parentId?: string }} params
 *   - url: URL of the image to fetch.
 *   - x: X coordinate for placement (default 0).
 *   - y: Y coordinate for placement (default 0).
 *   - width: Desired width (intrinsic if omitted).
 *   - height: Desired height (intrinsic or equal to width if omitted).
 *   - name: Node name (default "Image").
 *   - parentId: Optional parent node ID for placement.
 * @returns {Promise<{ id: string, name: string }>} Created rectangle node details.
 * @throws {Error} If fetching the image fails or parent node is not found.
 * @example
 * const { id } = await insertImage({ url: 'https://example.com/img.png', x: 10, y: 10 });
 */
async function insertImage(params) {
  const { url, x = 0, y = 0, width, height, name = "Image", parentId } = params || {};
  // Fetch image data
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image at ${url}: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  // Create Figma image and a rectangle to hold it
  const image = figma.createImage(new Uint8Array(buffer));
  const rect = figma.createRectangle();
  rect.x = x;
  rect.y = y;
  if (width !== undefined) {
    // Use provided dimensions or square fallback
    const h = height !== undefined ? height : width;
    rect.resize(width, h);
  }
  rect.name = name;
  rect.fills = [{
    type: "IMAGE",
    scaleMode: "FILL",
    imageHash: image.hash
  }];
  // Append to specified parent or current page
  const parent = parentId
    ? await figma.getNodeByIdAsync(parentId)
    : figma.currentPage;
  if (parentId && !parent) {
    throw new Error(`Parent not found: ${parentId}`);
  }
  parent.appendChild(rect);
  return { id: rect.id, name: rect.name };
}

/**
 * Inserts multiple images in batch.
 *
 * @param {object} params - Batch parameters.
 * @param {Array<object>} params.images - Array of image config objects for insertImage.
 * @returns {{results: Array<{id?: string, success: boolean, error?: string}>}}
 */
async function insertImages(params) {
  const { images = [] } = params || {};
  const results = [];
  for (const cfg of images) {
    try {
      const res = await insertImage(cfg);
      results.push({ id: res.id, success: true });
    } catch (err) {
      results.push({ success: false, error: err.message });
    }
  }
  return { results };
}

async function insertLocalImage(params) {
  const { data, x = 0, y = 0, width, height, name = "Local Image", parentId } = params || {};
  if (!data) {
    throw new Error("No image data provided");
  }
  const bytes = Array.isArray(data) ? new Uint8Array(data) : data;
  const image = figma.createImage(bytes);
  const rect = figma.createRectangle();
  rect.x = x;
  rect.y = y;
  if (width !== undefined) {
    const h = height !== undefined ? height : width;
    rect.resize(width, h);
  }
  rect.name = name;
  rect.fills = [{
    type: "IMAGE",
    scaleMode: "FILL",
    imageHash: image.hash
  }];
  const parent = parentId
    ? await figma.getNodeByIdAsync(parentId)
    : figma.currentPage;
  if (parentId && !parent) {
    throw new Error(`Parent not found: ${parentId}`);
  }
  parent.appendChild(rect);
  return { id: rect.id, name: rect.name };
}

async function insertLocalImages(params) {
  const { images = [] } = params || {};
  const results = [];
  for (const cfg of images) {
    try {
      const res = await insertLocalImage(cfg);
      results.push({ id: res.id, success: true });
    } catch (err) {
      results.push({ success: false, error: err.message });
    }
  }
  return { results };
}

const imageOperations = {
  insertImage,
  insertImages,
  insertLocalImage,
  insertLocalImages
};


// ----- text Module -----
/**
 * Text operations module.
 * Provides functions for creating, modifying, and scanning text nodes in Figma via MCP.
 *
 * Exposed functions:
 * - createText(params)
 * - createBoundedText(params)
 * - setTextContent(params)
 * - scanTextNodes(params)
 * - setMultipleTextContents(params)
 * - setFontName(params)
 * - setFontSize(params)
 * - setFontWeight(params)
 * - setLetterSpacing(params)
 * - setLineHeight(params)
 * - setParagraphSpacing(params)
 * - setTextCase(params)
 * - setTextDecoration(params)
 * - getStyledTextSegments(params)
 * - loadFontAsyncWrapper(params)
 * - setBulkFont(params)
 *
 * @module modules/text
 * @example
 *  * const result = await textOperations.createText({ x: 0, y: 0, text: 'Hello' });
 * console.log('Created text node ID:', result.id);
 */
 // Text module providing functions to create and modify text nodes in Figma.

/**
 * Text operations module.
 * Provides functions for creating, modifying, and scanning text nodes in Figma via MCP.
 *
 * Exposed functions:
 * - sendProgressUpdate(commandId, commandType, status, progress, totalItems, processedItems, message, payload?): object
 * - delay(ms): Promise<void>
 * - createText(params): Promise<object>
 * - createBoundedText(params): Promise<object>
 * - setTextContent(params): Promise<object>
 * - scanTextNodes(params): Promise<object>
 * - setMultipleTextContents(params): Promise<object>
 * - setFontName(params): Promise<object>
 * - setFontSize(params): Promise<object>
 * - setFontWeight(params): Promise<object>
 * - setLetterSpacing(params): Promise<object>
 * - setLineHeight(params): Promise<object>
 * - setParagraphSpacing(params): Promise<object>
 * - setTextCase(params): Promise<object>
 * - setTextDecoration(params): Promise<object>
 * - getStyledTextSegments(params): Promise<object>
 * - loadFontAsyncWrapper(params): Promise<object>
 * - setBulkFont(params): Promise<object>
 *
 * @example
 *  * const result = await textOperations.createText({ x:0, y:0, text: 'Hello' });
 * console.log('Created text node ID:', result.id);
 */

/**
 * Sends a progress update message to the plugin UI.
 * @function sendProgressUpdate
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
      if (!canAcceptChildren(parentNode)) {
        const nodeType = parentNode.type || 'unknown type';
        throw new Error(
          `Parent node with ID ${parentId} (${nodeType}) cannot have children. ` +
          `Use a FRAME, GROUP, or COMPONENT as the parent for text nodes instead of ${nodeType} nodes.`
        );
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
async function createBoundedText(params) {
  const {
    x = 0,
    y = 0,
    text = "",
    width,
    height,
    fontSize = 14,
    fontWeight = 400,
    fontColor = { r: 0, g: 0, b: 0, a: 1 },
    name = "Text",
    parentId,
  } = params || {};

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

    await figma.loadFontAsync({ family: "Inter", style: getFontStyle(fontWeight) });
    textNode.fontName = { family: "Inter", style: getFontStyle(fontWeight) };
    textNode.fontSize = fontSize;

    await setCharacters(textNode, text);

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

    if (width !== undefined && height !== undefined) {
      textNode.textAutoResize = "NONE";
      textNode.resize(width, height);
    } else if (width !== undefined) {
      textNode.textAutoResize = "HEIGHT";
      textNode.resize(width, textNode.height);
    }

    if (parentId) {
      const parentNode = await figma.getNodeByIdAsync(parentId);
      if (!parentNode) {
        throw new Error(`Parent node not found with ID: ${parentId}`);
      }
      if (!canAcceptChildren(parentNode)) {
        const nodeType = parentNode.type || 'unknown type';
        throw new Error(
          `Parent node with ID ${parentId} (${nodeType}) cannot have children. ` +
          `Use a FRAME, GROUP, or COMPONENT as the parent for text nodes instead of ${nodeType} nodes.`
        );
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
      fontWeight,
      fontColor,
      fontName: textNode.fontName,
      fills: textNode.fills,
      parentId: textNode.parent ? textNode.parent.id : undefined,
    };
  } catch (error) {
    console.error("Error creating bounded text", error);
    throw error;
  }
}

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
/**
 * Named group of text operation functions for convenient importing.
 * @namespace textOperations
 * @example
 * const { setTextContent } = textOperations;
 * const updateResult = await setTextContent({ nodeId: '123', text: 'Goodbye' });
 */
const textOperations = {
  createText,
  createBoundedText,
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
/**
 * Styles operations module.
 * Provides functions to set fills, strokes, effects, and retrieve local style definitions in Figma via MCP.
 *
 * Exposed functions:
 * - setFillColor(params)
 * - setStrokeColor(params)
 * - setStyle(params)
 * - setStyles(entries)
 * - getStyles()
 * - setEffects(params)
 * - setEffectStyleId(params)
 * - createGradientVariable(params)
 * - applyGradientStyle(params)
 *
 * @module modules/styles
 * @example
 *  * await styleOperations.setFillColor({ nodeId: '123', color: { r:1, g:0, b:0, a:1 } });
 */

/**
 * Sets the fill color of a specified node.
 * @async
 * @function setFillColor
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
 * @async
 * @function setStrokeColor
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
 * Sets both fill and stroke properties on a node.
 * @async
 * @function setStyle
 *
 * @param {object} params - Style parameters.
 * @param {string} params.nodeId - The ID of the node to update.
 * @param {object} [params.fillProps] - Fill properties.
 * @param {object} [params.strokeProps] - Stroke properties.
 * @returns {object} An object containing the node id, name, fills, and strokes.
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
 * @async
 * @function setStyles
 *
 * @param {Array} entries - Array of objects { nodeId, fillProps?, strokeProps? }
 * @returns {Array} Results per node.
 */
async function setStyles(entries) {
  const results = [];
  for (const entry of entries) {
    const res = await setStyle(entry);
    results.push(res);
  }
  return results;
}

/**
 * Retrieves local style definitions from Figma.
 * @async
 * @function getStyles
 *
 * @returns {Promise<object>} Styles categorized by type.
 */
async function getStyles() {
  const styles = {
    colors: await figma.getLocalPaintStylesAsync(),
    texts: await figma.getLocalTextStylesAsync(),
    effects: await figma.getLocalEffectStylesAsync(),
    grids: await figma.getLocalGridStylesAsync(),
  };

  return {
    colors: styles.colors.map(style => ({
      id: style.id,
      name: style.name,
      key: style.key,
      paint: style.paints[0],
    })),
    texts: styles.texts.map(style => ({
      id: style.id,
      name: style.name,
      key: style.key,
      fontSize: style.fontSize,
      fontName: style.fontName,
    })),
    effects: styles.effects.map(style => ({
      id: style.id,
      name: style.name,
      key: style.key,
    })),
    grids: styles.grids.map(style => ({
      id: style.id,
      name: style.name,
      key: style.key,
    })),
  };
}

/**
 * Sets visual effects on a node.
 * @async
 * @function setEffects
 *
 * @param {object} params - Effect parameters.
 * @returns {object} Node id, name, and applied effects.
 */
async function setEffects(params) {
  const { nodeId, effects } = params || {};
  if (!nodeId) throw new Error("Missing nodeId parameter");
  if (!effects || !Array.isArray(effects)) throw new Error("Invalid effects parameter");

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found: ${nodeId}`);
  if (!("effects" in node)) throw new Error(`Node does not support effects: ${nodeId}`);

  const validEffects = effects.map(effect => {
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
}

/**
 * Applies an effect style to a node.
 * @async
 * @function setEffectStyleId
 *
 * @param {object} params - Parameters with nodeId and effectStyleId.
 * @returns {object} Node id, name, and applied effect style.
 */
async function setEffectStyleId(params) {
  const { nodeId, effectStyleId } = params || {};
  if (!nodeId) throw new Error("Missing nodeId parameter");
  if (!effectStyleId) throw new Error("Missing effectStyleId parameter");

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found: ${nodeId}`);
  if (!("effectStyleId" in node)) throw new Error(`Node does not support effect styles: ${nodeId}`);

  const effectStyles = await figma.getLocalEffectStylesAsync();
  const style = effectStyles.find(s => s.id === effectStyleId);
  if (!style) throw new Error(`Effect style not found: ${effectStyleId}`);

  node.effectStyleId = effectStyleId;
  return {
    id: node.id,
    name: node.name,
    effectStyleId: node.effectStyleId,
    appliedEffects: node.effects
  };
}

/**
 * Creates a gradient paint style in Figma.
 * @async
 * @function createGradientVariable
 */
async function createGradientVariable(params) {
  const { name, gradientType, stops } = params || {};
  if (!name || !gradientType || !Array.isArray(stops)) {
    throw new Error("Missing or invalid parameters for create_gradient_variable");
  }
  const paintStyle = figma.createPaintStyle();
  paintStyle.name = name;
  const typeMap = {
    LINEAR: "GRADIENT_LINEAR",
    RADIAL: "GRADIENT_RADIAL",
    ANGULAR: "GRADIENT_ANGULAR",
    DIAMOND: "GRADIENT_DIAMOND"
  };
  paintStyle.paints = [{
    type: typeMap[gradientType],
    gradientTransform: [[1, 0, 0], [0, 1, 0]],
    gradientStops: stops.map(s => ({
      position: s.position,
      color: { r: s.color[0], g: s.color[1], b: s.color[2], a: s.color[3] }
    }))
  }];
  return { id: paintStyle.id, name: paintStyle.name };
}

/**
 * Applies a gradient paint style to a node in Figma.
 * @async
 * @function applyGradientStyle
 */
async function applyGradientStyle(params) {
  const { nodeId, gradientStyleId, applyTo } = params || {};
  if (!nodeId || !gradientStyleId) {
    throw new Error("Missing nodeId or gradientStyleId for apply_gradient_style");
  }
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  const styles = await figma.getLocalPaintStylesAsync();
  const style = styles.find(s => s.id === gradientStyleId);
  if (!style) {
    throw new Error(`Gradient style not found: ${gradientStyleId}`);
  }
  
  // Get the actual paint definitions from the style
  const paints = style.paints;
  if (!paints || !paints.length) {
    throw new Error(`No paint definitions found in style: ${gradientStyleId}`);
  }
  
  // Apply the actual paint definitions directly
  if (applyTo === "FILL" || applyTo === "BOTH") {
    if (!("fills" in node)) throw new Error("Node does not support fills");
    node.fills = [...paints]; // Use spread operator to create a new array
  }
  
  if (applyTo === "STROKE" || applyTo === "BOTH") {
    if (!("strokes" in node)) throw new Error("Node does not support strokes");
    node.strokes = [...paints]; // Use spread operator to create a new array
  }
  
  return { id: node.id, name: node.name };
}

// Export all style operations as a grouped object
const styleOperations = {
  setStyle,
  setFillColor,
  setStrokeColor,
  getStyles,
  setEffects,
  setEffectStyleId,
  createGradientVariable,
  applyGradientStyle
};


// ----- components Module -----
/**
 * Components operations module.
 * Provides functions to retrieve and manage Figma components via MCP.
 *
 * Exposed functions:
 * - getLocalComponents(): Promise<{ count: number, components: Array<{ id: string, name: string, key: string|null }> }>
 * - getRemoteComponents(): Promise<{ success: boolean, count?: number, components?: Array<any>, error?: boolean, message?: string }>
 * - createComponentFromNode(params): Promise<{ success: boolean, componentId: string }>
 * - createComponentInstance(params): Promise<{ id: string, name: string, x: number, y: number, width: number, height: number, componentId: string }>
 * - createComponentInstances(params): Promise<{ instances: Array<any> }>
 * - exportNodeAsImage(params): Promise<{ nodeId: string, format: string, scale: number, mimeType: string, imageData: string }>
 *
 * @example
 *  * const locals = await componentOperations.getLocalComponents();
 * console.log(`Found ${locals.count} local components`);
 */

/**
 * Retrieves all local components available in the Figma document.
 * @async
 * @function getLocalComponents
 * @returns {Promise<{ count: number, components: Array<{ id: string, name: string, key: string|null }> }>}
 * @throws {Error} If Figma pages cannot be loaded
 * @example
 * const result = await getLocalComponents();
 * console.log(`Found ${result.count} components`, result.components);
 */
async function getLocalComponents() {
  await figma.loadAllPagesAsync();
  const comps = figma.root.findAllWithCriteria({ types: ["COMPONENT"] });
  return {
    count: comps.length,
    components: comps.map(c => ({
      id: c.id,
      name: c.name,
      key: "key" in c ? c.key : null
    }))
  };
}

/**
 * Retrieves remote components from team libraries.
 * @async
 * @function getRemoteComponents
 * @returns {Promise<{ success: boolean, count?: number, components?: Array<{ key: string, name: string, description: string, libraryName: string }>, error?: boolean, message?: string }>}
 * @example
 * const remote = await getRemoteComponents();
 * if (remote.success) {
 *   console.log(`Loaded ${remote.count} remote components`);
 * } else {
 *   console.error('Failed to load remote components:', remote.message);
 * }
 */
async function getRemoteComponents() {
  try {
    if (!figma.teamLibrary || !figma.teamLibrary.getAvailableComponentsAsync) {
      return { error: true, message: "Team library API unavailable", apiAvailable: !!figma.teamLibrary };
    }
    let timeoutId;
    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Timeout")), 15000);
    });
    const comps = await Promise.race([
      figma.teamLibrary.getAvailableComponentsAsync(),
      timeout
    ]).finally(() => clearTimeout(timeoutId));
    return { success: true, count: comps.length, components: comps.map(c => ({
      key: c.key, name: c.name, description: c.description || "", libraryName: c.libraryName
    })) };
  } catch (err) {
    return { error: true, message: err.message || String(err), stack: err.stack };
  }
}

/**
 * Converts an existing node into a component.
 * @param {{nodeId: string}} params
 * @returns {Promise<{success: boolean, componentId: string}>}
 */
/**
 * Converts an existing node into a component.
 *
 * @param {{nodeId: string}} params - Parameters including the node ID to convert.
 * @returns {Promise<{success: boolean, componentId: string}>} Result containing success flag and new component ID.
 * @throws {Error} If `nodeId` is missing or node not found.
 * @example
 * // Convert node '123:45' into a component
 * const result = await createComponentFromNode({ nodeId: '123:45' });
 * console.log(result.componentId);
 */
async function createComponentFromNode(params) {
  const { nodeId } = params;
  if (!nodeId) throw new Error("Missing nodeId");
  const node = figma.getNodeById(nodeId);
  if (!node) throw new Error(`Node not found: ${nodeId}`);
  const comp = figma.createComponentFromNode(node);
  figma.currentPage.appendChild(comp);
  return { success: true, componentId: comp.id };
}

/**
 * Creates an instance of a component by key.
 * @param {{componentKey: string, x?: number, y?: number}} params
 * @returns {Promise<{id: string, name: string, x: number, y: number, width: number, height: number, componentId: string}>}
 */
/**
 * Creates an instance of a component by its key.
 *
 * @param {{componentKey: string, x?: number, y?: number}} params - Component key and optional position.
 * @returns {Promise<{id: string, name: string, x: number, y: number, width: number, height: number, componentId: string}>}
 *    Details of the new instance including coordinates and ID.
 * @throws {Error} If `componentKey` is missing or import fails.
 * @example
 * // Create an instance of a published component
 * const inst = await createComponentInstance({ componentKey: 'ABC123', x: 100, y: 200 });
 * console.log(`Instance created at (${inst.x},${inst.y})`);
 */
async function createComponentInstance(params) {
  const { componentKey, x = 0, y = 0 } = params;
  if (!componentKey) throw new Error("Missing componentKey");
  const comp = await figma.importComponentByKeyAsync(componentKey);
  const inst = comp.createInstance();
  inst.x = x;
  inst.y = y;
  figma.currentPage.appendChild(inst);
  return {
    id: inst.id, name: inst.name,
    x: inst.x, y: inst.y,
    width: inst.width, height: inst.height,
    componentId: inst.componentId
  };
}

/**
 * Creates multiple component instances.
 * @param {{instances: Array<{componentKey: string, x?: number, y?: number}>}} params
 * @returns {Promise<{instances: Array<any>}>}
 */
async function createComponentInstances(params) {
  const { instances } = params;
  if (!Array.isArray(instances)) throw new Error("Missing instances array");
  const results = [];
  for (const cfg of instances) {
    results.push(await createComponentInstance(cfg));
  }
  return { instances: results };
}

/**
 * Exports a node as an image.
 * @param {{nodeId: string, format?: 'PNG'|'JPG'|'SVG'|'PDF', scale?: number}} params
 * @returns {Promise<{nodeId: string, format: string, scale: number, mimeType: string, imageData: string}>}
 */
async function exportNodeAsImage(params) {
  const { nodeId, format = "PNG", scale = 1 } = params;
  if (!nodeId) throw new Error("Missing nodeId");
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node || typeof node.exportAsync !== "function") {
    throw new Error(`Cannot node: ${nodeId}`);
  }
  const bytes = await node.exportAsync({ format, constraint: { type: "SCALE", value: scale } });
  const mime = format === "PNG" ? "image/png"
    : format === "JPG" ? "image/jpeg"
    : format === "SVG" ? "image/svg+xml"
    : format === "PDF" ? "application/pdf"
    : "application/octet-stream";
  const base64 = customBase64Encode(bytes);
  return { nodeId, format, scale, mimeType: mime, imageData: base64 };
}

const componentOperations = {
  getLocalComponents,
  getRemoteComponents,
  createComponentFromNode,
  createComponentInstance,
  createComponentInstances,
  exportNodeAsImage
};


// ----- layout Module -----
/**
 * Layout operations module.
 * Provides functions to configure auto-layout, resizing behaviors, grouping, ungrouping, and child insertion in Figma via MCP.
 *
 * Exposed functions:
 * - setAutoLayout(params): Promise<{ id: string, name: string, layoutMode: string, paddingTop: number, paddingBottom: number, paddingLeft: number, paddingRight: number, itemSpacing: number, primaryAxisAlignItems: string, counterAxisAlignItems: string, layoutWrap: string, strokesIncludedInLayout: boolean }>
 * - setAutoLayoutResizing(params): Promise<{ id: string, primaryAxisSizingMode: string, counterAxisSizingMode: string }>
 * - groupNodes(params): Promise<{ id: string, name: string, type: string, children: Array<{ id: string, name: string, type: string }> }>
 * - ungroupNodes(params): Promise<{ success: boolean, ungroupedCount: number, items: Array<{ id: string, name: string, type: string }> }>
 * - insertChild(params): Promise<{ parentId: string, childId: string, index: number, success: boolean, previousParentId: string|null }>
 *
 * @example
 *  * await layoutOperations.setAutoLayout({ nodeId: '123', layoutMode: 'HORIZONTAL', itemSpacing: 8 });
 */

/**
Ss a l pertson a noei Figa.
* Auto llwsfr autc arramendsof chds
/**wih a ntfm rup.
*
 *e@out pe{ibjatuows fo -aAutoalayort no fiaunatiigfparamechrllements
 *i@t fra {mt ong}ams.nod -Te D of theo toonfg
 * @arra T{('NONE'|'HORIZONTAL'|hVERTICAL )}mp{|'mZOlERTICM} pm-uLMode  Lrto
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
/**
 * Rename operations module.
 * Provides functions to rename Figma layers via template, regex replacement, AI assistance, and batch operations.
 *
 * Exposed functions:
 * - rename_layers(params)
 * - ai_rename_layers(params)
 * - rename_layer(params)
 * - rename_multiples(params)
 *
 * @module modules/rename
 * @example
 *  * // Template renaming
 * await rename_layers({ layer_ids: ['1','2'], new_name: 'Item ${asc}' });
 * // AI renaming
 * await ai_rename_layers({ layer_ids: ['1','2'], context_prompt: 'Use descriptive names' });
 */

/**
 * Rename Multiple Figma Layers
 * @async
 * @function rename_layers
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
 * @async
 * @function ai_rename_layers
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
 * @async
 * @function rename_layer
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
 * @async
 * @function rename_multiples
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

/**
 * Collection of all rename operation functions for convenience.
 *
 * @namespace renameOperations
 * @property {Function} rename_layers - Rename multiple layers using a template or regex.
 * @property {Function} ai_rename_layers - AI-assisted batch renaming of layers.
 * @property {Function} rename_layer - Rename a single layer with optional auto-rename for text.
 * @property {Function} rename_multiples - Rename multiple layers to specific names.
 */
const renameOperations = {
  rename_layers,
  ai_rename_layers,
  rename_layer,
  rename_multiples
};


// ----- commands Module -----
/**
 * Command registry and handler module for the Claude MCP Figma plugin.
 * Centralizes registration and dispatch of all tool commands (read, create, modify, rename, styling).
 *
 * Exposed functions:
 * - registerCommand(name: string, fn: Function): void
 * - initializeCommands(): void
 * - handleCommand(commandName: string, params: any): Promise<any>
 * - commandOperations: { initializeCommands, handleCommand }
 *
 * @module modules/commands
 * @example
 *  * initializeCommands();
 * const info = await handleCommand('get_document_info', {});
 * console.log(info);
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
/**
 * Registers a command handler function under a specific name.
 *
 * @param {string} name - The command identifier (e.g., 'create_rectangle').
 * @param {Function} fn - Handler function to execute when the command is called.
 * @throws {Error} If registration fails or if the command name is a duplicate.
 * @example
 * registerCommand('get_document_info', getDocumentInfo);
 */
function registerCommand(name, fn) {
  commandRegistry[name] = fn;
}

/**
 * Initializes and registers all available commands in the plugin
 * This function is called once during plugin initialization to set up the command system
 * Commands are organized by functional categories for better maintainability
 */
/**
 * Initializes and registers all available commands in the plugin.
 * This function is called once during plugin initialization to set up the command system.
 * @returns {void}
 * @example
 * // Initialize command handlers during plugin setup
 * initializeCommands();
 */
function initializeCommands() {
  // Document Operations
  // Handles document-level operations like getting document info and selection state
  registerCommand('get_document_info', documentOperations.getDocumentInfo);
  registerCommand('get_selection', documentOperations.getSelection);
  registerCommand('get_node_info', documentOperations.getNodeInfo);
  registerCommand('get_nodes_info', documentOperations.getNodesInfo);
  
  // Image Operations
  // Handles image insertion commands only
  registerCommand('insert_image', imageOperations.insertImage);
  registerCommand('insert_images', imageOperations.insertImages);
  registerCommand('insert_local_image', imageOperations.insertLocalImage);
  registerCommand('insert_local_images', imageOperations.insertLocalImages);

  // Shape Operations
  registerCommand('create_rectangle', shapeOperations.createRectangle);
  registerCommand('create_rectangles', shapeOperations.createRectangles);
  registerCommand('create_frame', shapeOperations.createFrame);
  registerCommand('create_frames', shapeOperations.createFrames);
  registerCommand('create_ellipse', shapeOperations.createEllipse);
  registerCommand('create_ellipses', shapeOperations.createEllipses);
  registerCommand('create_polygon', shapeOperations.createPolygon);
  registerCommand('create_polygons', shapeOperations.createPolygons);
  registerCommand('create_star', shapeOperations.createStar);
  registerCommand('create_vector', shapeOperations.createVector);
  registerCommand('create_vectors', shapeOperations.createVectors);
  registerCommand('create_line', shapeOperations.createLine);
  registerCommand('create_lines', shapeOperations.createLines);

  // Corner radius
  registerCommand('set_corner_radius', shapeOperations.setCornerRadius);
  // Resize operations
  registerCommand('resize_node', shapeOperations.resizeNode);
  registerCommand('resize_nodes', shapeOperations.resizeNodes);
  // Delete operations
  registerCommand('delete_node', shapeOperations.deleteNode);
  registerCommand('delete_nodes', shapeOperations.deleteNodes);
  // Move operations
  registerCommand('move_node', shapeOperations.moveNode);
  registerCommand('move_nodes', shapeOperations.moveNodes);
  // Flatten
  registerCommand('flatten_node', shapeOperations.flattenNode);

  // Boolean operation commands
  registerCommand('union_selection', shapeOperations.union_selection);
  registerCommand('subtract_selection', shapeOperations.subtract_selection);
  registerCommand('intersect_selection', shapeOperations.intersect_selection);
  registerCommand('exclude_selection', shapeOperations.exclude_selection);

  // Flatten Selection Tool
  // Flattens multiple selected nodes in Figma in one batch
  registerCommand('flatten_selection', async ({ nodeIds }) => {
    if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
      throw new Error('No nodes provided for flatten_selection');
    }
    // Select and flatten nodes
    const nodes = nodeIds
      .map(id => figma.getNodeById(id))
      .filter(node => node !== null);
    figma.currentPage.selection = nodes;
    figma.flatten();
    return { success: true, message: `Flattened ${nodes.length} nodes.` };
  });
  registerCommand('create_text', textOperations.createText);
  registerCommand('set_text_content', textOperations.setTextContent);
  registerCommand('create_bounded_text', textOperations.createBoundedText);
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
  registerCommand('export_node_as_image', componentOperations.exportNodeAsImage);
  // Component Conversion
  registerCommand('create_component_from_node', componentOperations.createComponentFromNode);
  registerCommand('create_component_instance', componentOperations.createComponentInstance);
  
  // Gradient Operations
  registerCommand('create_gradient_variable', styleOperations.createGradientVariable);
  registerCommand('apply_gradient_style', styleOperations.applyGradientStyle);

  // Detach Instance Tool
  registerCommand('detach_instance', async (params) => {
    const { instanceId } = params;
    const node = figma.getNodeById(instanceId);
    if (!node) {
      throw new Error(`No node found with ID: ${instanceId}`);
    }
    if (node.type !== 'INSTANCE') {
      throw new Error('Node is not a component instance');
    }
    const detached = node.detachInstance();
    return { id: detached.id, name: detached.name };
  });

  registerCommand('rename_layer', renameOperations.rename_layer);
  registerCommand('rename_multiple', renameOperations.rename_multiples);

  // Group/Ungroup operations
  registerCommand('group_nodes', layoutOperations.groupNodes);
  registerCommand('ungroup_nodes', layoutOperations.ungroupNodes);
  
  // Auto Layout operations
  registerCommand('set_auto_layout', layoutOperations.setAutoLayout);
  registerCommand('set_auto_layout_resizing', layoutOperations.setAutoLayoutResizing);
  
  // UI Component operations
  registerCommand('create_button', uiComponents.createButton);
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
 * Main entry point for the Claude MCP Figma plugin.
 * Initializes the UI panel, registers command handlers, and mediates communication
 * between the Figma plugin environment and the Model Context Protocol server.
 *
 * Exposed UI messages:
 * - update-settings(params): Persist plugin settings (e.g., port configuration)
 * - notify(message): Display a Figma notification
 * - close-plugin(): Close the plugin
 * - execute-command(commandName, params): Invoke a registered command on the MCP server
 *
 * @module index
 * @example
 * import './index.js';
 * // The plugin UI is shown automatically and commands are ready to execute
 */


// Show the plugin UI with fixed dimensions
figma.showUI(__html__, { width: 350, height: 450 });

// Register all available command handlers
initializeCommands();

/**
 * Handles messages sent from the UI.
 *
 * Supported message types:
 * - update-settings: Persist plugin settings (e.g., port)
 * - notify: Display a Figma notification
 * - close-plugin: Terminate the plugin
 * - execute-command: Invoke a registered command and return its result
 *
 * @param {{ type: string, id?: string, command?: string, params?: any, message?: string }} msg
 * @returns {void}
 * @example
 * figma.ui.postMessage({ pluginMessage: { type: 'notify', message: 'Hello' } });
 */
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case 'update-settings':
      updateSettings(msg);
      break;
    case 'notify':
      figma.notify(msg.message);
      break;
    case 'close-plugin':
      figma.closePlugin();
      break;
    case 'execute-command':
      try {
        const result = await handleCommand(msg.command, msg.params);
        figma.ui.postMessage({
          type: 'command-result',
          id: msg.id,
          result
        });
      } catch (error) {
        figma.ui.postMessage({
          type: 'command-error',
          id: msg.id,
          error: error.message || 'Error executing command'
        });
      }
      break;
    default:
      console.warn('Unhandled UI message type:', msg.type);
  }
};

/**
 * Invoked when the plugin is run from the Figma menu.
 * Automatically triggers a WebSocket connection to the MCP server.
 *
 * @param {{ command: string }} args - The command that launched the plugin
 * @returns {void}
 * @example
 * // In manifest.json:
 * // { "command": "Auto Connect", "name": "Auto-Connect" }
 * figma.on('run', ({ command }) => { ... });
 */
figma.on('run', ({ command }) => {
  figma.ui.postMessage({ type: 'auto-connect' });
});

// Perform initial plugin setup and notify the UI of current settings
initializePlugin();
