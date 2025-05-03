/**
 * Returns a promise that resolves after a specified delay.
 *
 * @param {number} ms - The delay duration in milliseconds.
 * @returns {Promise<void>} A promise that resolves after the delay.
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a unique command ID string.
 * 
 * Creates a random, unique identifier prefixed with 'cmd_' that can be used
 * to track and correlate command execution across the plugin.
 * 
 * @returns {string} A unique command ID string.
 */
export function generateCommandId() {
  return 'cmd_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Filters an array to contain only unique values based on a property or predicate function.
 * 
 * @param {Array} arr - The array to filter.
 * @param {string|Function} predicate - Either a property name or a function that returns a value to check for uniqueness.
 * @returns {Array} A new array containing only unique items.
 */
export function uniqBy(arr, predicate) {
  const cb = typeof predicate === "function" 
    ? predicate 
    : (o) => o[predicate];
    
  return [
    ...arr
      .reduce((map, item) => {
        const key = item === null || item === undefined ? item : cb(item);
        map.has(key) || map.set(key, item);
        return map;
      }, new Map())
      .values(),
  ];
}

/**
 * Helper to safely set characters on a text node with font loading.
 * 
 * This function handles the complexities of setting text content on Figma text nodes,
 * including proper font loading and fallback handling for mixed-font nodes.
 * 
 * @param {SceneNode} node - The Figma text node to modify.
 * @param {string} characters - The text content to set.
 * @param {object} [options] - Optional configuration.
 * @param {object} [options.fallbackFont] - Font to use as fallback if loading fails.
 * @param {string} [options.fallbackFont.family="Inter"] - Fallback font family.
 * @param {string} [options.fallbackFont.style="Regular"] - Fallback font style.
 * 
 * @returns {Promise<boolean>} True if characters were set successfully, false otherwise.
 */
export async function setCharacters(node, characters, options) {
  const fallbackFont = (options && options.fallbackFont) || {
    family: "Inter",
    style: "Regular",
  };
  
  try {
    if (node.fontName === figma.mixed) {
      const firstCharFont = node.getRangeFontName(0, 1);
      await figma.loadFontAsync(firstCharFont);
      node.fontName = firstCharFont;
    } else {
      await figma.loadFontAsync({
        family: node.fontName.family,
        style: node.fontName.style,
      });
    }
  } catch (err) {
    console.warn(
      `Failed to load font and replaced with fallback "${fallbackFont.family} ${fallbackFont.style}"`,
      err
    );
    await figma.loadFontAsync(fallbackFont);
    node.fontName = fallbackFont;
  }
  
  try {
    node.characters = characters;
    return true;
  } catch (err) {
    console.warn(`Failed to set characters. Skipped.`, err);
    return false;
  }
}
