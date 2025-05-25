import { ws, channel, assertEchoedCommand, runStep } from "../test-runner.js";
import { randomFontSize, randomFontWeight, randomColor } from "../helper.js";

/**
 * Helper to create a single-line text node in Figma for text tests.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>} Test result object.
 */
function create_text() {
  const params = {
    x: 100,
    y: 200,
    text: 'UnitTestText',
    name: 'UnitTestTextNode',
    fontSize: randomFontSize(),
    fontWeight: randomFontWeight(),
    fontColor: randomColor()
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
function create_text_area() {
  const params = {
    x: 120,
    y: 300,
    text: 'This is a longer text\nwith multiple lines.\nLine 3.\nLine 4.',
    name: 'UnitTestTextArea',
    width: 250,
    height: 100,
    fontSize: randomFontSize(),
    fontWeight: randomFontWeight(),
    fontColor: randomColor()
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
 * Text scene: creates a single-line and a multi-line text node in sequence.
 * @param {Array} results - Collector array for test step results.
 * @returns {Promise<void>}
 */
export async function textScene(results) {
  results.push(await create_text());
  results.push(await create_text_area());
}

//export { create_text };
