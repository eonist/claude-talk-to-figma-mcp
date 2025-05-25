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
  } else if (params.nodeId) {
    // Handle direct style parameters (server format) - compatible with Figma plugin environment
    const nodeId = params.nodeId;
    const styleProps = {};
    const excludedKeys = ['nodeId', 'entries'];
    for (const key in params) {
      if (params.hasOwnProperty(key) && !excludedKeys.includes(key)) {
        styleProps[key] = params[key];
      }
    }
    if (Object.keys(styleProps).length > 0) {
      updates = [{ nodeId, styles: styleProps }];
    } else {
      throw new Error("setTextStyle: No style properties provided.");
    }
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

    // ✅ BASIC TEXT PROPERTIES
    if (styles.fontSize !== undefined) node.fontSize = styles.fontSize;
    
    // ✅ FONT WEIGHT - Enhanced implementation with weight mapping
    if (styles.fontWeight !== undefined && node.fontName) {
      try {
        // Create a mapping for common font weights
        const weightToStyleMap = {
          100: 'Thin',
          200: 'ExtraLight', 
          300: 'Light',
          400: 'Regular',
          500: 'Medium',
          600: 'SemiBold',
          700: 'Bold',
          800: 'ExtraBold',
          900: 'Black'
        };
        
        const styleVariant = weightToStyleMap[styles.fontWeight] || 'Regular';
        const fontWithWeight = { 
          family: node.fontName.family, 
          style: styleVariant 
        };
        
        // Try to load the font variant, fall back to current font if it fails
        try {
          await figma.loadFontAsync(fontWithWeight);
          node.fontName = fontWithWeight;
        } catch (fontError) {
          // Font variant doesn't exist, keep current font
          console.warn(`Font weight ${styles.fontWeight} (${styleVariant}) not available for ${node.fontName.family}`);
        }
      } catch (error) {
        console.warn('Error setting font weight:', error);
      }
    }
    
    // ✅ SPACING AND LAYOUT
    if (styles.letterSpacing !== undefined) node.letterSpacing = styles.letterSpacing;
    
    if (styles.lineHeight !== undefined) {
      // Handle lineHeight conversion: MULTIPLIER unit should be converted to PERCENT
      if (styles.lineHeight && typeof styles.lineHeight === 'object' && styles.lineHeight.unit === 'MULTIPLIER') {
        node.lineHeight = { value: styles.lineHeight.value * 100, unit: 'PERCENT' };
      } else {
        node.lineHeight = styles.lineHeight;
      }
    }
    
    if (styles.paragraphSpacing !== undefined) node.paragraphSpacing = styles.paragraphSpacing;
    
    // ✅ TEXT APPEARANCE
    if (styles.textCase !== undefined) node.textCase = styles.textCase;
    if (styles.textDecoration !== undefined) node.textDecoration = styles.textDecoration;
    
    // ✅ COLOR AND FILLS - Newly implemented based on GitHub issue analysis
    if (styles.fontColor !== undefined) {
      // Convert fontColor to fills array with solid color
      node.fills = [{ 
        type: 'SOLID', 
        color: {
          r: styles.fontColor.r,
          g: styles.fontColor.g, 
          b: styles.fontColor.b
        },
        opacity: styles.fontColor.a !== undefined ? styles.fontColor.a : 1
      }];
    }
    
    if (styles.fills !== undefined) {
      // Direct assignment of fills array
      node.fills = styles.fills;
    }
    
    // ✅ TEXT ALIGNMENT - Newly implemented based on GitHub issue analysis
    if (styles.textAlignHorizontal !== undefined) {
      node.textAlignHorizontal = styles.textAlignHorizontal;
    }
    
    if (styles.textAlignVertical !== undefined) {
      node.textAlignVertical = styles.textAlignVertical;
    }
    
    // ✅ TEXT BEHAVIOR - Enhanced with all supported options
    if (styles.textAutoResize !== undefined) {
      node.textAutoResize = styles.textAutoResize;
    }
    
    // ✅ TEXT TRUNCATION - Newly added based on updated GitHub issue analysis
    if (styles.textTruncation !== undefined) {
      node.textTruncation = styles.textTruncation;
    }
    
    // ✅ MAX LINES - Newly added based on updated GitHub issue analysis
    if (styles.maxLines !== undefined) {
      node.maxLines = styles.maxLines;
    }

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
 * @returns {Promise<Array<{ nodeId, success?: boolean, error?: string }>>}
 */
export async function setParagraphSpacingUnified(params) {
  let ops = [];
  if (Array.isArray(params.entries) && params.entries.length > 0) {
    ops = params.entries;
  } else if (params.entry && params.entry.nodeId && params.entry.paragraphSpacing !== undefined) {
    ops = [params.entry];
  } else {
    throw new Error("setParagraphSpacingUnified: Provide either entry or entries array.");
  }

  const results = [];
  for (const { nodeId, paragraphSpacing } of ops) {
    try {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node || node.type !== "TEXT") {
        results.push({ nodeId, error: "Node not found or not a text node" });
        continue;
      }
      await figma.loadFontAsync(node.fontName);
      node.paragraphSpacing = paragraphSpacing;
      results.push({ nodeId, success: true });
    } catch (err) {
      if (params.options && params.options.skipErrors) {
        results.push({ nodeId, success: false, error: err && err.message ? err.message : String(err) });
        continue;
      } else {
        throw err;
      }
    }
  }
  return results;
}

