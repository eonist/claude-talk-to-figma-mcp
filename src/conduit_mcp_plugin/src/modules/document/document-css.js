/**
 * CSS extraction operation for Figma nodes.
 * Exports: getCssAsync
 */

/**
 * Gets CSS properties from a node.
 * @async
 * @function getCssAsync
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
