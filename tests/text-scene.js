import { ws, channel, assertEchoedCommand, randomFontSize, randomFontWeight, randomColor, runStep } from "./test-runner.js";

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
}

export { create_text };