/**
 * Unified handler for set_letter_spacing (single or batch).
 * Sets the letter spacing for one or more text nodes, supporting range-based updates and both units.
 *
 * @async
 * @function
 * @param {Object} params - { operation: { nodeId, spacings }, operations: [...], options }
 * @returns {Promise<Array<{ nodeId: string, success?: boolean, error?: string }>>}
 */
export async function setLetterSpacingUnified(params) {
  let ops = [];
  if (Array.isArray(params.operations) && params.operations.length > 0) {
    ops = params.operations;
  } else if (params.operation && params.operation.nodeId && Array.isArray(params.operation.spacings)) {
    ops = [params.operation];
  } else {
    throw new Error("setLetterSpacingUnified: Provide either operation or operations array.");
  }

  const results = [];
  for (const { nodeId, spacings } of ops) {
    try {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node || node.type !== "TEXT") {
        results.push({ nodeId, error: "Node not found or not a text node" });
        continue;
      }
      // Optionally load all fonts for the node
      if (params.options && params.options.loadMissingFonts) {
        const fontNames = node.getRangeAllFontNames(0, node.characters.length);
        for (const font of fontNames) {
          await figma.loadFontAsync(font);
        }
      } else {
        await figma.loadFontAsync(node.fontName);
      }
      // Apply letter spacing to each range
      for (const spacing of spacings) {
        if (spacing.start < 0 || spacing.end > node.characters.length) {
          throw new Error(`Invalid range [${spacing.start}-${spacing.end}] for text length ${node.characters.length}`);
        }
        const letterSpacing = { value: spacing.value, unit: spacing.unit };
        node.setRangeLetterSpacing(spacing.start, spacing.end, letterSpacing);
      }
      results.push({ nodeId, success: true });
    } catch (err) {
      if (params.options && params.options.skipErrors) {
        results.push({ nodeId, success: false, error: err && err.message ? err.message : String(err) });
        continue;
      } else {
        throw err;
      }
    }
  }
  return results;
}

/**
 * Unified handler for set_text_case (single or batch).
 * Sets the text case for one or more text nodes, supporting range-based updates and all Figma text case types.
 *
 * @async
 * @function
 * @param {Object} params - { operation: { nodeId, ranges }, operations: [...], options }
 * @returns {Promise<Array<{ nodeId: string, success?: boolean, error?: string }>>}
 */
