import { setCharacters, canAcceptChildren } from "../utils.js";

/**
 * Creates one or more text nodes in the Figma document.
 *
 * @async
 * @function
 * @param {Object|Array|{text?:Object,texts?:Array}} params - Text node configuration. Can be a single config, an object with 'text' or 'texts', or an array.
 * @param {number} [params.x=0] - X position.
 * @param {number} [params.y=0] - Y position.
 * @param {string} [params.text="Text"] - Text content.
 * @param {number} [params.fontSize=14] - Font size.
 * @param {number} [params.fontWeight=400] - Font weight.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.fontColor={r:0,g:0,b:0,a:1}] - Font color.
 * @param {string} [params.name="Text"] - Name of the text node.
 * @param {string} [params.parentId] - Optional parent node ID.
 * @returns {Promise<Object|{nodes:Array<Object>}>} Details of the created text node(s).
 * @throws {Error} If parent is not found or cannot accept children.
 */
export async function createText(params) {
  let textsArr;
  if (params.texts) {
    textsArr = params.texts;
  } else {
    textsArr = [params];
  }
  textsArr = textsArr.filter(Boolean);
  const results = [];
  for (const cfg of textsArr) {
    console.log("createText received cfg:", cfg);
    let {
      x = 0,
      y = 0,
      text = "Text",
      fontSize = 14,
      fontWeight = 400,
      fontColor = { r: 0, g: 0, b: 0, a: 1 },
      name = "Text",
      parentId,
    } = (cfg.text && typeof cfg.text === "object") ? cfg.text : cfg || {};
    // Debug: log font properties
    console.log("fontSize:", fontSize, "fontWeight:", fontWeight, "fontColor:", fontColor);
    // Log all received parameters for debugging
    console.log("[createText] received params:", {
      x, y, text, fontSize, fontWeight, fontColor, name, parentId,
      width: cfg.width, height: cfg.height
    });
    // Fix: if text is an object (from server), extract the "text" property
    if (typeof text === "object" && text !== null && typeof text.text === "string") {
      text = text.text;
    }

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
 * Creates one or more bounded text nodes in the Figma document.
 *
 * @async
 * @function
 * @param {Object|Array|{text?:Object,texts?:Array}} params - Text node configuration. Can be a single config, an object with 'text' or 'texts', or an array.
 * @param {number} [params.x=0] - X position.
 * @param {number} [params.y=0] - Y position.
 * @param {string} [params.text=""] - Text content.
 * @param {number} [params.width] - Width of the text box.
 * @param {number} [params.height] - Height of the text box.
 * @param {number} [params.fontSize=14] - Font size.
 * @param {number} [params.fontWeight=400] - Font weight.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.fontColor={r:0,g:0,b:0,a:1}] - Font color.
 * @param {string} [params.name="Text"] - Name of the text node.
 * @param {string} [params.parentId] - Optional parent node ID.
 * @returns {Promise<Object|{nodes:Array<Object>}>} Details of the created text node(s).
 * @throws {Error} If parent is not found or cannot accept children.
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

      // Set resizing logic based on width/height params:
      // - Both width & height: Fixed size ("NONE")
      // - Only width: Auto height ("HEIGHT")
      // - Only height: Auto width ("WIDTH")
      // - Neither: Auto width ("WIDTH")
      console.log("[createBoundedText] width:", width, "height:", height);
      if (width !== undefined && height !== undefined) {
        console.log("[createBoundedText] Setting Fixed size (NONE)");
        textNode.textAutoResize = "NONE";
        textNode.resize(width, height);
      } else if (width !== undefined) {
        console.log("[createBoundedText] Setting Auto height (HEIGHT)");
        textNode.textAutoResize = "HEIGHT";
        textNode.resize(width, textNode.height);
      } else if (height !== undefined) {
        console.log("[createBoundedText] Setting Auto width (WIDTH)");
        textNode.textAutoResize = "WIDTH";
        textNode.resize(textNode.width, height);
      } else {
        console.log("[createBoundedText] Setting Auto width (WIDTH, default)");
        textNode.textAutoResize = "WIDTH";
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
 *
 * @async
 * @function
 * @param {Object} params - Object with a 'texts' array of text configs.
 * @param {Array<Object>} params.texts - Array of text node configs (see createText for config shape).
 * @returns {Promise<Array<Object>>} Array of created text node details.
 * @throws {Error} If 'texts' is missing or invalid.
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
