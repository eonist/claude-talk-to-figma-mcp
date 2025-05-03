// Document operations module
// This module provides functions for retrieving information about the Figma document,
// including page details, selection state, and node information.

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
export async function getDocumentInfo() {
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
export async function getSelection() {
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
 * Attempts to export the node in JSON_REST_V1 format, falling back to basic
 * properties if export is not supported for the node type.
 *
 * @param {string} nodeId - The unique identifier of the node to retrieve
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
export async function getNodeInfo(nodeId) {
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
 * Retrieves information for multiple nodes simultaneously using parallel processing.
 * Nodes that cannot be found are automatically filtered out of the results.
 *
 * @param {string[]} nodeIds - Array of node IDs to retrieve information for
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
export async function getNodesInfo(nodeIds) {
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

// Export all document operations as a named group for convenient importing
export const documentOperations = {
  getDocumentInfo,
  getSelection,
  getNodeInfo,
  getNodesInfo
};
