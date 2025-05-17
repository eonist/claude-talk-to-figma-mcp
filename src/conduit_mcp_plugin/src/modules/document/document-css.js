/**
 * CSS extraction operation for Figma nodes.
 * Exports: getCssAsync
 */

/**
 * Gets CSS properties from a node.
 *
 * @async
 * @function
 * @param {Object} [params={}] - Parameters for CSS extraction.
 * @param {string} [params.nodeId] - The Figma node ID to extract CSS from. If omitted, uses the current selection.
 * @param {"object"|"string"|"inline"} [params.format="string"] - Output format: "object" (raw object), "string" (CSS block), or "inline" (single-line CSS).
 * @returns {Promise<Object|string>} The CSS properties as an object, string, or inline string depending on the format.
 * @throws {Error} If no node is found for extraction.
 */
export async function getCssAsync(params = {}) {
  const { nodeId, format = "string" } = params;
  let node;
  if (nodeId) {
    node = await figma.getNodeByIdAsync(String(nodeId));
  } else {
    node = figma.currentPage.selection[0];
  }
  if (!node) throw new Error("No node found for CSS extraction");
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
