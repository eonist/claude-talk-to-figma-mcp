import { channel, runStep, ws } from "../test-runner.js";

// ========== CONSTANTS ==========
const COLORS = {
  red: { r: 1, g: 0, b: 0, a: 1 },
  green: { r: 0, g: 1, b: 0, a: 1 },
  blue: { r: 0, g: 0, b: 1, a: 1 },
  lightGray: { r: 0.95, g: 0.95, b: 0.95, a: 1 },
  darkGray: { r: 0.7, g: 0.7, b: 0.7, a: 1 },
  black: { r: 0, g: 0, b: 0, a: 1 }
};

const DEFAULT_STYLES = {
  frame: {
    fillColor: COLORS.lightGray,
    strokeColor: COLORS.darkGray,
    strokeWeight: 1
  },
  rectangle: {
    strokeColor: COLORS.black,
    strokeWeight: 1,
    cornerRadius: 0
  }
};

const AUTO_LAYOUT_CONFIG = {
  mode: 'HORIZONTAL',
  itemSpacing: 20,
  counterAxisSpacing: 30,
  paddingLeft: 10,
  paddingRight: 10,
  paddingTop: 15,
  paddingBottom: 15,
  primaryAxisSizing: 'AUTO',
  counterAxisSizing: 'AUTO',
  layoutWrap: 'WRAP'
};

const AUTO_LAYOUT_CONFIG_HUG_BOTH = {
  mode: 'HORIZONTAL',
  itemSpacing: 20,
  counterAxisSpacing: 30,
  paddingLeft: 10,
  paddingRight: 10,
  paddingTop: 15,
  paddingBottom: 15,
  primaryAxisSizing: 'AUTO',
  counterAxisSizing: 'AUTO',
  layoutWrap: 'WRAP'
};

const AUTO_LAYOUT_CONFIG_HUG_HEIGHT = {
  mode: 'HORIZONTAL',
  itemSpacing: 20,
  counterAxisSpacing: 30,
  paddingLeft: 10,
  paddingRight: 10,
  paddingTop: 15,
  paddingBottom: 15,
  primaryAxisSizing: 'FIXED',
  counterAxisSizing: 'AUTO',
  layoutWrap: 'WRAP'
};

// New vertical auto layout configuration for parent frame
const AUTO_LAYOUT_CONFIG_VERTICAL = {
  mode: 'VERTICAL',
  itemSpacing: 30,
  counterAxisSpacing: 0,
  paddingLeft: 20,
  paddingRight: 20,
  paddingTop: 25,
  paddingBottom: 25,
  primaryAxisSizing: 'AUTO',
  counterAxisSizing: 'AUTO',
  layoutWrap: 'NO_WRAP'
};

// ========== UTILITY FUNCTIONS ==========
/**
 * Creates a standardized runStep configuration
 */
function createRunStepConfig(command, params, assertFn, label) {
  return runStep({
    ws,
    channel,
    command,
    params,
    assert: assertFn,
    label
  });
}

/**
 * Standard assertion for operations that return an ids array
 */
function assertIdsResponse(response) {
  const pass = Array.isArray(response.ids) && response.ids.length > 0;
  return { pass, response };
}

/**
 * Standard assertion for operations that return success status
 */
function assertSuccessResponse(response) {
  const pass = response && response.success === true;
  return { pass, response };
}

// ========== SHAPE CREATION FUNCTIONS ==========
/**
 * Creates a frame with the specified properties
 */
function createFrame({ x, y, width, height, name, parentId }) {
  const params = {
    frame: {
      x,
      y,
      width,
      height,
      name,
      ...DEFAULT_STYLES.frame,
      ...(parentId && { parentId })
    }
  };

  return createRunStepConfig(
    'create_frame',
    params,
    assertIdsResponse,
    `create_frame (${name})`
  );
}

/**
 * Creates a rectangle with the specified properties
 */
function createRectangle({ fillColor, width, height, parentId = null, name = 'TransformRectangle' }) {
  const params = {
    rectangle: {
      x: parentId ? 20 : 0,
      y: parentId ? 20 : 0,
      width,
      height,
      name,
      fillColor,
      ...DEFAULT_STYLES.rectangle,
      ...(parentId && { parentId })
    }
  };

  return createRunStepConfig(
    'create_rectangle',
    params,
    assertIdsResponse,
    `create_rectangle (${width}x${height})`
  );
}

