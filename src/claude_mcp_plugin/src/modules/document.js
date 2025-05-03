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

// Export the operations as a group
export const documentOperations = {
  getDocumentInfo,
  getSelection,
  getNodeInfo,
  getNodesInfo
};
