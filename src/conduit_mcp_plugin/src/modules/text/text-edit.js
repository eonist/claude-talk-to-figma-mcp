import { setCharacters } from "../utils.js";

/**
 * Update the text content of an existing text node.
 * @param {object} params - Configuration object.
 * @returns {Promise<object>} Updated node information.
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
 * @param {object} params - Batch operation parameters.
 * @returns {Promise<object>} Summary of the replacement operation.
 */
export async function setMultipleTextContents(params) {
  // This function will be refactored to import sendProgressUpdate and delay from text-helpers.js in the next step.
  // For now, leave as a stub to be filled in after helpers are modularized.
  throw new Error("setMultipleTextContents: Not yet implemented in modular split.");
}

/**
 * Update the text case of a text node.
 * @param {object} params - Configuration for text case update.
 * @returns {Promise<object>} Updated node information including text case.
 */
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
 * Update the text decoration of a text node.
 * @param {object} params - Configuration for text decoration.
 * @returns {Promise<object>} Updated node information including text decoration.
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
