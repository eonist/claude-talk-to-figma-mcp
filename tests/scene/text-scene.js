import { ws, channel, assertEchoedCommand, runStep } from "../test-runner.js";
import { randomFontSize, randomFontWeight, randomColor } from "../helper.js";

/**
 * Creates a text node with specified content, styling, and positioning.
 * Supports rich typography options including font family, size, weight, and color.
 * @param {Object} config - Text configuration object
 * @param {string} config.content - Text content to display
 * @param {string} config.fontFamily - CSS font family name (e.g., "Arial", "Helvetica")
 * @param {number} config.fontSize - Font size in pixels
 * @param {number} config.fontWeight - CSS font weight (100-900)
 * @param {{r: number, g: number, b: number, a: number}} config.fillColor - Text color as RGBA object
 * @param {number} config.x - X coordinate position
 * @param {number} config.y - Y coordinate position
 * @param {string} [config.parentId] - Optional parent frame ID for containment
 * @returns {Promise} Test result with text creation status
 * @example
 * const textResult = await createText({
 *   content: "Hello World",
 *   fontFamily: "Inter",
 *   fontSize: 24,
 *   fontWeight: 600,
 *   fillColor: { r: 0, g: 0, b: 0, a: 1 },
 *   x: 50, y: 100,
 *   parentId: frameId
 * });
 */
async function create_text(frameId) {
  const params = {
    x: 100,
    y: 200,
    text: 'Something to say',
    name: 'text',
    fontSize: randomFontSize(),
    fontWeight: randomFontWeight(),
    fontColor: randomColor(),
    parentId: frameId // Add the frame ID as the parent
  };
  // Create the text node
  const textResult = await runStep({
    ws,
    channel,
    command: 'set_text',
    params: { text: params },
    assert: (response) => ({ pass: !!response?.id, response, nodeId: response?.id }),
    label: `set_text (${params.name})`
  });
  // Apply line height and letter spacing using set_text_style
  const nodeId = textResult.response?.id;
  if (nodeId) {
    await runStep({
      ws,
      channel,
      command: 'set_text_style',
      params: {
        nodeId,
        lineHeight: { value: 1.6, unit: "MULTIPLIER" },
        letterSpacing: { value: 0.5, unit: "PIXELS" }
      },
      assert: () => ({ pass: true }),
      label: `set_text_style (${params.name})`
    });
  }
  return { ...textResult, nodeId };
}

/**
 * Creates a multi-line text area in Figma for text tests.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any, nodeId?:string}>} Test result object.
 */
async function create_text_area(frameId) {
  await runStep({
    ws,
    channel,
    command: 'load_font_async',
    params: { family: 'Roboto Mono', style: 'Regular' },
    assert: () => ({ pass: true }),
    label: 'load_font_async (Roboto Mono)'
  });
  const params = {
    x: 120,
    y: 300,
    text: 'This is a longer text\nwith multiple lines.\nLine 3.\nLine 4.',
    name: 'textArea',
    width: 250,
    height: 100,
    fontSize: randomFontSize(),
    fontColor: randomColor(),
    fontFamily: 'Roboto Mono',
    lineHeight: 1.6,
    letterSpacing: 0.5,
    parentId: frameId
  };
  const textResult = await runStep({
    ws,
    channel,
    command: 'set_text',
    params: { text: params },
    assert: (response) => ({ pass: !!response?.id, response, nodeId: response?.id }),
    label: `set_text (${params.name})`
  });
  const nodeId = textResult.response?.id;
  if (nodeId) {
    await runStep({
      ws,
      channel,
      command: 'set_text_style',
      params: {
        nodeId,
        lineHeight: { value: 1.6, unit: "MULTIPLIER" },
        letterSpacing: { value: 0.5, unit: "PIXELS" }
      },
      assert: () => ({ pass: true }),
      label: `set_text_style (${params.name})`
    });
  }
  return { ...textResult, nodeId };
}

/**
 * Creates a heading text node in Figma for text tests.
 * @param {string} frameId - The frame ID to place the heading inside.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any, nodeId?:string}>} Test result object.
 */
async function create_heading(frameId) {
  const headingFonts = ['Poppins', 'Montserrat', 'Source Code Pro', 'Playfair Display'];
  const randomFont = headingFonts[Math.floor(Math.random() * headingFonts.length)];
  await runStep({
    ws,
    channel,
    command: 'load_font_async',
    params: { family: randomFont, style: 'Regular' },
    assert: () => ({ pass: true }),
    label: `load_font_async (${randomFont})`
  });
  const params = {
    x: 100,
    y: 50,
    text: 'Welcome to Our Website',
    name: 'headingText',
    fontSize: 32,
    fontWeight: randomFontWeight(),
    fontColor: randomColor(),
    fontFamily: randomFont,
    parentId: frameId
  };
  const textResult = await runStep({
    ws,
    channel,
    command: 'set_text',
    params: { text: params },
    assert: (response) => ({ pass: !!response?.id, response, nodeId: response?.id }),
    label: `set_text (${params.name})`
  });
  return { ...textResult, nodeId: textResult.response?.id };
}

/**
 * Creates a text block in Figma for text tests.
 * @param {string} frameId - The frame ID to place the text block inside.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any, nodeId?:string}>} Test result object.
 */
async function create_text_block(frameId) {
  const params = {
    x: 100,
    y: 400,
    text: 'Lorem ipsum dolor sit amet',
    name: 'textBlock',
    fontSize: 16,
    fontColor: { r: 0, g: 0.666, b: 0, a: 1 },
    fontFamily: 'Oswald',
    parentId: frameId
  };
  const textResult = await runStep({
    ws,
    channel,
    command: 'set_text',
    params: { text: params },
    assert: (response) => ({ pass: !!response?.id, response, nodeId: response?.id }),
    label: `set_text (${params.name})`
  });
  return { ...textResult, nodeId: textResult.response?.id };
}

