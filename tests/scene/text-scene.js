import { ws, channel, assertEchoedCommand, runStep } from "../test-runner.js";
import { randomFontSize, randomFontWeight, randomColor } from "../helper.js";

/**
 * Helper to create a single-line text node in Figma for text tests.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>} Test result object.
 */
function create_text(frameId) {
  const params = {
    x: 100,
    y: 200,
    text: 'UnitTestText',
    name: 'UnitTestTextNode',
    fontSize: randomFontSize(),
    fontWeight: randomFontWeight(),
    fontColor: randomColor(),
    parentId: frameId // Add the frame ID as the parent
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
 * Helper to create a multi-line text area in Figma for text tests.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>} Test result object.
 */
function create_text_area(frameId) {
  const params = {
    x: 120,
    y: 300,
    text: 'This is a longer text\nwith multiple lines.\nLine 3.\nLine 4.',
    name: 'UnitTestTextArea',
    width: 250,
    height: 100,
    fontSize: randomFontSize(),
    fontWeight: randomFontWeight(),
    fontColor: randomColor(),
    parentId: frameId // Add the frame ID as the parent
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
 * Helper to create a heading text node in Figma for text tests.
 * @param {string} frameId - The frame ID to place the heading inside.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>} Test result object.
 */
function create_heading(frameId) {
  const params = {
    x: 100,
    y: 50, // Position for the heading
    text: 'Welcome to Our Website',
    name: 'HeadingTextNode',
    fontSize: 32, // Set font size to 32px
    fontWeight: randomFontWeight(),
    fontColor: randomColor(), // Use a random color for the font
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
 * Helper to create a frame in Figma for text tests.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function create_frame() {
  const params = {
    x: 50, y: 100, width: 400, height: 300,
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
  
  // Create heading inside the frame
  results.push(await create_heading(frameId));
  
  // Create text items inside the frame
  results.push(await create_text(frameId));
  results.push(await create_text_area(frameId));
  
  // Apply autolayout to the frame
  results.push(await apply_autolayout(frameId));
}
