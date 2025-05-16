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
 * Inserts one or more SVG vectors into the document.
 * Accepts either a single object (svg) or an array (svgs).
 *
 * @async
 * @function insertSvgVector
 * @param {{ svg?: object, svgs?: Array<object> }} params
 *   - svg: Single SVG config ({ svg, x, y, name, parentId }).
 *   - svgs: Array of SVG configs.
 * @returns {Promise<{ ids: string[] }>} Created vector node IDs.
 * @throws {Error} If parent node is not found.
 */
export async function insertSvgVector(params) {
  let svgsArr;
  if (params.svgs) {
    svgsArr = params.svgs;
  } else if (params.svg) {
    svgsArr = [params.svg];
  } else {
    // Fallback for legacy single input
    svgsArr = [params];
  }
  svgsArr = svgsArr.filter(Boolean);
  const ids = [];
  for (const cfg of svgsArr) {
    const { svg, x = 0, y = 0, name = "SVG Vector", parentId } = cfg || {};
    // Determine content: raw SVG text or URL fetch
    const content = svg.startsWith('http') ? await fetch(svg).then(res => res.text()) : svg;
    // Create vector nodes from SVG
    const result = figma.createNodeFromSvg(content);
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
    ids.push(node.id);
  }
  return { ids };
}
