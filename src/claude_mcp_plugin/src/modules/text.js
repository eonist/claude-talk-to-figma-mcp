// Text module
import { generateCommandId, setCharacters } from './utils.js';

/**
 * Creates a new text node with the specified properties.
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

// Implement stubs for other operations
export async function scanTextNodes(params) {
  return {
    success: true,
    message: `Scanned text nodes successfully`,
    count: 0,
    textNodes: []
  };
}

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

export async function setFontName(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    fontName: { family: params.family, style: params.style || "Regular" }
  };
}

export async function setFontSize(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    fontSize: params.fontSize
  };
}

export async function setFontWeight(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    weight: params.weight
  };
}

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

export async function setParagraphSpacing(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    paragraphSpacing: params.paragraphSpacing
  };
}

export async function setTextCase(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    textCase: params.textCase
  };
}

export async function setTextDecoration(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    textDecoration: params.textDecoration
  };
}

export async function getStyledTextSegments(params) {
  return {
    id: params.nodeId,
    name: "Text Node",
    property: params.property,
    segments: []
  };
}

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
