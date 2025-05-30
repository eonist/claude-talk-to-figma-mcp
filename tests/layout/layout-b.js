import { channel, runStep, ws } from "../test-runner.js";

/**
 * Creates the main container frame as specified:
 * - Vertical auto-layout (vertical stack)
 * - Dark gray/black background (#1A1A1A)
 * - Padding: 24px all sides
 * - Spacing: 20px between children
 * - Width: 400px (fixed)
 * - Height: hug contents (vertical "AUTO"), max 540px
 * - Horizontal resizing: FIXED
 * - Vertical resizing: AUTO (hug)
 * - Name: main-container-frame
 * @param {string} [parentId] - Optional parent frame ID
 * @returns {Promise} Test result with frame creation status
 */
async function create_main_container_frame(parentId) {
  // 1. Create the frame
  const params = {
    x: 0,
    y: 0,
    width: 400,
    // height is not set, so it can hug contents (vertical "AUTO")
    name: "main-container-frame",
    fillColor: { r: 0.0, g: 0.0, b: 0.0, a: 1 }, // #000000
    ...(parentId && { parentId })
  };
  const frameResult = await runStep({
    ws, channel,
    command: "create_frame",
    params: { frame: params },
    assert: (response) => ({
      pass: (Array.isArray(response.ids) && response.ids.length > 0) || typeof response.id === "string",
      response
    }),
    label: `create_main_container_frame (${params.name})`
  });

  const frameId = frameResult.response?.ids?.[0];
  if (!frameId) return frameResult;

  // 2. Set vertical auto-layout, padding 24, spacing 20, sizing modes
  const layoutParams = {
    layout: {
      nodeId: frameId,
      mode: "VERTICAL",
      paddingLeft: 24,
      paddingRight: 24,
      paddingTop: 24,
      paddingBottom: 24,
      itemSpacing: 20,
      primaryAxisSizing: "AUTO",      // vertical: hug contents
      counterAxisSizing: "FIXED"      // horizontal: fixed
    }
  };
  const layoutResult = await runStep({
    ws, channel,
    command: "set_auto_layout",
    params: layoutParams,
    assert: (response) => ({
      pass: response && response["0"] && response["0"].success === true && response["0"].nodeId === frameId,
      response
    }),
    label: `set_auto_layout on main-container-frame`
  });

  // 3. Optionally, set max height (if supported by the test runner)
  // This is a placeholder; actual enforcement of max height may depend on Figma/plugin support.
  // If not supported, this step can be omitted or left as a comment.
  // Example (uncomment if supported):
  // await runStep({
  //   ws, channel,
  //   command: "set_node_prop",
  //   params: { nodeId: frameId, maxHeight: 540 },
  //   assert: r => r && r.nodeId === frameId,
  //   label: "Set max height to 540px"
  // });

  return {
    ...frameResult,
    layoutResult
  };
}

/**
 * Creates the progress bar container frame as specified:
 * - Vertical auto-layout
 * - Alignment: Top-center
 * - Fill width, hug (AUTO) height
 * - Transparent background
 * - Name: progress-bar-container
 * - Parent: progress-section-frame
 * - Effect: NEON_GLOW (not implemented yet, see comment below)
 * @param {string} parentId - The progress section frame ID
 * @returns {Promise} Test result with frame creation status
 */
async function create_progress_bar_container_frame(parentId) {
  // 1. Create the frame
  const params = {
    x: 0,
    y: 0,
    name: "progress-bar-container",
    fillColor: { r: 1, g: 1, b: 1, a: 0 }, // transparent
    parentId
  };
  const frameResult = await runStep({
    ws, channel,
    command: "create_frame",
    params: { frame: params },
    assert: (response) => ({
      pass: (Array.isArray(response.ids) && response.ids.length > 0) || typeof response.id === "string",
      response
    }),
    label: `create_progress_bar_container_frame (${params.name})`
  });

  const frameId = frameResult.response?.ids?.[0];
  if (!frameId) return frameResult;

  // 2. Set vertical auto-layout, alignment top-center, fill width, hug height
  const layoutParams = {
    layout: {
      nodeId: frameId,
      mode: "VERTICAL",
      primaryAxisAlignItems: "CENTER",      // center horizontally
      counterAxisAlignItems: "MIN",         // top vertically
      primaryAxisSizing: "AUTO",            // vertical: hug contents
      counterAxisSizing: "FILL"             // horizontal: fill width
    }
  };
  const layoutResult = await runStep({
    ws, channel,
    command: "set_auto_layout",
    params: layoutParams,
    assert: (response) => ({
      pass: response && response["0"] && response["0"].success === true && response["0"].nodeId === frameId,
      response
    }),
    label: `set_auto_layout on progress-bar-container`
  });

  // 3. TODO: Add NEON_GLOW effect here in the future (test first in figma, ask pplx for neon glow params, or use neonglow from layout-a)

  return {
    ...frameResult,
    layoutResult
  };
}

