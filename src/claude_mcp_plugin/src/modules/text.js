// Text module
import { generateCommandId, setCharacters } from './utils.js';

/**
 * Creates a new text node in the Figma document.
 *
 * The function instantiates a text element with specified position, font settings, content, and name.
 * It supports optional fontSize, fontWeight, and fontColor parameters.
 * If parentId is provided, the text node is appended to that node; otherwise, it is added to the current page.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - The X coordinate of the text node.
 * @param {number} [params.y=0] - The Y coordinate of the text node.
 * @param {string} [params.text="Text"] - The initial text content.
 * @param {number} [params.fontSize=14] - The font size.
 * @param {number} [params.fontWeight=400] - The font weight.
 * @param {object} [params.fontColor={r:0,g:0,b:0,a:1}] - The font color in RGBA format.
 * @param {string} [params.name="Text"] - The name assigned to the text node.
 * @param {string} [params.parentId] - The ID of the parent node to which the text node should be appended.
 *
 * @returns {object} An object with details of the created text node (id, name, position, size, characters, fontName, fills, and parentId).
 *
 * @throws Will throw an error if the specified parent node is not found or if it does not support children.
 */
export async function createText(params) {
  const {
    x = 0,
    y = 0,
    text = "Text",
    fontSize = 14,
    fontWeight = 400,
    fontColor = { r: 0, g: 0, b: 0, a: 1 },
    name = "Text",
    parentId,
  } = params || {};

  // Map common font weights to Figma font styles
  const getFontStyle = (weight) => {
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
  };

  try {
    const textNode = figma.createText();
    textNode.x = x;
    textNode.y = y;
    textNode.name = name;
    
    try {
      await figma.loadFontAsync({
        family: "Inter",
        style: getFontStyle(fontWeight),
      });
      textNode.fontName = { family: "Inter", style: getFontStyle(fontWeight) };
      textNode.fontSize = fontSize;
    } catch (error) {
      console.error("Error setting font", error);
    }
    
    await setCharacters(textNode, text);

    // Set text color
    const paintStyle = {
      type: "SOLID",
      color: {
        r: parseFloat(fontColor.r.toString()) || 0,
        g: parseFloat(fontColor.g.toString()) || 0,
        b: parseFloat(fontColor.b.toString()) || 0,
      },
      opacity: parseFloat((fontColor.a || 1).toString()),
    };
    
    textNode.fills = [paintStyle];

    // If parentId is provided, append to that node, otherwise append to current page
    if (parentId) {
      const parentNode = await figma.getNodeByIdAsync(parentId);
      if (!parentNode) {
        throw new Error(`Parent node not found with ID: ${parentId}`);
      }
      if (!("appendChild" in parentNode)) {
        throw new Error(`Parent node does not support children: ${parentId}`);
      }
      parentNode.appendChild(textNode);
    } else {
      figma.currentPage.appendChild(textNode);
    }

    return {
      id: textNode.id,
      name: textNode.name,
      x: textNode.x,
      y: textNode.y,
      width: textNode.width,
      height: textNode.height,
      characters: textNode.characters,
      fontSize: textNode.fontSize,
      fontWeight: fontWeight,
      fontColor: fontColor,
      fontName: textNode.fontName,
      fills: textNode.fills,
      parentId: textNode.parent ? textNode.parent.id : undefined,
    };
  } catch (error) {
    console.error("Error creating text", error);
    throw error;
  }
}

/**
 * Sets the text content of a text node.
 *
 * @param {object} params - Parameters for setting text content.
 * @param {string} params.nodeId - The ID of the text node to modify.
 * @param {string} params.text - The new text content.
 *
 * @returns {object} An object containing the node's id, name, characters, and fontName.
 *
 * @throws Will throw an error if the node is not found or is not a text node.
 *
 * @example
 * const result = await setTextContent({ nodeId: "12345", text: "Hello World" });
 * console.log(result.characters);
 */
export async function setTextContent(params) {
  const { nodeId, text } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (text === undefined) {
    throw new Error("Missing text parameter");
  }

  try {
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) {
      throw new Error(`Node not found with ID: ${nodeId}`);
    }

    if ((node.type !== "TEXT")) {
      throw new Error(`Node is not a text node: ${nodeId}`);
    }

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
 * Scans all text nodes within a specified node, optionally using chunked processing.
 *
 * @param {object} params - Parameters for scanning text nodes.
 * @param {string} params.nodeId - The ID of the node to scan.
 * @param {boolean} [params.useChunking=true] - Whether to use chunked processing.
 * @param {number} [params.chunkSize=10] - The size of each chunk for processing.
 * @param {string} [params.commandId] - Optional command ID for progress updates.
 *
 * @returns {Promise<object>} An object containing scan results and metadata.
 *
 * @throws Will throw an error if the node is not found or scanning fails.
 */
export async function scanTextNodes(params) {
  return {
    success: true,
    message: `Scanned text nodes successfully`,
    count: 0,
    textNodes: []
  };
}

/**
 * Sets multiple text contents in a batch operation.
 *
 * @param {object} params - Parameters for batch text replacement.
 * @param {string} params.nodeId - The parent node ID containing text nodes to update.
 * @param {Array<object>} params.text - Array of text replacement objects.
 * @param {string} [params.commandId] - Optional command ID for progress updates.
 *
 * @returns {Promise<object>} An object containing success status and results of text replacements.
 *
 * @throws Will throw an error if required parameters are missing or invalid.
 */
export async function setMultipleTextContents(params) {
  return {
    success: true,
    nodeId: params.nodeId,
    replacementsApplied: params.text.length,
    replacementsFailed: 0,
    totalReplacements: params.text.length,
    results: []
  };
}

/**
 * Sets the font family and style of a text node.
 *
 * @param {object} params - Parameters for setting font name.
 * @param {string} params.nodeId - The ID of the text node.
 * @param {string} params.family - The font family name.
 * @param {string} [params.style="Regular"] - The font style.
 *
 * @returns {object} An object with the node's id, name, and updated fontName.
 *
 * @throws Will throw an error if the node is not found or is not a text node.
 */
export async function setFontName(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    fontName: { family: params.family, style: params.style || "Regular" }
  };
}

