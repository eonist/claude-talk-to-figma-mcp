import { ws, channel, assertEchoedCommand, runStep } from "./test-runner.js";
import { randomFontSize, randomFontWeight, randomColor } from "./helper.js";

function create_text(params) {
  return runStep({
    ws,
    channel,
    command: 'set_text',
    params: { text: params },
    assert: assertEchoedCommand('set_text', params),
    label: `set_text (${params.name || ''})`
  });
}

export async function textScene(results) {
  results.push(await create_text({
    x: 100,
    y: 200,
    text: 'UnitTestText',
    name: 'UnitTestTextNode',
    fontSize: randomFontSize(),
    fontWeight: randomFontWeight(),
    fontColor: randomColor()
  }));
  results.push(await create_text({
    x: 120,
    y: 300,
    text: 'This is a longer text\nwith multiple lines.\nLine 3.\nLine 4.',
    name: 'UnitTestTextArea',
    width: 250,
    height: 100,
    fontSize: randomFontSize(),
    fontWeight: randomFontWeight(),
    fontColor: randomColor()
  }));
}

//export { create_text };
