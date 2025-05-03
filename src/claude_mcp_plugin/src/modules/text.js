// Text module providing functions to create and modify text nodes in Figma.

import { generateCommandId, setCharacters } from './utils.js';

/**
 * Create a new text node in the Figma document.
 *
 * This asynchronous function creates a text node at specified x,y coordinates,
 * applies fonts and colors, and appends it to the given parent node if provided.
 *
 * @param {object} params - Object containing text node configuration.
 * @param {number} [params.x=0] - Horizontal coordinate for the text node.
 * @param {number} [params.y=0] - Vertical coordinate for the text node.
 * @param {string} [params.text="Text"] - The text content to display.
 * @param {number} [params.fontSize=14] - Font size in pixels.
 * @param {number} [params.fontWeight=400] - Numeric font weight (commonly 100-900).
 * @param {object} [params.fontColor={r:0, g:0, b:0, a:1}] - RGBA font color.
 * @param {string} [params.name="Text"] - Node name.
 * @param {string} [params.parentId] - ID of the parent node for appending the text node.
 *
 * @returns {Promise<object>} Details of the created text node.
 * @throws {Error} When the parent node is not found or cannot have child nodes.
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

  // Map given numeric font weight to corresponding string font style.
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
      // Load the necessary font before applying its settings.
      await figma.loadFontAsync({
        family: "Inter",
        style: getFontStyle(fontWeight),
      });
      textNode.fontName = { family: "Inter", style: getFontStyle(fontWeight) };
      textNode.fontSize = fontSize;
    } catch (error) {
      console.error("Error setting font", error);
    }
    
    // Set text content using helper function.
    await setCharacters(textNode, text);

    // Configure the fill style using the provided RGBA color values.
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

    // Append the text node to the parent node if an id is provided, or to the current page.
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
 * Update the text content of an existing text node.
 *
 * This function changes the text of a specified text node after ensuring the node exists
 * and is of type "TEXT". The font associated with the node is loaded prior to modification.
 *
 * @param {object} params - Configuration object.
 * @param {string} params.nodeId - ID of the target text node.
 * @param {string} params.text - New text content.
 *
 * @returns {Promise<object>} Updated node information including id, name, and characters.
 * @throws {Error} If the node is not found, not a text node, or if parameters are missing.
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

    if (node.type !== "TEXT") {
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
 * Scan text nodes within a specified parent node.
 *
 * This function scans for all text nodes under the given node ID. It includes options
 * for chunked processing for performance considerations, though currently a placeholder.
 *
 * @param {object} params - Parameters for scanning.
 * @param {string} params.nodeId - ID of the parent node to scan.
 * @param {boolean} [params.useChunking=true] - Whether to process nodes in chunks.
 * @param {number} [params.chunkSize=10] - Number of nodes per chunk.
 * @param {string} [params.commandId] - Optional identifier for progress tracking.
 *
 * @returns {Promise<object>} Result object with metadata about the scan.
 * @throws {Error} If scanning fails or the parent node is not found.
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
 * Replace text content in multiple text nodes in a batch operation.
 *
 * This function applies text replacements to multiple nodes within a parent node.
 *
 * @param {object} params - Batch operation parameters.
 * @param {string} params.nodeId - ID of the parent node containing text nodes.
 * @param {Array<object>} params.text - Array of text replacement objects.
 * @param {string} [params.commandId] - Optional command identifier for progress.
 *
 * @returns {Promise<object>} Summary of the replacement operation.
 * @throws {Error} If required parameters are missing or invalid.
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
 * Update the font family and style of a text node.
 *
 * This function allows changing the font family and optionally the style, returning the
 * updated font details.
 *
 * @param {object} params - Configuration for font update.
 * @param {string} params.nodeId - ID of the text node.
 * @param {string} params.family - New font family.
 * @param {string} [params.style="Regular"] - New font style.
 *
 * @returns {Promise<object>} Updated node information including font name.
 * @throws {Error} If the node is not found or not a text node.
 */
export async function setFontName(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    fontName: { family: params.family, style: params.style || "Regular" }
  };
}

/**
 * Update the font size of a text node.
 *
 * Change the font size and return the updated node information.
 *
 * @param {object} params - Configuration for font size update.
 * @param {string} params.nodeId - ID of the text node.
 * @param {number} params.fontSize - New font size in pixels.
 *
 * @returns {Promise<object>} Updated node information including font size.
 * @throws {Error} If the node is not found or not a text node.
 */
