/**
 * Font setting operations for Figma text nodes.
 * Exports: setFontName, setFontSize, setFontWeight, setLetterSpacing, setLineHeight, setParagraphSpacing
 */

/**
 * Helper to map numeric font weight to Figma style string.
 * @param {number} weight
 * @returns {string}
 */
function getFontStyle(weight) {
  switch (weight) {
    case 100: return "Thin";
    case 200: return "Extra Light";
    case 300: return "Light";
    case 400: return "Regular";
    case 500: return "Medium";
    case 600: return "Semi Bold";
    case 700: return "Bold";
    case 800: return "Extra Bold";
    case 900: return "Black";
    default: return "Regular";
  }
}

/**
 * Update the font family and style of a text node.
 */
export async function setFontName(params) {
  const { nodeId, family, style = "Regular" } = params || {};
  if (!nodeId || !family) throw new Error("Missing nodeId or font family");
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found with ID: ${nodeId}`);
  if (node.type !== "TEXT") throw new Error(`Node is not a text node: ${nodeId}`);
  try {
    await figma.loadFontAsync({ family, style });
    node.fontName = { family, style };
    return { id: node.id, name: node.name, fontName: node.fontName };
  } catch (error) {
    throw new Error(`Error setting font name: ${error.message}`);
  }
}

/**
 * Update the font size of a text node.
 */
export async function setFontSize(params) {
  const { nodeId, fontSize } = params || {};
  if (!nodeId || fontSize === undefined) throw new Error("Missing nodeId or fontSize");
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found with ID: ${nodeId}`);
  if (node.type !== "TEXT") throw new Error(`Node is not a text node: ${nodeId}`);
  try {
    await figma.loadFontAsync(node.fontName);
    node.fontSize = fontSize;
    return { id: node.id, name: node.name, fontSize: node.fontSize };
  } catch (error) {
    throw new Error(`Error setting font size: ${error.message}`);
  }
}

/**
 * Update the font weight of a text node.
 */
export async function setFontWeight(params) {
  const { nodeId, weight } = params || {};
  if (!nodeId || weight === undefined) throw new Error("Missing nodeId or weight");
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found with ID: ${nodeId}`);
  if (node.type !== "TEXT") throw new Error(`Node is not a text node: ${nodeId}`);
  try {
    const family = node.fontName.family;
    const style = getFontStyle(weight);
    await figma.loadFontAsync({ family, style });
    node.fontName = { family, style };
    return { id: node.id, name: node.name, fontName: node.fontName, weight: weight };
  } catch (error) {
    throw new Error(`Error setting font weight: ${error.message}`);
  }
}

/**
 * Update the letter spacing of a text node.
 */
export async function setLetterSpacing(params) {
  const { nodeId, letterSpacing, unit = "PIXELS" } = params || {};
  if (!nodeId || letterSpacing === undefined) throw new Error("Missing nodeId or letterSpacing");
  if (unit !== "PIXELS" && unit !== "PERCENT") throw new Error("Invalid unit: must be 'PIXELS' or 'PERCENT'");
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found with ID: ${nodeId}`);
  if (node.type !== "TEXT") throw new Error(`Node is not a text node: ${nodeId}`);
  try {
    await figma.loadFontAsync(node.fontName);
    node.letterSpacing = { value: letterSpacing, unit: unit };
    return { id: node.id, name: node.name, letterSpacing: node.letterSpacing };
  } catch (error) {
    throw new Error(`Error setting letter spacing: ${error.message}`);
  }
}

/**
 * Update the line height of a text node.
 */
export async function setLineHeight(params) {
  const { nodeId, lineHeight, unit = "PIXELS" } = params || {};
  if (!nodeId || lineHeight === undefined) throw new Error("Missing nodeId or lineHeight");
  if (unit !== "PIXELS" && unit !== "PERCENT" && unit !== "AUTO") throw new Error("Invalid unit: must be 'PIXELS', 'PERCENT', or 'AUTO'");
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found with ID: ${nodeId}`);
  if (node.type !== "TEXT") throw new Error(`Node is not a text node: ${nodeId}`);
  try {
    await figma.loadFontAsync(node.fontName);
    if (unit === "AUTO") {
      node.lineHeight = { unit: "AUTO" };
    } else {
      node.lineHeight = { value: lineHeight, unit: unit };
    }
    return { id: node.id, name: node.name, lineHeight: node.lineHeight };
  } catch (error) {
    throw new Error(`Error setting line height: ${error.message}`);
  }
}

/**
 * Update the paragraph spacing of a text node.
 */
export async function setParagraphSpacing(params) {
  const { nodeId, paragraphSpacing } = params || {};
  if (!nodeId || paragraphSpacing === undefined) throw new Error("Missing nodeId or paragraphSpacing");
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found with ID: ${nodeId}`);
  if (node.type !== "TEXT") throw new Error(`Node is not a text node: ${nodeId}`);
  try {
    await figma.loadFontAsync(node.fontName);
    node.paragraphSpacing = paragraphSpacing;
    return { id: node.id, name: node.name, paragraphSpacing: node.paragraphSpacing };
  } catch (error) {
    throw new Error(`Error setting paragraph spacing: ${error.message}`);
  }
}