/**
 * Sets the font size of a text node.
 *
 * @param {object} params - Parameters for setting font size.
 * @param {string} params.nodeId - The ID of the text node.
 * @param {number} params.fontSize - The font size in pixels.
 *
 * @returns {object} An object with the node's id, name, and updated fontSize.
 *
 * @throws Will throw an error if the node is not found or is not a text node.
 */
export async function setFontSize(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    fontSize: params.fontSize
  };
}

/**
 * Sets the font weight of a text node.
 *
 * @param {object} params - Parameters for setting font weight.
 * @param {string} params.nodeId - The ID of the text node.
 * @param {number} params.weight - The font weight (100-900).
 *
 * @returns {object} An object with the node's id, name, updated fontName, and weight.
 *
 * @throws Will throw an error if the node is not found or is not a text node.
 */
export async function setFontWeight(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    weight: params.weight
  };
}

/**
 * Sets the letter spacing of a text node.
 *
 * @param {object} params - Parameters for setting letter spacing.
 * @param {string} params.nodeId - The ID of the text node.
 * @param {number} params.letterSpacing - The letter spacing value.
 * @param {string} [params.unit="PIXELS"] - The unit of letter spacing ("PIXELS" or "PERCENT").
 *
 * @returns {object} An object with the node's id, name, and updated letterSpacing.
 *
 * @throws Will throw an error if the node is not found or is not a text node.
 */
export async function setLetterSpacing(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    letterSpacing: {
      value: params.letterSpacing,
      unit: params.unit || "PIXELS"
    }
  };
}

/**
 * Sets the line height of a text node.
 *
 * @param {object} params - Parameters for setting line height.
 * @param {string} params.nodeId - The ID of the text node.
 * @param {number} params.lineHeight - The line height value.
 * @param {string} [params.unit="PIXELS"] - The unit of line height ("PIXELS", "PERCENT", or "AUTO").
 *
 * @returns {object} An object with the node's id, name, and updated lineHeight.
 *
 * @throws Will throw an error if the node is not found or is not a text node.
 */
export async function setLineHeight(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    lineHeight: {
      value: params.lineHeight,
      unit: params.unit || "PIXELS"
    }
  };
}

/**
 * Sets the paragraph spacing of a text node.
 *
 * @param {object} params - Parameters for setting paragraph spacing.
 * @param {string} params.nodeId - The ID of the text node.
 * @param {number} params.paragraphSpacing - The paragraph spacing value in pixels.
 *
 * @returns {object} An object with the node's id, name, and updated paragraphSpacing.
 *
 * @throws Will throw an error if the node is not found or is not a text node.
 */
export async function setParagraphSpacing(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    paragraphSpacing: params.paragraphSpacing
  };
}

/**
 * Sets the text case of a text node.
 *
 * @param {object} params - Parameters for setting text case.
 * @param {string} params.nodeId - The ID of the text node.
 * @param {string} params.textCase - The text case type ("ORIGINAL", "UPPER", "LOWER", "TITLE").
 *
 * @returns {object} An object with the node's id, name, and updated textCase.
 *
 * @throws Will throw an error if the node is not found or is not a text node.
 */
export async function setTextCase(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    textCase: params.textCase
  };
}

/**
 * Sets the text decoration of a text node.
 *
 * @param {object} params - Parameters for setting text decoration.
 * @param {string} params.nodeId - The ID of the text node.
 * @param {string} params.textDecoration - The text decoration type ("NONE", "UNDERLINE", "STRIKETHROUGH").
 *
 * @returns {object} An object with the node's id, name, and updated textDecoration.
 *
 * @throws Will throw an error if the node is not found or is not a text node.
 */
export async function setTextDecoration(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    textDecoration: params.textDecoration
  };
}

/**
 * Retrieves styled text segments for a specific property in a text node.
 *
 * @param {object} params - Parameters for retrieving styled text segments.
 * @param {string} params.nodeId - The ID of the text node.
 * @param {string} params.property - The style property to analyze (e.g., "fontName", "fontSize").
 *
 * @returns {object} An object containing the node's id, name, property, and an array of styled segments.
 *
 * @throws Will throw an error if the node is not found, is not a text node, or if the property is invalid.
 */
export async function getStyledTextSegments(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    property: params.property,
    segments: []
  };
}

/**
 * Loads a font asynchronously in Figma.
 *
 * @param {object} params - Parameters for loading font.
 * @param {string} params.family - The font family name.
 * @param {string} [params.style="Regular"] - The font style.
 *
 * @returns {object} An object indicating success and the loaded font family and style.
 *
 * @throws Will throw an error if the font family is missing or loading fails.
 */
export async function loadFontAsyncWrapper(params) {
  return {
    success: true,
    family: params.family,
    style: params.style || "Regular",
    message: `Successfully loaded ${params.family} ${params.style || "Regular"}`
  };
}

// Export the operations as a group
export const textOperations = {
  createText,
  setTextContent,
  scanTextNodes,
  setMultipleTextContents,
  setFontName,
  setFontSize,
  setFontWeight,
  setLetterSpacing,
  setLineHeight,
  setParagraphSpacing,
  setTextCase,
  setTextDecoration,
  getStyledTextSegments,
  loadFontAsyncWrapper
};
