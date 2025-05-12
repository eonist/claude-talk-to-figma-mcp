/**
 * Safely converts a node ID to a string.
 * Guards against passing objects as node IDs, which would result in "[object Object]".
 *
 * @param nodeId - The node ID to convert to a string
 * @returns The node ID as a string
 * @throws Error if the node ID is an object (not null) or undefined
 */
export function ensureNodeIdIsString(nodeId: any): string {
  if (nodeId === null || nodeId === undefined) {
    throw new Error("Node ID cannot be null or undefined");
  }

  // Check if nodeId is an object but not a string (strings are also objects in JS)
  if (typeof nodeId === "object" && nodeId !== null) {
    throw new Error(
      `Invalid node ID: Received an object instead of a string ID. Use the node's 'id' property instead of passing the whole node object.`
    );
  }

  return String(nodeId);
}
