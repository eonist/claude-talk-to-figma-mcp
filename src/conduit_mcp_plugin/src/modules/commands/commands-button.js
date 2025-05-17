/**
 * Button creation operation for Figma.
 * Exports: createButton
 */
import * as shapeOperations from '../shapes.js';
import * as textOperations from '../text.js';

/**
 * Creates a complete button with a frame container, background, and text.
 *
 * @async
 * @function
 * @param {Object} params - Button configuration parameters.
 * @param {number} [params.x=0] - X coordinate for the button's top-left corner.
 * @param {number} [params.y=0] - Y coordinate for the button's top-left corner.
 * @param {number} [params.width=100] - Width of the button in pixels.
 * @param {number} [params.height=40] - Height of the button in pixels.
 * @param {string} [params.text="Button"] - Text to display on the button.
 * @param {Object} [params.style] - Style options for the button.
 * @param {Object} [params.style.background={r:0.19,g:0.39,b:0.85,a:1}] - RGBA color for the button background.
 * @param {Object} [params.style.text={r:1,g:1,b:1,a:1}] - RGBA color for the button text.
 * @param {number} [params.style.fontSize=14] - Font size for the button text.
 * @param {number} [params.style.fontWeight=500] - Font weight for the button text.
 * @param {number} [params.style.cornerRadius=4] - Corner radius for the button background.
 * @param {string} [params.name="Button"] - Name for the button frame.
 * @param {string} [params.parentId] - Optional parent node ID to attach the button to.
 * @returns {Promise<{frameId: string, backgroundId: string, textId: string}>} IDs of the created frame, background, and text nodes.
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
  const frame = await shapeOperations.createFrame({
    x, y, 
    width, 
    height,
    name,
    parentId
  });

  // 2. Create the background rectangle as a child of the frame
  const background = await shapeOperations.createRectangle({
    x: 0, y: 0,
    width, 
    height,
    name: `${name} Background`,
    parentId: frame.id,
    fillColor: style.background || { r: 0.19, g: 0.39, b: 0.85, a: 1 }
  });

  // Apply corner radius if specified
  if (style.cornerRadius !== undefined) {
    await shapeOperations.setNodeCornerRadii({
      nodeId: background.id,
      all: style.cornerRadius
    });
  }

  // 3. Create the text centered in the frame
  const fontSize = style.fontSize || 14;
  const estimatedTextWidth = text.length * fontSize * 0.6;
  const textX = (width - estimatedTextWidth) / 2;
  const textY = (height - fontSize) / 2;
  const textNode = await textOperations.createText({
    x: Math.max(0, textX),
    y: textY,
    text,
    fontSize,
    fontWeight: style.fontWeight || 500,
    fontColor: style.text || { r: 1, g: 1, b: 1, a: 1 },
    name: `${name} Text`,
    parentId: frame.id
  });

  return {
    frameId: frame.id,
    backgroundId: background.id,
    textId: textNode.id
  };
}
