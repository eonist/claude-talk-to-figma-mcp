import { setCharacters } from "../utils.js";

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
 * Updates the text case of a text node.
 *
 * @async
 * @function
 * @param {Object} params - Configuration for text case update.
 * @param {string} params.nodeId - The ID of the text node to update.
 * @param {"ORIGINAL"|"UPPER"|"LOWER"|"TITLE"} params.textCase - The text case to set.
 * @returns {Promise<{ id: string, name: string, textCase: string }>} Updated node information including text case.
 * @throws {Error} If nodeId or textCase is missing/invalid, node cannot be found, or node is not a text node.
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
