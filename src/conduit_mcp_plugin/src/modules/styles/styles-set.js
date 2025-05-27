/**
 * Unified style management for Figma: create, update, delete (PAINT, EFFECT, TEXT, GRID).
 * Used by MCP set_style command.
 *
 * @param {object} entry - Single style operation
 * @param {string} [entry.styleId] - Required for update/delete, omitted for create
 * @param {"PAINT"|"EFFECT"|"TEXT"|"GRID"} entry.styleType
 * @param {object} [entry.properties] - Properties to set (required for create/update, omitted for delete)
 * @param {boolean} [entry.delete] - If true, deletes the style (ignores properties)
 * @returns {Promise<object>} Result: { styleId, styleType, action, success, [error] }
 */
export async function setStyle(entry) {
  const { styleId, styleType, properties, delete: del } = entry || {};
  let style = null;
  let action = null;
  let resultId = styleId;

  // Helper: get style list and Figma API type
  async function getStyleListAndType(type) {
    switch (type) {
      case "PAINT": return [await figma.getLocalPaintStylesAsync(), "PAINT"];
      case "EFFECT": return [await figma.getLocalEffectStylesAsync(), "EFFECT"];
      case "TEXT": return [await figma.getLocalTextStylesAsync(), "TEXT"];
      case "GRID": return [await figma.getLocalGridStylesAsync(), "GRID"];
      default: throw new Error("Unknown styleType: " + type);
    }
  }

  // Delete
  if (styleId && del) {
    const [styles] = await getStyleListAndType(styleType);
    style = styles.find(s => s.id === styleId);
    if (!style) return { styleId, styleType, action: "deleted", success: false, error: "Style not found" };
    style.remove();
    return { styleId, styleType, action: "deleted", success: true };
  }

  // Update
  if (styleId && properties && !del) {
    const [styles] = await getStyleListAndType(styleType);
    style = styles.find(s => s.id === styleId);
    if (!style) return { styleId, styleType, action: "updated", success: false, error: "Style not found" };
    if (properties.name) style.name = properties.name;
    if (styleType === "PAINT" && properties.paints) style.paints = properties.paints;
    if (styleType === "EFFECT" && properties.effects) style.effects = properties.effects;
    if (styleType === "TEXT") {
      if (properties.fontSize) style.fontSize = properties.fontSize;
      if (properties.fontName) style.fontName = properties.fontName;
      if (properties.letterSpacing) style.letterSpacing = properties.letterSpacing;
      if (properties.lineHeight) style.lineHeight = properties.lineHeight;
      // Add more text style props as needed
    }
    if (styleType === "GRID" && properties.layoutGrids) style.layoutGrids = properties.layoutGrids;
    return { styleId, styleType, action: "updated", success: true };
  }

  // Create
  if (!styleId && properties && !del) {
    switch (styleType) {
      case "PAINT": {
        style = figma.createPaintStyle();
        if (properties.name) style.name = properties.name;
        if (properties.paints) style.paints = properties.paints;
        resultId = style.id;
        break;
      }
      case "EFFECT": {
        style = figma.createEffectStyle();
        if (properties.name) style.name = properties.name;
        if (properties.effects) style.effects = properties.effects;
        resultId = style.id;
        break;
      }
      case "TEXT": {
        style = figma.createTextStyle();
        if (properties.name) style.name = properties.name;
        if (properties.fontSize) style.fontSize = properties.fontSize;
        if (properties.fontName) style.fontName = properties.fontName;
        if (properties.letterSpacing) style.letterSpacing = properties.letterSpacing;
        if (properties.lineHeight) style.lineHeight = properties.lineHeight;
        // Add more text style props as needed
        resultId = style.id;
        break;
      }
      case "GRID": {
        style = figma.createGridStyle();
        if (properties.name) style.name = properties.name;
        if (properties.layoutGrids) style.layoutGrids = properties.layoutGrids;
        resultId = style.id;
        break;
      }
      default:
        throw new Error("Unknown styleType: " + styleType);
    }
    return { styleId: resultId, styleType, action: "created", success: true };
  }

  // Invalid
  return { styleId, styleType, success: false, error: "Invalid setStyle operation" };
}

// Ensure named export for module systems
export { setFillAndStrokeUnified };
