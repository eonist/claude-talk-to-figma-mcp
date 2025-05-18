/**
 * Node info operations for Figma documents.
 * Exports: getNodeInfo, ensureNodeIdIsString
 */

/**
 * Safely converts a node ID to a string.
 *
 * @param {string|number} nodeId - The node ID to convert.
 * @returns {string} The node ID as a string.
 * @throws {Error} If nodeId is null, undefined, or an object.
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
 *
 * @async
 * @function
 * @param {string|Object} nodeIdOrParams - Node ID as a string, or an object with nodeId or id property.
 * @returns {Promise<Object>} The node's document info, or a fallback with id, name, and type.
 * @throws {Error} If the node is not found or the parameter is invalid.
 */
export async function getNodeInfo(params) {
  // Accepts: nodeId (string), nodeIds (array), or params object
  let nodeIds = [];
  if (typeof params === "string") {
    nodeIds = [ensureNodeIdIsString(params)];
  } else if (params && typeof params.nodeId === "string") {
    nodeIds = [ensureNodeIdIsString(params.nodeId)];
  } else if (params && Array.isArray(params.nodeIds)) {
    nodeIds = params.nodeIds.map(ensureNodeIdIsString);
  } else {
    throw new Error("Must provide 'nodeId' or 'nodeIds'");
  }
  const results = [];
  for (const nodeId of nodeIds) {
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) {
      results.push({ nodeId, error: "Node not found" });
      continue;
    }
    try {
      const response = await node.exportAsync({ format: "JSON_REST_V1" });
      results.push({ nodeId, document: response.document });
    } catch (error) {
      results.push({
        nodeId: node.id,
        document: {
          id: node.id,
          name: node.name,
          type: node.type || "UNKNOWN"
        }
      });
    }
  }
  // Return single object if only one node, else array
  return results.length === 1 ? results[0] : results;
}

/**
 * Retrieves information for multiple nodes simultaneously using parallel processing.
 *
 * @async
 * @function
 * @param {Array<string>|Object} nodeIdsOrParams - Array of node IDs, or an object with a nodeIds property.
 * @returns {Promise<Array<{nodeId: string, document: Object}>>} Array of node info objects.
 * @throws {Error} If parameters are invalid or nodes cannot be found.
 */
