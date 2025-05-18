import { setCharacters } from "../utils.js";

/**
 * Unified handler for set_text_style (single or batch).
 * Applies one or more style properties to one or more text nodes.
 *
 * @async
 * @function
 * @param {Object} params - { nodeId, styles } or { entries: [{ nodeId, styles }, ...] }
 * @returns {Promise<Object>} Summary of the style update operation.
 */
export async function setTextStyle(params) {
  let updates = [];
  if (Array.isArray(params.entries) && params.entries.length > 0) {
    updates = params.entries;
  } else if (params.nodeId && params.styles && Object.keys(params.styles).length > 0) {
    updates = [{ nodeId: params.nodeId, styles: params.styles }];
  } else {
    throw new Error("setTextStyle: Provide either (nodeId + styles) or entries array.");
  }

  const results = [];
  for (const { nodeId, styles } of updates) {
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) {
      results.push({ nodeId, error: "Node not found" });
      continue;
    }
    if (node.type !== "TEXT") {
      results.push({ nodeId, error: "Node is not a text node" });
      continue;
    }
    // Load font if fontName or fontWeight/style is being set
    if (styles.fontName) {
      const font = typeof styles.fontName === "string"
        ? { family: styles.fontName, style: "Regular" }
        : styles.fontName;
      await figma.loadFontAsync(font);
      node.fontName = font;
    } else {
      // Always load the node's current font to allow style changes
      await figma.loadFontAsync(node.fontName);
    }
    if (styles.fontSize !== undefined) node.fontSize = styles.fontSize;
    if (styles.fontWeight !== undefined && node.fontName) {
      // Try to set fontWeight by updating fontName.style if possible
      // This is a best-effort; Figma's fontName.style is a string like "Bold"
      // You may want to map numeric weights to style names if needed
      // For now, just ignore if not possible
    }
    if (styles.letterSpacing !== undefined) node.letterSpacing = styles.letterSpacing;
    if (styles.lineHeight !== undefined) node.lineHeight = styles.lineHeight;
    if (styles.paragraphSpacing !== undefined) node.paragraphSpacing = styles.paragraphSpacing;
    if (styles.textCase !== undefined) node.textCase = styles.textCase;
    if (styles.textDecoration !== undefined) node.textDecoration = styles.textDecoration;
    // Extend for more style keys as needed

    results.push({ nodeId, success: true });
  }
  return { updated: results.filter(r => r.success).map(r => r.nodeId), errors: results.filter(r => r.error) };
}

/**
 * Updates the text content of an existing text node.
 *
 * @async
 * @function
 * @param {Object} params - Configuration object.
 * @param {string} params.nodeId - The ID of the text node to update.
 * @param {string} params.text - The new text content.
 * @returns {Promise<{ id: string, name: string, characters: string, fontName: object }>} Updated node information.
 * @throws {Error} If nodeId or text is missing, node cannot be found, or node is not a text node.
 */
export async function setTextContent(params) {
  const { nodeId, text } = params || {};

  if (!nodeId) throw new Error("Missing nodeId parameter");
  if (text === undefined) throw new Error("Missing text parameter");

  try {
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) throw new Error(`Node not found with ID: ${nodeId}`);
    if (node.type !== "TEXT") throw new Error(`Node is not a text node: ${nodeId}`);

    await figma.loadFontAsync(node.fontName);
    await setCharacters(node, text);

    return {
      id: node.id,
      name: node.name,
      characters: node.characters,
      fontName: node.fontName,
    };
  } catch (error) {
    console.error("Error setting text content", error);
    throw error;
  }
}

/**
 * Replace text content in multiple text nodes in a batch operation.
 *
 * @async
 * @function
 * @param {Object} params - Batch operation parameters.
 * @param {Array<{ nodeId: string, text: string }>} params.texts - Array of nodeId/text pairs.
 * @returns {Promise<Object>} Summary of the replacement operation.
 * @throws {Error} Always throws, not yet implemented.
 */
