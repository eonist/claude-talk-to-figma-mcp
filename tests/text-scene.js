import { create_text, randomFontSize, randomFontWeight, randomColor } from "./test-runner.js";

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