/**
 * Creates the progress indicators label container and its labels:
 * - Auto-layout: Horizontal
 * - Fill width, hug height
 * - Name: progress-indicators-label-container
 * - Parent: progress-bar-container
 * 
 * Also creates 5 child labels ("0", "25", "50", "75", "100"):
 * - Font: 12px, dark gray
 * - Fill width, hug height
 * - Name: progress-indicator-label
 * - Parent: progress-indicators-label-container
 * 
 * @param {string} parentId - The progress-bar-container frame ID
 * @returns {Promise} Test result with container and label creation status
 */
async function create_progress_indicators_label_container(parentId) {
  // 1. Create the label container frame
  const params = {
    x: 0,
    y: 0,
    name: "progress-indicators-label-container",
    parentId
  };
  const containerResult = await runStep({
    ws, channel,
    command: "create_frame",
    params: { frame: params },
    assert: (response) => ({
      pass: (Array.isArray(response.ids) && response.ids.length > 0) || typeof response.id === "string",
      response
    }),
    label: `create_progress_indicators_label_container (${params.name})`
  });

  const containerId = containerResult.response?.ids?.[0];
  if (!containerId) return containerResult;

  // 2. Set horizontal auto-layout, fill width, hug height
  const layoutParams = {
    layout: {
      nodeId: containerId,
      mode: "HORIZONTAL",
      primaryAxisSizing: "AUTO",      // horizontal: hug contents
      counterAxisSizing: "FILL"       // vertical: fill width
    }
  };
  const layoutResult = await runStep({
    ws, channel,
    command: "set_auto_layout",
    params: layoutParams,
    assert: (response) => ({
      pass: response && response["0"] && response["0"].success === true && response["0"].nodeId === containerId,
      response
    }),
    label: `set_auto_layout on progress-indicators-label-container`
  });

  // 3. Create the 5 labels
  const labelValues = ["0", "25", "50", "75", "100"];
  const labelResults = [];
  for (const value of labelValues) {
    const labelParams = {
      x: 0,
      y: 0,
      text: value,
      fontSize: 12,
      fontColor: { r: 0.2, g: 0.2, b: 0.2, a: 1 }, // dark gray
      name: "progress-indicator-label",
      parentId: containerId
    };
    const labelResult = await runStep({
      ws, channel,
      command: "set_text",
      params: { text: labelParams },
      assert: (response) => ({
        pass: (Array.isArray(response.ids) && response.ids.length > 0) || typeof response.id === "string",
        response
      }),
      label: `create_progress_indicator_label (${value})`
    });
    labelResults.push(labelResult);
  }

  return {
    containerResult,
    layoutResult,
    labelResults
  };
}

/**
 * Creates the progress indicators container and its bars:
 * - Auto-layout: Horizontal
 * - Spacing: 12px between elements
 * - Fill width, hug height
 * - Name: progress-indicators-container
 * - Parent: progress-bar-container
 * 
 * Also creates 24 child bars:
 * - First 12: #CCFF00, last 12: #404040
 * - 12px width × 32px height (fixed)
 * - Corner radius: 12px
 * - Name: progress-bar-element
 * - Parent: progress-indicators-container
 * 
 * @param {string} parentId - The progress-bar-container frame ID
 * @returns {Promise} Test result with container and bar creation status
 */
async function create_progress_indicators_container(parentId) {
  // 1. Create the indicators container frame
  const params = {
    x: 0,
    y: 0,
    name: "progress-indicators-container",
    parentId
  };
  const containerResult = await runStep({
    ws, channel,
    command: "create_frame",
    params: { frame: params },
    assert: (response) => ({
      pass: (Array.isArray(response.ids) && response.ids.length > 0) || typeof response.id === "string",
      response
    }),
    label: `create_progress_indicators_container (${params.name})`
  });

  const containerId = containerResult.response?.ids?.[0];
  if (!containerId) return containerResult;

  // 2. Set horizontal auto-layout, 12px spacing, fill width, hug height
  const layoutParams = {
    layout: {
      nodeId: containerId,
      mode: "HORIZONTAL",
      itemSpacing: 12,
      primaryAxisSizing: "AUTO",      // horizontal: hug contents
      counterAxisSizing: "FILL"       // vertical: fill width
    }
  };
  const layoutResult = await runStep({
    ws, channel,
    command: "set_auto_layout",
    params: layoutParams,
    assert: (response) => ({
      pass: response && response["0"] && response["0"].success === true && response["0"].nodeId === containerId,
      response
    }),
    label: `set_auto_layout on progress-indicators-container`
  });

  // 3. Create the 24 bars
  const barResults = [];
  for (let i = 0; i < 24; i++) {
    const fillColor = i < 12
      ? { r: 0.8, g: 1, b: 0, a: 1 } // #CCFF00
      : { r: 0.25, g: 0.25, b: 0.25, a: 1 }; // #404040
    const barParams = {
      x: 0,
      y: 0,
      width: 12,
      height: 32,
      cornerRadius: 12,
      fillColor,
      name: "progress-bar-element",
      parentId: containerId
    };
    const barResult = await runStep({
      ws, channel,
      command: "create_rectangle",
      params: { rectangle: barParams },
      assert: (response) => ({
        pass: (Array.isArray(response.ids) && response.ids.length > 0) || typeof response.id === "string",
        response
      }),
      label: `create_progress_bar_element (${i + 1})`
    });
    barResults.push(barResult);
  }

  return {
    containerResult,
    layoutResult,
    barResults
  };
}

