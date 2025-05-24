import { create_rectangle, create_ellipse, randomColor } from "./test-runner.js";

export async function shapeScene(results) {
  results.push(await create_rectangle({
    x: 0,
    y: 0,
    width: 200,
    height: 100,
    name: 'UnitTestRectangle',
    cornerRadius: 12,
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
  }));
  results.push(await create_ellipse({
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    name: 'UnitTestEllipse',
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
  }));
}
