/**
 * Button creation operation for Figma.
 * Exports: createButton
 */
import * as shapeOperations from '../shapes.js';
import * as textOperations from '../text.js';

/**
 * Creates a complete button with a frame container, background, and text.
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