export async function setTextCaseUnified(params) {
  let ops = [];
  if (Array.isArray(params.operations) && params.operations.length > 0) {
    ops = params.operations;
  } else if (params.operation && params.operation.nodeId && Array.isArray(params.operation.ranges)) {
    ops = [params.operation];
  } else {
    throw new Error("setTextCaseUnified: Provide either operation or operations array.");
  }

  const validTextCases = ["ORIGINAL", "UPPER", "LOWER", "TITLE", "SMALL_CAPS", "SMALL_CAPS_FORCED"];
  const results = [];
  for (const { nodeId, ranges } of ops) {
    try {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node || node.type !== "TEXT") {
        results.push({ nodeId, error: "Node not found or not a text node" });
        continue;
      }
      // Optionally load all fonts for the node
      if (params.options && params.options.loadMissingFonts) {
        const fontNames = node.getRangeAllFontNames(0, node.characters.length);
        for (const font of fontNames) {
          await figma.loadFontAsync(font);
        }
      } else {
        await figma.loadFontAsync(node.fontName);
      }
      // Apply text case to each range
      for (const range of ranges) {
        if (range.start < 0 || range.end > node.characters.length) {
          throw new Error(`Invalid range [${range.start}-${range.end}] for text length ${node.characters.length}`);
        }
        if (!validTextCases.includes(range.value)) {
          throw new Error(`Invalid text case: ${range.value}`);
        }
        node.setRangeTextCase(range.start, range.end, range.value);
      }
      results.push({ nodeId, success: true });
    } catch (err) {
      if (params.options && params.options.skipErrors) {
        results.push({ nodeId, success: false, error: err && err.message ? err.message : String(err) });
        continue;
      } else {
        throw err;
      }
    }
  }
  return results;
}

/**
 * Unified handler for set_text_decoration (single or batch).
 * Sets the text decoration for one or more text nodes, supporting range-based updates and all Figma text decoration types.
 *
 * @async
 * @function
 * @param {Object} params - { operation: { nodeId, ranges }, operations: [...], options }
 * @returns {Promise<Array<{ nodeId: string, success?: boolean, error?: string }>>}
 */
export async function setTextDecorationUnified(params) {
  if (!params) {
    throw new Error("setTextDecorationUnified: params is undefined/null");
  }
  let ops = [];
  if (Array.isArray(params.operations) && params.operations.length > 0) {
    ops = params.operations;
  } else if (params.operation && params.operation.nodeId && Array.isArray(params.operation.ranges)) {
    ops = [params.operation];
  } else {
    throw new Error("setTextDecorationUnified: Provide either operation or operations array.");
  }

  const validDecorations = ["NONE", "UNDERLINE", "STRIKETHROUGH"];
  const results = [];
  for (const { nodeId, ranges } of ops) {
    try {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node || node.type !== "TEXT") {
        results.push({ nodeId, error: "Node not found or not a text node" });
        continue;
      }
      // Optionally load all fonts for the node
      if (params.options && params.options.loadMissingFonts) {
        const fontNames = node.getRangeAllFontNames(0, node.characters.length);
        for (const font of fontNames) {
          await figma.loadFontAsync(font);
        }
      } else {
        await figma.loadFontAsync(node.fontName);
      }
      // Apply text decoration to each range
      for (const range of ranges) {
        if (range.start < 0 || range.end > node.characters.length) {
          throw new Error(`Invalid range [${range.start}-${range.end}] for text length ${node.characters.length}`);
        }
        if (!validDecorations.includes(range.type)) {
          throw new Error(`Invalid text decoration: ${range.type}`);
        }
        node.setRangeTextDecoration(range.start, range.end, range.type);
        // Optionally apply additional style properties if specified
        if (range.style) {
          if (range.style.color) {
            node.setRangeTextDecorationColor(range.start, range.end, range.style.color);
          }
          if (typeof range.style.thickness === "number") {
            node.setRangeTextDecorationThickness(range.start, range.end, range.style.thickness);
          }
          if (typeof range.style.offset === "number") {
            node.setRangeTextDecorationOffset(range.start, range.end, range.style.offset);
          }
          if (range.style.style) {
            node.setRangeTextDecorationStyle(range.start, range.end, range.style.style);
          }
          if (typeof range.style.skipInk === "boolean") {
            node.setRangeTextDecorationSkipInk(range.start, range.end, range.style.skipInk);
          }
        }
      }
      results.push({ nodeId, success: true });
    } catch (err) {
      if (params.options && params.options.skipErrors) {
        results.push({ nodeId, success: false, error: err && err.message ? err.message : String(err) });
        continue;
      } else {
        throw err;
      }
    }
  }
  return results;
}
