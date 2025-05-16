/**
 * UI Components module.
 * Provides higher-level functions for creating common UI elements in Figma via MCP.
 *
 * This module uses the correct node hierarchy by designing compound components
 * with appropriate parent-child relationships.
 *
 * Exposed functions:
 * - createButton(params): Promise<{ frameId, backgroundId, textId }>
 *
 * @module modules/ui
 * @example
 * import { uiComponents } from './modules/ui.js';
 * const button = await uiComponents.createButton({ 
 *   x: 100, y: 100, 
 *   text: 'Click me' 
 * });
 */

// Import primitive creation functions from other modules
import { createFrame } from './shapes.js';
import { createRectangle, setNodeCornerRadii } from './shapes.js';
import { createText } from './text.js';

/**
 * Creates a complete button with a frame container, background, and text.
 * 
 * This function creates a proper button structure where:
 * 1. A Frame is created as the container
 * 2. A Rectangle is added as a child of the frame for the background
 * 3. A Text element is added as a child of the frame (sibling to the rectangle)
 * 
 * @param {object} params - Configuration parameters
 * @param {number} [params.x=0] - X position of the button
 * @param {number} [params.y=0] - Y position of the button
 * @param {number} [params.width=100] - Width of the button
 * @param {number} [params.height=40] - Height of the button
 * @param {string} [params.text="Button"] - Text to display on the button
 * @param {object} [params.style] - Visual styling options
 * @param {object} [params.style.background] - Background color ({ r, g, b, a })
 * @param {object} [params.style.text] - Text color ({ r, g, b, a })
 * @param {number} [params.style.fontSize=14] - Font size for the button text
 * @param {number} [params.style.fontWeight=500] - Font weight for the button text
 * @param {number} [params.style.cornerRadius=4] - Corner radius for the button
 * @param {string} [params.name="Button"] - Name for the button components
 * @param {string} [params.parentId] - Optional parent ID to add the button to
 * 
 * @returns {Promise<{frameId: string, backgroundId: string, textId: string}>} IDs of created elements
 * 
 * @example
 * // Create a basic button
 * const basicButton = await createButton({ x: 100, y: 50, text: "Submit" });
 * 
 * @example
 * // Create a customized button
 * const customButton = await createButton({
 *   x: 200, y: 200,
 *   width: 150, height: 48,
 *   text: "Login",
 *   style: {
 *     background: { r: 0.2, g: 0.4, b: 0.8 },
 *     text: { r: 1, g: 1, b: 1 },
 *     fontSize: 16,
 *     fontWeight: 600,
 *     cornerRadius: 8
 *   },
 *   name: "Login Button"
 * });
 */
export async function createButton(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 40,
    text = "Button",
    style = {
      background: { r: 0.19, g: 0.39, b: 0.85, a: 1 },
      text: { r: 1, g: 1, b: 1, a: 1 },
      fontSize: 14,
      fontWeight: 500,
      cornerRadius: 4
    },
    name = "Button",
    parentId
  } = params || {};

  // 1. Create the frame (container)
  const frame = await createFrame({
    x, y, 
    width, 
    height,
    name,
    parentId
  });

  // 2. Create the background rectangle as a child of the frame
  const background = await createRectangle({
    x: 0, y: 0, // Relative to the frame
    width, 
    height,
    name: `${name} Background`,
    parentId: frame.id,
    fillColor: style.background || { r: 0.19, g: 0.39, b: 0.85, a: 1 }
  });

  // Apply corner radius if specified
  if (style.cornerRadius !== undefined) {
    await setNodeCornerRadii({
      nodeId: background.id,
      all: style.cornerRadius
    });
  }

  // 3. Create the text centered in the frame
  const fontSize = style.fontSize || 14;
  
  // Calculate approximate text width based on content length and font size
  // This is a rough estimation for positioning
  const estimatedTextWidth = text.length * fontSize * 0.6;
  const textX = (width - estimatedTextWidth) / 2;
  const textY = (height - fontSize) / 2;
  
  const textNode = await createText({
    x: Math.max(0, textX),
    y: textY,
    text,
    fontSize,
    fontWeight: style.fontWeight || 500,
    fontColor: style.text || { r: 1, g: 1, b: 1, a: 1 },
    name: `${name} Text`,
    parentId: frame.id  // Text is a sibling to the rectangle, both children of the frame
  });

  return {
    frameId: frame.id,
    backgroundId: background.id,
    textId: textNode.id
  };
}

/**
 * Export both the individual functions and a grouped object for flexibility
 */
// Direct export for named imports
export { createButton };

// Grouped export for namespace imports
export const uiComponents = {
  createButton
};
