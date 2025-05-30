/**
 * Helper utilities module.
 * Provides common utility functions for command execution, delays, and text manipulation.
 *
 * Exposed functions:
 * - delay(ms: number): Promise<void>
 * - generateCommandId(): string
 * - uniqBy(arr: any[], predicate: string | Function): any[]
 * - setCharacters(node: SceneNode, characters: string, options?: object): Promise<boolean>
 * - canAcceptChildren(node: SceneNode): boolean
 *
 * @module modules/utils/helpers
 * @example
 * import { delay, generateCommandId, uniqBy, setCharacters } from './helpers';
 * // Use delay to pause execution
 * await delay(500);
 * // Generate a command ID
 * const cmdId = generateCommandId();
 */

/**
 * Returns a promise that resolves after a specified delay.
 * Useful for rate limiting, animations, or waiting for operations to complete.
 *
 * @param {number} ms - The delay duration in milliseconds.
 * @returns {Promise<void>} A promise that resolves after the delay.
 * 
 * @example
 * // Wait for 1 second before continuing
 * await delay(1000);
 * 
 * @example
 * // Use in an animation loop
 * for (let i = 0; i < steps; i++) {
 *   updateProgress(i);
 *   await delay(100); // 100ms between updates
 * }
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a unique command ID string.
 * 
 * Creates a random, unique identifier prefixed with 'cmd_' that can be used
 * to track and correlate command execution across the plugin. The ID combines
 * two random base-36 strings to ensure uniqueness.
 * 
 * @returns {string} A unique command ID string.
 * 
 * @example
 * const cmdId = generateCommandId();
 * // Returns something like: "cmd_k7f9vx2y3n8m4p1q"
 */
export function generateCommandId() {
  return 'cmd_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
 * 
 * @example
 * // Basic usage
 * const success = await setCharacters(textNode, "Hello World");
 * 
 * @example
 * // With custom fallback font
 * const success = await setCharacters(textNode, "Hello World", {
 *   fallbackFont: {
 *     family: "Roboto",
 *     style: "Medium"
 *   }
 * });
 * 
 * @example
 * // Handling mixed fonts
 * const mixedFontNode = figma.createText();
 * // The function will automatically handle mixed font scenarios
 * const success = await setCharacters(mixedFontNode, "Mixed font text");
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

/**
 * Checks if a Figma node can accept children.
 * 
 * This utility function determines whether a given Figma node type can 
 * contain child nodes, which is important for creating proper node hierarchies.
 * 
 * @param {SceneNode} node - The Figma node to check
 * @returns {boolean} - True if the node can have children, false otherwise
 * 
 * @example
 * const frame = figma.createFrame();
 * const rect = figma.createRectangle();
 * 
 * canAcceptChildren(frame); // Returns true
 * canAcceptChildren(rect); // Returns false
 */
export function canAcceptChildren(node) {
  if (!node) return false;
  
  // These are the node types that can have children in Figma
  const containerNodeTypes = [
    'FRAME', 'GROUP', 'COMPONENT', 'COMPONENT_SET', 
    'SECTION', 'INSTANCE', 'PAGE', 'DOCUMENT'
  ];
  
  // Check by node type or by presence of appendChild method
  return containerNodeTypes.includes(node.type) || 
    ('appendChild' in node && typeof node.appendChild === 'function');
}

/**
 * Filters an array to contain only unique values based on a property or predicate function.
 * 
 * This function removes duplicate items from an array, where uniqueness is determined
 * by a property value or a function that derives a value from each item.
 * 
 * @param {Array} arr - The array to filter.
 * @param {string|Function} predicate - Either a property name or a function that returns a value to check for uniqueness.
 * @returns {Array} A new array containing only unique items.
 * 
 * @example
 * // Filter by object property
 * const uniqueUsers = uniqBy(users, 'id');
 * 
 * @example
 * // Filter by function result
 * const uniqueByName = uniqBy(items, item => item.firstName + item.lastName);
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