/**
 * Creates the progress section frame as specified:
 * - Vertical auto-layout
 * - 12px spacing between elements
 * - Transparent background
 * - 16px padding (all sides)
 * - Corner radius: 16px
 * - Border: 2px solid gray (#333333)
 * - Horizontal resizing: FILL
 * - Vertical resizing: AUTO (hug)
 * - Name: progress-section-frame
 * - Parent: main-container-frame
 * @param {string} parentId - The main container frame ID
 * @returns {Promise} Test result with frame creation status
 */
async function create_progress_section_frame(parentId) {
  // 1. Create the frame
  const params = {
    x: 0,
    y: 0,
    // width is not set, will be set to FILL by auto-layout resizing
    // height is not set, so it can hug contents (vertical "AUTO")
    name: "progress-section-frame",
    fillColor: { r: 1, g: 1, b: 1, a: 0 }, // transparent
    cornerRadius: 16,
    strokeColor: { r: 0.2, g: 0.2, b: 0.2, a: 1 }, // #333333
    strokeWeight: 2,
    parentId
  };
  const frameResult = await runStep({
    ws, channel,
    command: "create_frame",
    params: { frame: params },
    assert: (response) => ({
      pass: (Array.isArray(response.ids) && response.ids.length > 0) || typeof response.id === "string",
      response
    }),
    label: `create_progress_section_frame (${params.name})`
  });

  const frameId = frameResult.response?.ids?.[0];
  if (!frameId) return frameResult;

  // 2. Set vertical auto-layout, padding 16, spacing 12, sizing modes
  const layoutParams = {
    layout: {
      nodeId: frameId,
      mode: "VERTICAL",
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 16,
      paddingBottom: 16,
      itemSpacing: 12,
      primaryAxisSizing: "AUTO",      // vertical: hug contents
      counterAxisSizing: "FILL"       // horizontal: fill
    }
  };
  const layoutResult = await runStep({
    ws, channel,
    command: "set_auto_layout",
    params: layoutParams,
    assert: (response) => ({
      pass: response && response["0"] && response["0"].success === true && response["0"].nodeId === frameId,
      response
    }),
    label: `set_auto_layout on progress-section-frame`
  });

  return {
    ...frameResult,
    layoutResult
  };
}

/**
 * Main entry point for the layout-b test.
 * Creates the main container frame and progress section frame.
 * @param {Array} results - Array to collect test results
 * @param {string} [parentFrameId] - Optional parent frame ID
 */
export async function layoutBTest(results, parentFrameId) {
  // 1. Create main container
  const frameResult = await create_main_container_frame(parentFrameId);
  results.push(frameResult);
  const mainContainerFrameId = frameResult.response?.ids?.[0];

  // 2. Create progress section
  let progressSectionFrameId;
  if (mainContainerFrameId) {
    const progressSectionResult = await create_progress_section_frame(mainContainerFrameId);
    results.push(progressSectionResult);
    progressSectionFrameId = progressSectionResult.response?.ids?.[0];
  }

  // 3. Create progress bar container
  if (progressSectionFrameId) {
    const progressBarContainerResult = await create_progress_bar_container_frame(progressSectionFrameId);
    results.push(progressBarContainerResult);
  }

  // 4. Create progress indicators label container  
  let progressBarContainerId;
  if (progressSectionFrameId) {
    const progressBarContainerResult = await create_progress_bar_container_frame(progressSectionFrameId);
    results.push(progressBarContainerResult);
    progressBarContainerId = progressBarContainerResult.response?.ids?.[0];
  }

  // 5. Add progress indicator labels

  if (progressBarContainerId) {
    const labelContainerResult = await create_progress_indicators_label_container(progressBarContainerId);
    results.push(labelContainerResult);
  }

  // 6. Add progress indicators container and bars
  if (progressBarContainerId) {
    const indicatorsContainerResult = await create_progress_indicators_container(progressBarContainerId);
    results.push(indicatorsContainerResult);
  }
}
