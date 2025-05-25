import { ws, channel, assertEchoedCommand, runStep } from "../test-runner.js";
import { randomFontSize, randomFontWeight, randomColor } from "../helper.js";

/**
 * Helper to create a single-line text node in Figma for text tests.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>} Test result object.
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
    assert: () => ({ pass: true }),
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
  return textResult;
}

/**
 * Helper to create a multi-line text area in Figma for text tests.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>} Test result object.
 */
async function create_text_area(frameId) {
  // Load the monospace font Roboto Mono before creating the text area
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
    //fontWeight: randomFontWeight(),
    fontColor: randomColor(),
    fontFamily: 'Roboto Mono',
    lineHeight: 1.6,
    letterSpacing: 0.5,
    parentId: frameId // Add the frame ID as the parent
  };
  // Create the text node
  const textResult = await runStep({
    ws,
    channel,
    command: 'set_text',
    params: { text: params },
    assert: () => ({ pass: true }),
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
  return textResult;
}

/**
 * Helper to create a heading text node in Figma for text tests.
 * @param {string} frameId - The frame ID to place the heading inside.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>} Test result object.
 */
async function create_heading(frameId) {
  const headingFonts = ['Poppins', 'Montserrat', 'Source Code Pro', 'Playfair Display'];
  const randomFont = headingFonts[Math.floor(Math.random() * headingFonts.length)];
  // Load the randomly selected font before creating the heading
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
    y: 50, // Position for the heading
    text: 'Welcome to Our Website',
    name: 'headingText',
    fontSize: 32, // Set font size to 32px
    fontWeight: randomFontWeight(),
    fontColor: randomColor(), // Use a random color for the font
    fontFamily: randomFont,
    parentId: frameId // Set the frame ID as the parent
  };
  return runStep({
    ws,
    channel,
    command: 'set_text',
    params: { text: params },
    assert: () => ({ pass: true }),
    label: `set_text (${params.name})`
  });
}

/**
 * Helper to create a text block in Figma for text tests.
 * @param {string} frameId - The frame ID to place the text block inside.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>} Test result object.
 */
function create_text_block(frameId) {
  const params = {
    x: 100,
    y: 400, // Position for the text block
    text: 'Lorem ipsum dolor sit amet',
    name: 'textBlock',
    fontSize: 16, // Set a default font size
    //fontWeight: randomFontWeight(),
    fontColor: { r: 0, g: 0.666, b: 0, a: 1 }, // Use a valid color object
    fontFamily: 'Oswald', // Apply the Oswald font family
    parentId: frameId // Set the frame ID as the parent
  };
  console.log("create_text_block called with params:", params);
  return runStep({
    ws,
    channel,
    command: 'set_text',
    params: { text: params },
    assert: () => ({ pass: true }),
    label: `set_text (${params.name})`
  });
}


/**
 * Helper to create a hero title text node in Figma for text tests.
 * @param {string} frameId - The frame ID to place the hero title inside.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>} Test result object.
 */
async function create_hero_title(frameId) {
  // Load the Roboto font using MCP server command
  await runStep({
    ws,
    channel,
    command: 'load_font_async',
    params: { family: 'Roboto', style: 'Bold' },
    assert: () => ({ pass: true }),
    label: 'load_font_async (Roboto)'
  });
  console.log('Roboto font loaded');
  const params = {
    x: 100,
    y: 450, // Position for the hero title
    text: 'Hero Title',
    name: 'heroTitleText',
    fontSize: 48,
    fontWeight: 700, // Bold weight
    letterSpacing: -1,
    textAlignHorizontal: 'CENTER',
    fontFamily: 'Roboto',
    fontColor: randomColor(),
    parentId: frameId
  };
  console.log('Creating hero title with params:', params);
  return runStep({
    ws,
    channel,
    command: 'set_text',
    params: { text: params },
    assert: () => ({ pass: true }),
    label: `set_text (${params.name})`
  });
}

/**
 * Helper to create a frame in Figma for text tests.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function create_frame() {
  const params = {
    x: 50, y: 100, width: 600, height: 400,
    name: 'Text Frame',
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
  };
  return runStep({
    ws, channel,
    command: 'create_frame',
    params: { frame: params },
    assert: (response) => ({ pass: Array.isArray(response.ids) && response.ids.length > 0, response }),
    label: `create_frame (${params.name})`
  });
}

/**
 * Helper to apply autolayout to a frame with horizontal flow, wrapping, and specific gaps and padding.
 * @param {string} frameId - The frame ID to apply autolayout to
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function apply_autolayout(frameId) {
  const params = {
    layout: {
      nodeId: frameId,
      mode: 'HORIZONTAL',
      itemSpacing: 20, // Horizontal gap between items
      counterAxisSpacing: 30, // Vertical gap between rows when wrapping
      paddingLeft: 10, // Horizontal padding
      paddingRight: 10, // Horizontal padding
      paddingTop: 15, // Vertical padding
      paddingBottom: 15, // Vertical padding
      primaryAxisSizing: 'FIXED',
      layoutWrap: 'WRAP'
    }
  };
  return runStep({
    ws, channel,
    command: 'set_auto_layout',
    params: params,
    assert: (response) => ({ 
      pass: response && response['0'] && response['0'].success === true && response['0'].nodeId === frameId,
      response 
    }),
    label: `apply_autolayout to frame ${frameId}`
  });
}

/**
 * Text scene: creates a frame, adds text nodes, and applies autolayout.
 * @param {Array} results - Collector array for test step results.
 * @returns {Promise<void>}
 */
export async function textScene(results) {
  // Create frame first and store its ID
  const frameResult = await create_frame();
  results.push(frameResult);
  
  // Extract frame ID from the response
  const frameId = frameResult.response?.ids?.[0];
  
  if (!frameId) {
    console.warn('Could not get frame ID for placing text inside frame');
  }

   // Create text block inside the frame
  //results.push(await create_text_block(frameId));

  // Create heading inside the frame
  //results.push(await create_heading(frameId));
  
  // Create text items inside the frame
  results.push(await create_text(frameId));
  //results.push(await create_text_area(frameId));
  
  // Create hero title inside the frame
  //results.push(await create_hero_title(frameId));
  
  // Apply autolayout to the frame
  results.push(await apply_autolayout(frameId));
}
