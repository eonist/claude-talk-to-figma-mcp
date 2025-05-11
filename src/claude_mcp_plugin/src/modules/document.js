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
 * import { documentOperations } from './modules/document.js';
 * // Get basic document info
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
export function ensureNodeIdIsString(nodeId) {
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
export async function getDocumentInfo() {
  const page = figma.currentPage;
  console.log(`[DOCUMENT DEBUG] Getting document info for page: ${page.name} (${page.id})`);
  console.log(`[DOCUMENT DEBUG] Page has ${page.children.length} top-level nodes`);
  
  // Log child nodes for debugging
  if (page.children.length > 0) {
    page.children.forEach((node, index) => {
      console.log(`[DOCUMENT DEBUG] Child ${index+1}: ID=${node.id}, Name=${node.name}, Type=${node.type}`);
    });
  }
  
  const result = {
    name: page.name,
    id: page.id,
    type: "PAGE",
    children: page.children.map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type || "UNKNOWN",
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      visible: node.visible
    })),
    currentPage: {
      id: page.id,
      name: page.name,
      childCount: page.children.length,
      backgroundColor: (page.backgrounds && page.backgrounds.length > 0 && page.backgrounds[0].color) ? page.backgrounds[0].color : null
    },
    pages: [
      {
        id: page.id,
        name: page.name,
        childCount: page.children.length,
      },
    ],
    _debug: {
      timestamp: Date.now(),
      command: "getDocumentInfo"
    }
  };
  
  console.log(`[DOCUMENT RESULT] Returning document data with ${result.children.length} children`);
  return result;
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
export async function getSelection() {
  // Getting the selection from figma.currentPage.selection if available
  const selection = figma.currentPage.selection || [];
  console.log(`[SELECTION DEBUG] Found ${selection.length} selected items`);
  
  // Log each selected node for debugging
  if (selection.length > 0) {
    selection.forEach((node, index) => {
      console.log(`[SELECTION DEBUG] Item ${index+1}: ID=${node.id}, Name=${node.name}, Type=${node.type}`);
    });
  }
  
  const result = {
    selectionCount: selection.length,
    selection: selection.map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type || "UNKNOWN",
      visible: node.visible,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height
    })),
    _debug: {
      timeStamp: Date.now(),
      command: "getSelection"
    }
  };
  
  console.log(`[SELECTION RESULT] Returning selection data:`, result);
  return result;
}

/**
 * Retrieves detailed information about a specific node in the Figma document.
 * @async
 * @function getNodeInfo
 * Attempts to export the node in JSON_REST_V1 format, falling back to basic
 * properties if export is not supported for the node type.
 *
 * @param {string|Object} nodeIdOrParams - The unique identifier of the node to retrieve,
 *   an object containing an id property, or an MCP params object with nodeId property
 * @returns {Promise<Object>} The node's exported document data or basic properties:
 *   - If export succeeds: Complete node data in JSON_REST_V1 format
 *   - If export fails: Basic node properties (id, name, type)
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
export async function getNodeInfo(nodeIdOrParams) {
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
 *   - document: Either the full JSON_REST_V1 export data or basic node properties
 *     if export is not supported
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
export async function getNodesInfo(nodeIdsOrParams) {
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
          // If the export fails, return basic info
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
export async function getCssAsync(params = {}) {
  const { nodeId, format = "string" } = params;
  let node;
  if (nodeId) {
    node = await figma.getNodeByIdAsync(ensureNodeIdIsString(nodeId));
  } else {
    node = figma.currentPage.selection[0];
  }
  if (!node) {
    throw new Error("No node found for CSS extraction");
  }
  const cssProps = await node.getCSSAsync();
  let output;
  if (format === "object") {
    output = cssProps;
  } else if (format === "inline") {
    output = Object.entries(cssProps).map(([k, v]) => `${k}:${v}`).join(";");
  } else {
    output = Object.entries(cssProps).map(([k, v]) => `${k}: ${v};`).join("\n");
  }
  return output;
}

export const documentOperations = {
  getDocumentInfo,
  getSelection,
  getNodeInfo,
  getNodesInfo,
  ensureNodeIdIsString,
  getCssAsync
};
