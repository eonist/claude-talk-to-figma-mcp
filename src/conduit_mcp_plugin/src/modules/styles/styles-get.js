/**
 * Retrieves local style definitions from Figma.
 *
 * @async
 * @function
 * @returns {Promise<{
 *   colors: Array<{ id: string, name: string, key: string, paint: object }>,
 *   texts: Array<{ id: string, name: string, key: string, fontSize: number, fontName: object }>,
 *   effects: Array<{ id: string, name: string, key: string }>,
 *   grids: Array<{ id: string, name: string, key: string }>
 * }>} Styles categorized by type.
 * @throws {Error} If Figma API calls fail.
 */
export async function getStyles() {
  const styles = {
    colors: await figma.getLocalPaintStylesAsync(),
    texts: await figma.getLocalTextStylesAsync(),
    effects: await figma.getLocalEffectStylesAsync(),
    grids: await figma.getLocalGridStylesAsync(),
  };

  return {
    colors: styles.colors.map(style => ({
      id: style.id,
      name: style.name,
      key: style.key,
      paint: style.paints[0],
    })),
    texts: styles.texts.map(style => ({
      id: style.id,
      name: style.name,
      key: style.key,
      fontSize: style.fontSize,
      fontName: style.fontName,
    })),
    effects: styles.effects.map(style => ({
      id: style.id,
      name: style.name,
      key: style.key,
    })),
    grids: styles.grids.map(style => ({
      id: style.id,
      name: style.name,
      key: style.key,
    })),
  };
}

/**
 * Gets fill and/or stroke color(s) and stroke weight for one or more nodes.
 * @param {Object} params - { nodeId } or { nodeIds }
 * @returns {Promise<Array<{ nodeId: string, fills: Array, strokes: Array, strokeWeight?: number, error?: string }>>}
 */
export async function getFillAndStroke(params) {
  let ids = [];
  if (Array.isArray(params.nodeIds) && params.nodeIds.length > 0) {
    ids = params.nodeIds;
  } else if (params.nodeId) {
    ids = [params.nodeId];
  } else {
    throw new Error("getFillAndStroke: Provide either nodeId or nodeIds.");
  }
  const results = [];
  for (const nodeId of ids) {
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) {
      results.push({ nodeId, error: "Node not found" });
      continue;
    }
    results.push({
      nodeId,
      fills: "fills" in node ? node.fills : [],
      strokes: "strokes" in node ? node.strokes : [],
      strokeWeight: "strokeWeight" in node ? node.strokeWeight : undefined
    });
  }
  return results;
}
