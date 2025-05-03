/**
 * Document operations module
 * 
 * Contains functions for operating on the Figma document and retrieving information.
 */

interface DocumentResponse {
  document: any;
}

/**
 * Retrieves detailed information about the current Figma page.
 */
export async function getDocumentInfo() {
  // We'll skip the loadAsync call as it's not in our type definitions
  const page = figma.currentPage;
  return {
    name: page.name,
    id: page.id,
    type: "PAGE", // Setting explicitly as PageNode
    children: page.children.map((node) => ({
      id: node.id,
      name: node.name,
      type: (node as any).type || "UNKNOWN",
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
 */
export async function getSelection() {
  // Getting the selection from figma.currentPage.selection if available
  const selection = (figma.currentPage as any).selection || [];
  return {
    selectionCount: selection.length,
    selection: selection.map((node: SceneNode) => ({
      id: node.id,
      name: node.name,
      type: (node as any).type || "UNKNOWN",
      visible: node.visible,
    })),
  };
}

/**
 * Retrieves exported information for a specified node.
 */
export async function getNodeInfo(nodeId: string) {
  const node = await figma.getNodeByIdAsync(nodeId);

  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  try {
    const response = await node.exportAsync({
      format: "JSON_REST_V1",
    }) as unknown as DocumentResponse;

    return response.document;
  } catch (error) {
    // If the exportAsync method doesn't work as expected, return basic node info
    return {
      id: node.id,
      name: node.name,
      type: (node as any).type || "UNKNOWN"
    };
  }
}

/**
 * Retrieves exported information for multiple nodes.
 */
export async function getNodesInfo(nodeIds: string[]) {
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
          const response = await node!.exportAsync({
            format: "JSON_REST_V1",
          }) as unknown as DocumentResponse;
          
          return {
            nodeId: node!.id,
            document: response.document,
          };
        } catch (error) {
          // If the export fails, return basic info
          return {
            nodeId: node!.id,
            document: {
              id: node!.id,
              name: node!.name,
              type: (node! as any).type || "UNKNOWN"
            }
          };
        }
      })
    );

    return responses;
  } catch (error) {
    throw new Error(`Error getting nodes info: ${(error as Error).message}`);
  }
}

// Export the operations as a group
export const documentOperations = {
  getDocumentInfo,
  getSelection,
  getNodeInfo,
  getNodesInfo
};