export async function setMultipleTextContents(params) {
  // This function will be refactored to import sendProgressUpdate and delay from text-helpers.js in the next step.
  // For now, leave as a stub to be filled in after helpers are modularized.
  throw new Error("setMultipleTextContents: Not yet implemented in modular split.");
}

/**
 * Unified handler for set_paragraph_spacing (single or batch).
 * Sets the paragraph spacing for one or more text nodes.
 *
 * @async
 * @function
 * @param {Object} params - { entry: { nodeId, paragraphSpacing } } or { entries: [{ nodeId, paragraphSpacing }, ...] }
 * @returns {Promise<Array<{ nodeId: string, success?: boolean, error?: string }>>}
 */
export async function setParagraphSpacingUnified(params) {
  let updates = [];
  if (Array.isArray(params.entries) && params.entries.length > 0) {
    updates = params.entries;
  } else if (params.entry && params.entry.nodeId && typeof params.entry.paragraphSpacing === "number") {
    updates = [params.entry];
  } else {
    throw new Error("setParagraphSpacingUnified: Provide either entry or entries array.");
  }

  const results = [];
  for (const { nodeId, paragraphSpacing } of updates) {
    try {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) {
        results.push({ nodeId, error: "Node not found" });
        continue;
      }
      if (node.type !== "TEXT") {
        results.push({ nodeId, error: "Node is not a text node" });
        continue;
      }
      await figma.loadFontAsync(node.fontName);
      node.paragraphSpacing = paragraphSpacing;
      results.push({ nodeId, success: true });
    } catch (err) {
      results.push({ nodeId, error: err && err.message ? err.message : String(err) });
    }
  }
  return results;
}

export async function setTextCase(params) {
  const { nodeId, textCase } = params || {};
  if (!nodeId || textCase === undefined) throw new Error("Missing nodeId or textCase");
  const validTextCases = ["ORIGINAL", "UPPER", "LOWER", "TITLE"];
  if (!validTextCases.includes(textCase)) throw new Error(`Invalid textCase: must be one of ${validTextCases.join(", ")}`);
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found with ID: ${nodeId}`);
  if (node.type !== "TEXT") throw new Error(`Node is not a text node: ${nodeId}`);
  try {
    await figma.loadFontAsync(node.fontName);
    node.textCase = textCase;
    return { id: node.id, name: node.name, textCase: node.textCase };
  } catch (error) {
    throw new Error(`Error setting text case: ${error.message}`);
  }
}

/**
 * Updates the text decoration of a text node.
 *
 * @async
 * @function
 * @param {Object} params - Configuration for text decoration.
 * @param {string} params.nodeId - The ID of the text node to update.
 * @param {"NONE"|"UNDERLINE"|"STRIKETHROUGH"} params.textDecoration - The text decoration to set.
 * @returns {Promise<{ id: string, name: string, textDecoration: string }>} Updated node information including text decoration.
 * @throws {Error} If nodeId or textDecoration is missing/invalid, node cannot be found, or node is not a text node.
 */
export async function setTextDecoration(params) {
  const { nodeId, textDecoration } = params || {};
  if (!nodeId || textDecoration === undefined) throw new Error("Missing nodeId or textDecoration");
  const validDecorations = ["NONE", "UNDERLINE", "STRIKETHROUGH"];
  if (!validDecorations.includes(textDecoration)) throw new Error(`Invalid textDecoration: must be one of ${validDecorations.join(", ")}`);
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found with ID: ${nodeId}`);
  if (node.type !== "TEXT") throw new Error(`Node is not a text node: ${nodeId}`);
  try {
    await figma.loadFontAsync(node.fontName);
    node.textDecoration = textDecoration;
    return { id: node.id, name: node.name, textDecoration: node.textDecoration };
  } catch (error) {
    throw new Error(`Error setting text decoration: ${error.message}`);
  }
}
