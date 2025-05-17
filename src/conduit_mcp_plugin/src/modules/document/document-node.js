/**
 * Node info operations for Figma documents.
 * Exports: getNodeInfo, getNodesInfo, ensureNodeIdIsString
 */

/**
 * Safely converts a node ID to a string.
 */
export function ensureNodeIdIsString(nodeId) {
  if (nodeId === null || nodeId === undefined) {
    throw new Error("Node ID cannot be null or undefined");
  }
  if (typeof nodeId === 'object' && nodeId !== null) {
    throw new Error(`Invalid node ID: Received an object instead of a string ID. Use the node's 'id' property instead of passing the whole node object.`);
  }
  return String(nodeId);
}

/**
 * Retrieves detailed information about a specific node in the Figma document.
 */
export async function getNodeInfo(nodeIdOrParams) {
  let id;
  if (typeof nodeIdOrParams === 'object' && nodeIdOrParams !== null) {
    if (nodeIdOrParams.nodeId !== undefined) {
      id = ensureNodeIdIsString(nodeIdOrParams.nodeId);
    } else if (nodeIdOrParams.id !== undefined) {
      id = ensureNodeIdIsString(nodeIdOrParams.id);
    } else {
      throw new Error("Invalid node ID: Received an object without nodeId or id property");
    }
  } else {
    id = ensureNodeIdIsString(nodeIdOrParams);
  }
  const node = await figma.getNodeByIdAsync(id);
  if (!node) throw new Error(`Node not found with ID: ${id}`);
  try {
    const response = await node.exportAsync({ format: "JSON_REST_V1" });
    return response.document;
  } catch (error) {
    return {
      id: node.id,
      name: node.name,
      type: node.type || "UNKNOWN"
    };
  }
}

/**
 * Retrieves information for multiple nodes simultaneously using parallel processing.
 */
export async function getNodesInfo(nodeIdsOrParams) {
  try {
    let idsToProcess;
    if (typeof nodeIdsOrParams === 'object' && nodeIdsOrParams !== null && !Array.isArray(nodeIdsOrParams)) {
      if (nodeIdsOrParams.nodeIds !== undefined) {
        idsToProcess = nodeIdsOrParams.nodeIds;
      } else {
        throw new Error("Invalid parameter: Expected an array of node IDs or an object with a nodeIds property");
      }
    } else {
      idsToProcess = nodeIdsOrParams;
    }
    if (!Array.isArray(idsToProcess)) {
      throw new Error(`Expected an array of node IDs, but got: ${typeof idsToProcess}`);
    }
    const processedIds = idsToProcess.map(id => ensureNodeIdIsString(id));
    const nodes = await Promise.all(
      processedIds.map((id) => figma.getNodeByIdAsync(id))
    );
    const validNodes = nodes.filter((node) => node !== null);
    const responses = await Promise.all(
      validNodes.map(async (node) => {
        try {
          const response = await node.exportAsync({ format: "JSON_REST_V1" });
          return { nodeId: node.id, document: response.document };
        } catch (error) {
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