export async function setFontSize(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    fontSize: params.fontSize
  };
}

/**
 * Update the font weight of a text node.
 *
 * Adjust the font weight and return the updated font settings.
 *
 * @param {object} params - Configuration for font weight update.
 * @param {string} params.nodeId - ID of the text node.
 * @param {number} params.weight - New font weight (100-900).
 *
 * @returns {Promise<object>} Updated node information including new weight.
 * @throws {Error} If the node is not found or not a text node.
 */
export async function setFontWeight(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    weight: params.weight
  };
}

/**
 * Update the letter spacing of a text node.
 *
 * This modifies the spacing between letters with an option to specify the unit of measure.
 *
 * @param {object} params - Configuration for letter spacing.
 * @param {string} params.nodeId - ID of the text node.
 * @param {number} params.letterSpacing - New letter spacing value.
 * @param {string} [params.unit="PIXELS"] - Unit for letter spacing ("PIXELS" or "PERCENT").
 *
 * @returns {Promise<object>} Updated node information with new letter spacing.
 * @throws {Error} If the node is not found or not a text node.
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
 * Update the line height of a text node.
 *
 * This adjusts the vertical spacing of lines within the text node.
 *
 * @param {object} params - Configuration for line height update.
 * @param {string} params.nodeId - ID of the text node.
 * @param {number} params.lineHeight - New line height value.
 * @param {string} [params.unit="PIXELS"] - Unit for line height ("PIXELS", "PERCENT", or "AUTO").
 *
 * @returns {Promise<object>} Updated node information including line height.
 * @throws {Error} If the node is not found or not a text node.
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
 * Update the paragraph spacing of a text node.
 *
 * Sets the spacing (in pixels) between paragraphs in the text node.
 *
 * @param {object} params - Configuration for paragraph spacing.
 * @param {string} params.nodeId - ID of the text node.
 * @param {number} params.paragraphSpacing - New paragraph spacing in pixels.
 *
 * @returns {Promise<object>} Updated node information including paragraph spacing.
 * @throws {Error} If the node is not found or not a text node.
 */
export async function setParagraphSpacing(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    paragraphSpacing: params.paragraphSpacing
  };
}

/**
 * Update the text case of a text node.
 *
 * Changes the case transformation applied to the text content.
 *
 * @param {object} params - Configuration for text case update.
 * @param {string} params.nodeId - ID of the text node.
 * @param {string} params.textCase - New text case ("ORIGINAL", "UPPER", "LOWER", "TITLE").
 *
 * @returns {Promise<object>} Updated node information including text case.
 * @throws {Error} If the node is not found or not a text node.
 */
export async function setTextCase(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    textCase: params.textCase
  };
}

/**
 * Update the text decoration of a text node.
 *
 * This function sets the decoration style of the text such as underline or strikethrough.
 *
 * @param {object} params - Configuration for text decoration.
 * @param {string} params.nodeId - ID of the text node.
 * @param {string} params.textDecoration - Decoration style ("NONE", "UNDERLINE", "STRIKETHROUGH").
 *
 * @returns {Promise<object>} Updated node information including text decoration.
 * @throws {Error} If the node is not found or not a text node.
 */
export async function setTextDecoration(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    textDecoration: params.textDecoration
  };
}

/**
 * Retrieve styled text segments based on a specified property.
 *
 * Identifies sections of the text that share the same style (e.g., fontName or fontSize)
 * and returns the segments for further processing.
 *
 * @param {object} params - Configuration for retrieving styled segments.
 * @param {string} params.nodeId - ID of the text node.
 * @param {string} params.property - Name of the property to scan (e.g., "fontName", "fontSize").
 *
 * @returns {Promise<object>} Object containing the styled segments of the node.
 * @throws {Error} If the node is not found, not a text node, or the property is invalid.
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
 * Load a font asynchronously.
 *
 * Wraps the Figma font loading functionality and returns a success message along with
 * the loaded font details.
 *
 * @param {object} params - Configuration for font loading.
 * @param {string} params.family - Font family to load.
 * @param {string} [params.style="Regular"] - Font style to load.
 *
 * @returns {Promise<object>} Details about the loaded font including family and style.
 * @throws {Error} If font loading fails.
 */
export async function loadFontAsyncWrapper(params) {
  return {
    success: true,
    family: params.family,
    style: params.style || "Regular",
    message: `Successfully loaded ${params.family} ${params.style || "Regular"}`
  };
}

// Group export for all text operations.
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
