export function randomColor() {
  return {
    r: Math.random(),
    g: Math.random(),
    b: Math.random(),
    a: 1
  };
}

export function randomFontSize() {
  return Math.floor(Math.random() * 32) + 8; // 8 to 40 px
}

export function randomFontWeight() {
  const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
  return weights[Math.floor(Math.random() * weights.length)];
}
