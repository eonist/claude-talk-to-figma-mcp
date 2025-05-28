import { randomColor } from "../helper.js";
import { channel, runStep, ws } from "../test-runner.js";

// Create a frame and return its ID
async function createFrame() {
  const params = {
    x: 50, y: 100, width: 400, height: 200,
    name: "Effect Frame",
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: 2
  };
  const res = await runStep({
    ws, channel,
    command: "create_frame",
    params: { frame: params },
    assert: r => Array.isArray(r.ids) && r.ids.length > 0,
    label: "create_frame"
  });
  return res?.response?.ids?.[0];
}

// Apply autolayout to a frame
async function applyAutolayout(frameId) {
  const params = {
    layout: {
      nodeId: frameId,
      mode: "HORIZONTAL",
      layoutWrap: "WRAP",
      itemSpacing: 20,
      counterAxisSpacing: 20,
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 20,
      paddingBottom: 20,
      primaryAxisSizing: "AUTO",
      counterAxisSizing: "AUTO"
    }
  };
  await runStep({
    ws, channel,
    command: "set_auto_layout",
    params,
    assert: r => r && r["0"] && r["0"].success === true && r["0"].nodeId === frameId,
    label: "apply_autolayout"
  });
}

// Create a rectangle of a given color and return its ID
async function createRect(frameId, name, fillColor) {
  const params = {
    x: 0, y: 0,
    width: 100, height: 100,
    name,
    fillColor,
    strokeColor: { r: 0, g: 0, b: 0, a: 1 },
    strokeWeight: 1,
    parentId: frameId
  };
  const res = await runStep({
    ws, channel,
    command: "create_rectangle",
    params: { rectangle: params },
    assert: r => Array.isArray(r.ids) && r.ids.length > 0,
    label: `create_rectangle (${name})`
  });
  return res?.response?.ids?.[0];
}

// Apply a single effect to a node
async function applyEffect(nodeId, effects, label) {
  await runStep({
    ws, channel,
    command: "set_effect",
    params: {
      nodeId,
      effects
    },
    assert: r => r && r.nodeId === nodeId,
    label
  });
}

// --- Rectangle + Effect Functions ---

// Red rectangle with drop shadow
async function addRedRectWithDropShadow(frameId) {
  const red = { r: 1, g: 0, b: 0, a: 1 };
  const rectId = await createRect(frameId, "RedRect", red);
  if (!rectId) return;
  await applyEffect(rectId, [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 1 },
      offset: { x: 0, y: 2 },
      radius: 4,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
      opacity: 0.5,
      name: "Drop Shadow"
    }
  ], "Apply drop shadow to RedRect");
}

// Green rectangle with inner shadow
async function addGreenRectWithInnerShadow(frameId) {
  const green = { r: 0, g: 1, b: 0, a: 1 };
  const rectId = await createRect(frameId, "GreenRect", green);
  if (!rectId) return;

  // 1. Create the effect style variable for inner shadow
  const styleResult = await runStep({
    ws, channel,
    command: "create_effect_style_variable",
    params: {
      name: "Inner Shadow",
      effects: [
        {
          type: "INNER_SHADOW",
          color: { r: 0.2, g: 0.2, b: 0.2, a: 0.3 },
          offset: { x: 0, y: -2 },
          radius: 3,
          spread: 0,
          visible: true,
          blendMode: "NORMAL"
        }
      ]
    },
    assert: r => r && r.id,
    label: "create_effect_style_variable (Inner Shadow)"
  });
  const effectStyleId = styleResult?.response?.id;
  if (!effectStyleId) {
    console.error("No effectStyleId returned from create_effect_style_variable");
    return;
  }

  // Add a delay to ensure the style is registered before applying
  //await new Promise(res => setTimeout(res, 300));

  // 2. Apply the effect style to the green rectangle
  try {
    console.log("Applying effect style to GreenRect", { nodeId: rectId, effectStyleId });
    await runStep({
      ws, channel,
      command: "apply_effect_style",
      params: {
        nodeId: rectId,
        effectStyleId
      },
      assert: r => r && r.nodeId === rectId,
      label: "apply_effect_style to GreenRect"
    });
    console.log("Applied effect style to GreenRect", { nodeId: rectId, effectStyleId });
  } catch (err) {
    console.error("Error applying effect style to GreenRect", err);
  }

}

// Blue rectangle with background blur
async function addBlueRectWithBackgroundBlur(frameId) {
  const blue = { r: 0, g: 0, b: 1, a: 1 };
  const rectId = await createRect(frameId, "BlueRect", blue);
  if (!rectId) return;
  await applyEffect(rectId, [
    {
      type: "BACKGROUND_BLUR",
      radius: 6,
      visible: true,
      blendMode: "NORMAL",
      name: "Background Blur"
    }
  ], "Apply background blur to BlueRect");
}

// --- Main Entrypoint ---

export async function effectScene() {
  const frameId = await createFrame();
  if (!frameId) return;
  await applyAutolayout(frameId);

  await addRedRectWithDropShadow(frameId);
  await addGreenRectWithInnerShadow(frameId);
  await addBlueRectWithBackgroundBlur(frameId);
}