// ========== TRANSFORMATION FUNCTIONS ==========
/**
 * Sets the position of a node
 */
function setPosition(nodeId, x, y) {
  const assertFn = (response) => {
    const pass = Array.isArray(response.results) &&
      response.results.some(r => r.nodeId === nodeId && r.success === true);
    return {
      pass,
      reason: pass ? undefined : `Expected results to include success for ${nodeId}`,
      response
    };
  };

  return createRunStepConfig(
    'move_node',
    { nodeId, x, y },
    assertFn,
    `set_position (${x},${y}) for ${nodeId}`
  );
}

/**
 * Sets the size of a node
 */
function setSize(nodeId, width, height) {
  const assertFn = (response) => {
    const pass = Array.isArray(response.ids) && response.ids.includes(nodeId);
    return {
      pass,
      reason: pass ? undefined : `Expected ids to include ${nodeId}`,
      response
    };
  };

  return createRunStepConfig(
    'resize_node',
    { nodeId, width, height },
    assertFn,
    `set_size (${width}x${height}) for ${nodeId}`
  );
}

/**
 * Applies auto layout to a frame
 */
function setAutoLayout(frameId, config = AUTO_LAYOUT_CONFIG) {
  const params = {
    layout: {
      nodeId: frameId,
      ...config
    }
  };

  const assertFn = (response) => {
    const pass = response?.['0']?.success === true && response?.['0']?.nodeId === frameId;
    return { pass, response };
  };

  return createRunStepConfig(
    'set_auto_layout',
    params,
    assertFn,
    `apply_autolayout (hug: ${config.primaryAxisSizing}/${config.counterAxisSizing}) to frame ${frameId}`
  );
}

/**
 * Reorders nodes in z-index
 */
function reorderNodes(nodeIds, order) {
  return Promise.all(
    order.map((nodeId, idx) =>
      createRunStepConfig(
        'reorder_node',
        { reorder: { nodeId, index: idx } },
        assertSuccessResponse,
        `reorder_node (${nodeId}) to index ${idx}`
      )
    )
  );
}

/**
 * Rotates a node by the specified angle
 */
function rotateNode(nodeId, angle) {
  return createRunStepConfig(
    'rotate_node',
    { nodeId, angle },
    assertSuccessResponse,
    `rotate_node (${nodeId}) by ${angle}deg`
  );
}

/**
 * Applies a matrix transformation to a node
 */
function setMatrixTransform(nodeId, matrix) {
  const assertFn = (response) => {
    const pass = Array.isArray(response.results) &&
      response.results.some(r => r.nodeId === nodeId && r.success);
    return { pass, response };
  };

  return createRunStepConfig(
    'set_matrix_transform',
    { entry: { nodeId, matrix } },
    assertFn,
    `set_matrix_transform (${nodeId})`
  );
}

// ========== HELPER FUNCTIONS ==========
/**
 * Creates a rectangle with position and size setup
 */
async function createAndSetupRectangle(color, width, height, parentId, x = 0, y = 0) {
  const result = await createRectangle({ fillColor: color, width, height, parentId });
  const rectangleId = result.response?.ids?.[0];
  
  const operations = [];
  if (rectangleId) {
    operations.push(await setPosition(rectangleId, x, y));
    operations.push(await setSize(rectangleId, width, height));
  }
  
  return { result, rectangleId, operations };
}

/**
 * Creates a skew transformation matrix
 */
function createSkewMatrix(angleInDegrees) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  const tanAngle = Math.tan(angleInRadians);
  return [1, 0, tanAngle, 1, 0, 0];
}

// ========== MAIN SCENE CREATION FUNCTION ==========
/**
 * Creates and transforms the complete scene with a parent frame
 * @param {Array} results
 * @param {string} [parentFrameId] - Optional parent frame ID for the scene
 */
export async function transformScene(results, parentFrameId) {
  try {
    // Create parent frame with vertical auto layout as a child of the all-scenes container
    const parentFrameNodeId = await createParentFrame(results, parentFrameId);

    // Create main frame as child of parent
    const mainFrame = await createMainFrame(results, parentFrameNodeId);

    // Create auto layout frame as child of parent
    const autoLayoutFrame = await createAutoLayoutFrame(results, parentFrameNodeId);

    // Apply transformations to auto layout frame rectangles
    await applyTransformations(results, autoLayoutFrame);

  } catch (error) {
    console.error('Error in transformScene:', error);
    throw error;
  }
}

