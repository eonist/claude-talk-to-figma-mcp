import { ws, channel, assertEchoedCommand, runStep } from "./test-runner.js";
import { randomFontSize, randomFontWeight, randomColor } from "./helper.js";

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
    assert: (response) => {
      const expected = params;
      const actual = response && response.params && response.params.text;
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        return {
          pass: false,
          message:
            "Response params.text does not match input params.\n" +
            "Expected: " + JSON.stringify(expected, null, 2) + "\n" +
            "Actual:   " + JSON.stringify(actual, null, 2)
        };
      }
      return { pass: true };
    },
    label: `set_text (${params.name})`
  });
}

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
    assert: (response) => {
      const expected = params;
      const actual = response && response.params && response.params.text;
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        return {
          pass: false,
          message:
            "Response params.text does not match input params.\n" +
            "Expected: " + JSON.stringify(expected, null, 2) + "\n" +
            "Actual:   " + JSON.stringify(actual, null, 2)
        };
      }
      return { pass: true };
    },
    label: `set_text (${params.name})`
  });
}

export async function textScene(results) {
  results.push(await create_text());
  results.push(await create_text_area());
}

//export { create_text };
