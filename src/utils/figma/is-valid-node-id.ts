/**
 * Checks if a Figma node ID is valid (simple or complex format).
 * - Simple: "123:456"
 * - Complex: "I422:10713;1082:2236"
 */
export function isValidNodeId(nodeId: string): boolean {
  const simple = /^\d+:\d+$/;
  const complex = /^I?\d+:\d+(?:;\d+:\d+)*$/;
  return simple.test(nodeId) || complex.test(nodeId);
}
