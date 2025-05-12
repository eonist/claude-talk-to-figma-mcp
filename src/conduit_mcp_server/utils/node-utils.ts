/**
 * Node utilities module.
 * Provides helpers for validating and converting Figma node identifiers.
 *
 * Exposed functions:
 * - ensureNodeIdIsString(nodeId: any): string
 *
 * @module utils/node-utils
 * @example
 * import { ensureNodeIdIsString } from './node-utils.js';
 * const id = ensureNodeIdIsString(node.id);
 */
/**
 * Ensure a Figma node ID is a string.
 *
 * @param {any} nodeId - The node ID to validate and convert.
 * @returns {string} The node ID as a string.
 * @throws {Error} If nodeId is null, undefined, or an object.
 * @example
 * ensureNodeIdIsString(123); // "123"
 * ensureNodeIdIsString("abc"); // "abc"
 * ensureNodeIdIsString({}); // throws Error
 */
export function ensureNodeIdIsString(nodeId: any): string {
  if (nodeId === null || nodeId === undefined) {
    throw new Error("Node ID cannot be null or undefined");
  }
  
  // Check if nodeId is an object but not a string (strings are also objects in JS)
  if (typeof nodeId === 'object' && nodeId !== null) {
    throw new Error(`Invalid node ID: Received an object instead of a string ID. Use the node's 'id' property instead of passing the whole node object.`);
  }
  
  return String(nodeId);
}