/**
 * Creates a hero title text node in Figma for text tests.
 * @param {string} frameId - The frame ID to place the hero title inside.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any, nodeId?:string}>} Test result object.
 */
async function create_hero_title(frameId) {
  await runStep({
    ws,
    channel,
    command: 'load_font_async',
    params: { family: 'Roboto', style: 'Bold' },
    assert: () => ({ pass: true }),
    label: 'load_font_async (Roboto)'
  });
  const params = {
    x: 100,
    y: 450,
    text: 'Hero Title',
    name: 'heroTitleText',
    fontSize: 48,
    fontWeight: 700,
    letterSpacing: -1,
    textAlignHorizontal: 'CENTER',
    fontFamily: 'Roboto',
    fontColor: randomColor(),
    parentId: frameId
  };
  const textResult = await runStep({
    ws,
    channel,
    command: 'set_text',
    params: { text: params },
    assert: (response) => ({ pass: !!response?.id, response, nodeId: response?.id }),
    label: `set_text (${params.name})`
  });
  return { ...textResult, nodeId: textResult.response?.id };
}

/**
 * Creates a frame in Figma for text tests.
 * @param {object} opts - Optional overrides for frame params.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any, frameId?:string}>}
 */
async function create_frame(opts = {}) {
  const params = {
    x: 50, y: 100, width: 600, height: 400,
    name: 'Text Frame',
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1,
    ...opts
  };
  const result = await runStep({
    ws, channel,
    command: 'create_frame',
    params: { frame: params },
    assert: (response) => ({ pass: Array.isArray(response.ids) && response.ids.length > 0, response, frameId: response?.ids?.[0] }),
    label: `create_frame (${params.name})`
  });
  return { ...result, frameId: result.response?.ids?.[0] };
}

/**
 * Applies auto-layout configuration to a frame for organized text arrangement.
 * Sets up vertical flow with consistent spacing and padding for optimal text readability.
 * @param {string} frameId - The frame ID to apply auto-layout to
 * @returns {Promise} Auto-layout application result
 * @example
 * const layoutResult = await applyTextLayout('frame123');
 * if (layoutResult.pass) console.log('Text layout applied successfully');
 */
async function apply_auto_layout(frameId, mode, gap, padding) {
  const params = {
    layout: {
      nodeId: frameId,
      mode,
      itemSpacing: gap,
      paddingLeft: padding,
      paddingRight: padding,
      paddingTop: padding,
      paddingBottom: padding,
      primaryAxisSizing: "AUTO",
      counterAxisSizing: "AUTO"
    }
  };
  await runStep({
    ws, channel,
    command: "set_auto_layout",
    params,
    assert: (response) => ({ pass: response && response["0"] && response["0"].success === true && response["0"].nodeId === frameId, response }),
    label: `apply_auto_layout to frame ${frameId} (${mode})`
  });
}

/**
 * Main entry point for text scene demonstration.
 * Creates a variety of text samples showcasing different typography styles and arrangements.
 * @param {Array} results - Array to collect test results
 * @param {string} [parentFrameId] - Optional parent frame ID for scene organization
 * @example
 * const results = [];
 * await textScene(results, 'container123');
 * console.log(`Created ${results.filter(r => r.pass).length} text elements`);
 */
export async function textScene(results, parentFrameId) {
  // Create 5 text nodes, store their nodeIds
  const textNodes = [];

  // Create two vertical frames for grouping
  const frame1 = await create_frame({ name: "VerticalFrame1" });
  results.push(frame1);
  const frame1Id = frame1.frameId;

  const frame2 = await create_frame({ name: "VerticalFrame2" });
  results.push(frame2);
  const frame2Id = frame2.frameId;

  // First 3 text items in frame1
  const heading = await create_heading(frame1Id);
  results.push(heading);
  textNodes.push(heading.nodeId);

  const textBlock = await create_text_block(frame1Id);
  results.push(textBlock);
  textNodes.push(textBlock.nodeId);

  const textItem = await create_text(frame1Id);
  results.push(textItem);
  textNodes.push(textItem.nodeId);

  // Next 2 text items in frame2
  const heroTitle = await create_hero_title(frame2Id);
  results.push(heroTitle);
  textNodes.push(heroTitle.nodeId);

  const textArea = await create_text_area(frame2Id);
  results.push(textArea);
  textNodes.push(textArea.nodeId);

  // Apply vertical auto layout to both vertical frames
  await apply_auto_layout(frame1Id, "VERTICAL", 10, 20);
  await apply_auto_layout(frame2Id, "VERTICAL", 10, 20);

  // Create parent horizontal frame as a child of the all-scenes container
  const parentFrame = await create_frame({ name: "ParentHorizontalFrame", ...(parentFrameId && { parentId: parentFrameId }) });
  results.push(parentFrame);
  const parentFrameNodeId = parentFrame.frameId;

  // Move the two vertical frames into the parent frame
  await runStep({
    ws, channel,
    command: "set_node",
    params: { parentId: parentFrameNodeId, childId: frame1Id },
    assert: (response) => ({ pass: true, response }),
    label: `set_node (move frame1 into parent)`
  });
  await runStep({
    ws, channel,
    command: "set_node",
    params: { parentId: parentFrameNodeId, childId: frame2Id },
    assert: (response) => ({ pass: true, response }),
    label: `set_node (move frame2 into parent)`
  });

  // Apply horizontal auto layout to parent frame
  await apply_auto_layout(parentFrameNodeId, "HORIZONTAL", 10, 20);
}
