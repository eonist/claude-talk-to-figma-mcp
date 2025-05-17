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
 *
 * @async
 * @function
 * @param {Object} params - Parameters for setting font name.
 * @param {string} params.nodeId - The ID of the text node.
 * @param {string} params.family - The font family to set.
 * @param {string} [params.style="Regular"] - The font style to set.
 * @returns {Promise<{id: string, name: string, fontName: {family: string, style: string}}>} Updated node info.
 * @throws {Error} If nodeId or family is missing, node is not found, or not a text node.
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
 * Update the font family and style of one or more text nodes (batch or single).
 *
 * @async
 * @function
 * @param {Object} args - Parameters for setting font names.
 * @param {Object} [args.font] - Single font config: { nodeId, family, style }
 * @param {Array} [args.fonts] - Array of font configs: [{ nodeId, family, style }]
 * @returns {Promise<Array<{id: string, name: string, fontName: {family: string, style: string}}>>} Array of updated node info.
 * @throws {Error} If neither font nor fonts is provided, or if any node fails.
 */
export async function setFontNames(args) {
  let fontConfigs;
  if (args.fonts) {
    fontConfigs = args.fonts;
  } else if (args.font) {
    fontConfigs = [args.font];
  } else {
    throw new Error("You must provide either 'font' or 'fonts' as input.");
  }

  // Preload all fonts up front for performance
  const fontSet = new Set();
  for (const cfg of fontConfigs) {
    fontSet.add(`${cfg.family}|||${cfg.style || "Regular"}`);
  }
  await Promise.all(
    Array.from(fontSet).map(key => {
      const [family, style] = key.split("|||");
      return figma.loadFontAsync({ family, style });
    })
  );

  const results = [];
  const errors = [];
  for (const cfg of fontConfigs) {
    const { nodeId, family, style = "Regular" } = cfg;
    try {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) throw new Error(`Node not found with ID: ${nodeId}`);
      if (node.type !== "TEXT") throw new Error(`Node is not a text node: ${nodeId}`);
      node.fontName = { family, style };
      results.push({ id: node.id, name: node.name, fontName: node.fontName });
    } catch (error) {
      errors.push({ nodeId, error: error && error.message ? error.message : String(error) });
    }
  }
  if (errors.length > 0) {
    throw new Error(
      `Some font operations failed: ${errors.map(e => `${e.nodeId}: ${e.error}`).join("; ")}`
    );
  }
  return results;
}

/**
 * Update the font size of a text node.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for setting font size.
 * @param {string} params.nodeId - The ID of the text node.
 * @param {number} params.fontSize - The font size to set.
 * @returns {Promise<{id: string, name: string, fontSize: number}>} Updated node info.
 * @throws {Error} If nodeId or fontSize is missing, node is not found, or not a text node.
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
 *
 * @async
 * @function
 * @param {Object} params - Parameters for setting font weight.
 * @param {string} params.nodeId - The ID of the text node.
 * @param {number} params.weight - The font weight to set (100-900).
 * @returns {Promise<{id: string, name: string, fontName: {family: string, style: string}, weight: number}>} Updated node info.
 * @throws {Error} If nodeId or weight is missing, node is not found, or not a text node.
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
 *
 * @async
 * @function
 * @param {Object} params - Parameters for setting letter spacing.
 * @param {string} params.nodeId - The ID of the text node.
 * @param {number} params.letterSpacing - The letter spacing value.
 * @param {"PIXELS"|"PERCENT"} [params.unit="PIXELS"] - The unit for letter spacing.
 * @returns {Promise<{id: string, name: string, letterSpacing: {value: number, unit: string}}>} Updated node info.
 * @throws {Error} If nodeId or letterSpacing is missing, node is not found, not a text node, or unit is invalid.
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
 *
 * @async
 * @function
 * @param {Object} params - Parameters for setting line height.
 * @param {string} params.nodeId - The ID of the text node.
 * @param {number} params.lineHeight - The line height value.
 * @param {"PIXELS"|"PERCENT"|"AUTO"} [params.unit="PIXELS"] - The unit for line height.
 * @returns {Promise<{id: string, name: string, lineHeight: Object}>} Updated node info.
 * @throws {Error} If nodeId or lineHeight is missing, node is not found, not a text node, or unit is invalid.
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
 *
 * @async
 * @function
 * @param {Object} params - Parameters for setting paragraph spacing.
 * @param {string} params.nodeId - The ID of the text node.
 * @param {number} params.paragraphSpacing - The paragraph spacing value.
 * @returns {Promise<{id: string, name: string, paragraphSpacing: number}>} Updated node info.
 * @throws {Error} If nodeId or paragraphSpacing is missing, node is not found, or not a text node.
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
