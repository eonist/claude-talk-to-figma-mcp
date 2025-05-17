import { setCharacters, canAcceptChildren } from "../utils.js";

/**
 * Create a new text node in the Figma document.
 * @param {object} params - Object containing text node configuration.
 * @returns {Promise<object>} Details of the created text node.
 */
export async function createText(params) {
  let textsArr;
  if (params.texts) {
    textsArr = params.texts;
  } else if (params.text) {
    textsArr = [params.text];
  } else {
    textsArr = [params];
  }
  textsArr = textsArr.filter(Boolean);
  const results = [];
  for (const cfg of textsArr) {
    const {
      x = 0,
      y = 0,
      text = "Text",
      fontSize = 14,
      fontWeight = 400,
      fontColor = { r: 0, g: 0, b: 0, a: 1 },
      name = "Text",
      parentId,
    } = cfg || {};

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

      if (parentId) {
        const parentNode = await figma.getNodeByIdAsync(parentId);
        if (!parentNode) {
          throw new Error(`Parent node not found with ID: ${parentId}`);
        }
        if (!canAcceptChildren(parentNode)) {
          const nodeType = parentNode.type || 'unknown type';
          throw new Error(
            `Parent node with ID ${parentId} (${nodeType}) cannot have children. ` +
            `Use a FRAME, GROUP, or COMPONENT as the parent for text nodes instead of ${nodeType} nodes.`
          );
        }
        parentNode.appendChild(textNode);
      } else {
        figma.currentPage.appendChild(textNode);
      }

      results.push({
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
      });
    } catch (error) {
      console.error("Error creating text", error);
      results.push({ error: error.message, config: cfg });
    }
  }
  return results.length === 1 ? results[0] : { nodes: results };
}

/**
 * Create a new bounded text node in the Figma document.
 * @param {object} params - Object containing text node configuration.
 * @returns {Promise<object>} Details of the created text node.
 */
export async function createBoundedText(params) {
  let textsArr;
  if (params.texts) {
    textsArr = params.texts;
  } else if (params.text) {
    textsArr = [params.text];
  } else {
    textsArr = [params];
  }
  textsArr = textsArr.filter(Boolean);
  const results = [];
  for (const cfg of textsArr) {
    const {
      x = 0,
      y = 0,
      text = "",
      width,
      height,
      fontSize = 14,
      fontWeight = 400,
      fontColor = { r: 0, g: 0, b: 0, a: 1 },
      name = "Text",
      parentId,
    } = cfg || {};

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

      await figma.loadFontAsync({ family: "Inter", style: getFontStyle(fontWeight) });
      textNode.fontName = { family: "Inter", style: getFontStyle(fontWeight) };
      textNode.fontSize = fontSize;

      await setCharacters(textNode, text);

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

      if (width !== undefined && height !== undefined) {
        textNode.textAutoResize = "NONE";
        textNode.resize(width, height);
      } else if (width !== undefined) {
        textNode.textAutoResize = "HEIGHT";
        textNode.resize(width, textNode.height);
      }

      if (parentId) {
        const parentNode = await figma.getNodeByIdAsync(parentId);
        if (!parentNode) {
          throw new Error(`Parent node not found with ID: ${parentId}`);
        }
        if (!canAcceptChildren(parentNode)) {
          const nodeType = parentNode.type || 'unknown type';
          throw new Error(
            `Parent node with ID ${parentId} (${nodeType}) cannot have children. ` +
            `Use a FRAME, GROUP, or COMPONENT as the parent for text nodes instead of ${nodeType} nodes.`
          );
        }
        parentNode.appendChild(textNode);
      } else {
        figma.currentPage.appendChild(textNode);
      }

      results.push({
        id: textNode.id,
        name: textNode.name,
        x: textNode.x,
        y: textNode.y,
        width: textNode.width,
        height: textNode.height,
        characters: textNode.characters,
        fontSize: textNode.fontSize,
        fontWeight,
        fontColor,
        fontName: textNode.fontName,
        fills: textNode.fills,
        parentId: textNode.parent ? textNode.parent.id : undefined,
      });
    } catch (error) {
      console.error("Error creating bounded text", error);
      results.push({ error: error.message, config: cfg });
    }
  }
  return results.length === 1 ? results[0] : { nodes: results };
}

/**
 * Batch-create multiple text nodes in the Figma document.
 * @param {object} params - Object with a 'texts' array of text configs.
 * @returns {Promise<Array<object>>} Array of created text node details.
 */
export async function createTexts(params) {
  const { texts } = params || {};
  if (!Array.isArray(texts)) {
    throw new Error("Missing or invalid 'texts' array in params");
  }
  const results = [];
  for (const textConfig of texts) {
    try {
      const node = await createText(textConfig);
      results.push(node);
    } catch (err) {
      results.push({ error: err.message, config: textConfig });
    }
  }
  return results;
}