/**
 * Creates the parent frame with vertical auto layout
 * @param {Array} results
 * @param {string} [parentId] - Optional parent frame ID
 */
async function createParentFrame(results, parentId) {
  const parentFrameResult = await createFrame({
    x: 20,
    y: 20,
    width: 500,
    height: 800,
    name: 'Parent Container',
    ...(parentId && { parentId })
  });
  results.push(parentFrameResult);

  const parentFrameId = parentFrameResult.response?.ids?.[0];

  // Apply vertical auto layout with padding and gap
  if (parentFrameId) {
    results.push(await setAutoLayout(parentFrameId, AUTO_LAYOUT_CONFIG_VERTICAL));
  }

  return parentFrameId;
}

/**
 * Creates the main frame with three rectangles as child of parent
 */
async function createMainFrame(results, parentFrameId) {
  const frameResult = await createFrame({
    x: 0, // Position will be handled by parent auto layout
    y: 0,
    width: 400,
    height: 300,
    name: 'Main Frame',
    parentId: parentFrameId
  });
  results.push(frameResult);

  const frameId = frameResult.response?.ids?.[0];

  // Apply autolayout with hug both width and height, padding, and gaps
  if (frameId) {
    results.push(await setAutoLayout(frameId, AUTO_LAYOUT_CONFIG_HUG_BOTH));
  }

  // Create rectangles as children (autolayout will arrange them)
  const rectangles = [
    { color: COLORS.red, width: 100, height: 100 },
    { color: COLORS.green, width: 150, height: 100 },
    { color: COLORS.blue, width: 100, height: 150 }
  ];

  for (const rect of rectangles) {
    const result = await createRectangle({
      fillColor: rect.color,
      width: rect.width,
      height: rect.height,
      parentId: frameId
    });
    results.push(result);
  }

  return frameId;
}

/**
 * Creates the auto layout frame with rectangles as child of parent
 */
async function createAutoLayoutFrame(results, parentFrameId) {
  const frame2Result = await createFrame({
    x: 0, // Position will be handled by parent auto layout
    y: 0,
    width: 400,
    height: 300,
    name: 'AutoLayout Frame',
    parentId: parentFrameId
  });
  results.push(frame2Result);

  const frame2Id = frame2Result.response?.ids?.[0];

  // Apply autolayout with hug both axes, padding, and gaps
  if (frame2Id) {
    results.push(await setAutoLayout(frame2Id, AUTO_LAYOUT_CONFIG_HUG_BOTH));
  }

  // Create rectangles for auto layout
  const rectangleConfigs = [
    { color: COLORS.red, width: 120, height: 80 },
    { color: COLORS.green, width: 90, height: 120 },
    { color: COLORS.blue, width: 140, height: 60 }
  ];

  const rectangleIds = [];
  for (const config of rectangleConfigs) {
    const result = await createRectangle({
      fillColor: config.color,
      width: config.width,
      height: config.height,
      parentId: frame2Id
    });
    results.push(result);
    rectangleIds.push(result.response?.ids?.[0]);
  }

  return { frameId: frame2Id, rectangleIds };
}

/**
 * Applies various transformations to the auto layout frame rectangles
 */
async function applyTransformations(results, { frameId, rectangleIds }) {
  const [rectAId, rectBId, rectCId] = rectangleIds;

  // Reorder z-index: blue, green, red
  if (rectAId && rectBId && rectCId) {
    const reorderResults = await reorderNodes(
      [rectAId, rectBId, rectCId],
      [rectCId, rectBId, rectAId]
    );
    reorderResults.forEach(r => results.push(r));
  }

  // Apply individual transformations
  const transformations = [
    // Rotate red rectangle 45 degrees
    rectAId && rotateNode(rectAId, 45),
    // Resize green rectangle
    rectBId && setSize(rectBId, 200, 100),
    // Apply skew transformation to blue rectangle
    rectCId && setMatrixTransform(rectCId, createSkewMatrix(45))
  ].filter(Boolean);

  for (const transformation of transformations) {
    results.push(await transformation);
  }
}
