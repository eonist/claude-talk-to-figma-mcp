/**
 * SVG operations module.
 * Provides functions to insert SVG vectors into Figma via MCP.
 *
 * Exposed functions:
 * - insertSvgVector(params)
 *
 * @module modules/svg
 */

/**
 * Inserts a single SVG vector into the document.
 *
 * @async
 * @function insertSvgVector
 * @param {{ svg: string, x?: number, y?: number, name?: string, parentId?: string }} params
 *   - svg: Raw SVG text.
 *   - x: X coordinate for placement (default 0).
 *   - y: Y coordinate for placement (default 0).
 *   - name: Node name (default "SVG Vector").
 *   - parentId: Optional parent node ID for placement.
 * @returns {Promise<{ id: string, name: string }>} Created vector node details.
 * @throws {Error} If parent node is not found.
 */
export async function insertSvgVector(params) {
  const { svg, x = 0, y = 0, name = "SVG Vector", parentId } = params || {};
  // Create vector nodes from SVG
  const result = figma.createNodeFromSvg(svg);
  // createNodeFromSvg may return a single node or an array
  const node = Array.isArray(result) ? result[0] : result;
  // Position and name
  node.x = x;
  node.y = y;
  node.name = name;
  // Append to specified parent or current page
  const parent = parentId
    ? await figma.getNodeByIdAsync(parentId)
    : figma.currentPage;
  if (parentId && !parent) {
    throw new Error(`Parent not found: ${parentId}`);
  }
  parent.appendChild(node);
  return { id: node.id, name: node.name };
}
