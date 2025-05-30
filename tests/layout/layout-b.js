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
  const params = {
    x: 0,
    y: 0,
    width: 400,
    height: 540,
    name: "main-container-frame",
    fillColor: { r: 0.0, g: 0.0, b: 0.0, a: 1 },
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

  const layoutParams = {
    layout: {
      nodeId: frameId,
      mode: "VERTICAL",
      paddingLeft: 24,
      paddingRight: 24,
      paddingTop: 24,
      paddingBottom: 24,
      itemSpacing: 20,
      // primaryAxisSizing: "AUTO",
      // counterAxisSizing: "FIXED"
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

  // 3. Set auto layout resizing: horizontal FILL, vertical AUTO (hug)
  const resizingResult = await runStep({
    ws, channel,
    command: "set_auto_layout_resizing",
    params: {
      nodeId: frameId,
      horizontal: "FIXED",
      vertical: "AUTO"
    },
    assert: (response) => ({
      pass: response && response.nodeId === frameId,
      response
    }),
    label: "set_auto_layout_resizing on progress-section-frame"
  });

  return {
    ...frameResult,
    layoutResult,
    resizingResult
  };
}

// has progress and pledge goal

async function create_progress_section_frame(parentId) {
  const params = {
    x: 0,
    y: 0,
    name: "progress-section-frame",
    fillColor: { r: 1, g: 0, b: 0, a: 0.2 },
    cornerRadius: 16,
    strokeColor: { r: 0.2, g: 0.2, b: 0.2, a: 1 },
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

  const layoutParams = {
    layout: {
      nodeId: frameId,
      mode: "VERTICAL",
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 16,
      paddingBottom: 16,
      itemSpacing: 12,
      primaryAxisAlignItems: "MIN", // sets vertical align to top
      counterAxisAlignItems: "CENTER" // centers content horizontally
      // primaryAxisSizing: "AUTO", // ⚠️️ do not uncomment this
      // counterAxisSizing: "FILL"  // ⚠️️ do not uncomment this
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

  // 3. Set auto layout resizing: horizontal FILL, vertical AUTO (hug)
  const resizingResult = await runStep({
    ws, channel,
    command: "set_auto_layout_resizing",
    params: {
      nodeId: frameId,
      horizontal: "FILL",
      vertical: "AUTO"
    },
    assert: (response) => ({
      pass: response && response.nodeId === frameId,
      response
    }),
    label: "set_auto_layout_resizing on progress-section-frame"
  });

  return {
    ...frameResult,
    layoutResult,
    resizingResult
  };
}

// has progress indicators and current pledge goal text

async function create_progress_bar_container_frame(parentId) {
  const params = {
    x: 0,
    y: 0,
    name: "progress-bar-container",
    fillColor: { r: 0, g: 1, b: 0, a: 0.2 }, 
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

  const layoutParams = {
    layout: {
      nodeId: frameId,
      mode: "VERTICAL",
      primaryAxisAlignItems: "MIN", // top align
      counterAxisAlignItems: "CENTER", // center horizontally
      // primaryAxisSizing: "AUTO",  // ⚠️️ do not uncomment this
      // counterAxisSizing: "FILL"  // ⚠️️ do not uncomment this
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

  const resizingResult = await runStep({
    ws, channel,
    command: "set_auto_layout_resizing",
    params: {
      nodeId: frameId,
      horizontal: "AUTO", // was fill
      vertical: "AUTO"
    },
    assert: (response) => ({
      pass: response && response.nodeId === frameId,
      response
    }),
    label: "set_auto_layout_resizing on progress-bar-container"
  });

  return {
    ...frameResult,
    layoutResult,
    resizingResult
  };
}

// container for the labels

async function create_progress_indicators_label_container(parentId) {
  const params = {
    x: 0,
    y: 0,
    fillColor: { r: 1, g: 1, b: 1, a: 0.0 }, // transperant color
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

  const layoutParams = {
    layout: {
      nodeId: containerId,
      mode: "HORIZONTAL",
      // itemSpacing: "AUTO", // ⚠️️ Auto cant be set. so we ue space_between instead
      primaryAxisAlignItems: "SPACE_BETWEEN", // spacing functionality is achieved through the primaryAxisAlignItems property configured to  'SPACE_BETWEEN'
      // primaryAxisSizing: "AUTO", // ⚠️️ do not uncomment this
      // counterAxisSizing: "FILL" // ⚠️️ do not uncomment this
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

  const resizingResult = await runStep({
    ws, channel,
    command: "set_auto_layout_resizing",
    params: {
      nodeId: containerId,
      horizontal: "FILL", 
      vertical: "AUTO"
    },
    assert: (response) => ({
      pass: response && response.nodeId === frameId,
      response
    }),
    label: "set_auto_layout_resizing on progress-indicators-label-container"
  });

  // Use the new helper for each label
  const labelValues = ["0", "25", "50", "75", "100"];
  const labelResults = [];
  for (const value of labelValues) {
    const labelResult = await create_progress_indicator_label(containerId, value);
    labelResults.push(labelResult);
  }

  return {
    containerResult,
    layoutResult,
    resizingResult,
    labelResults
  };
}


/**
 * Creates a progress-indicator-label text node and sets it to fill horizontally.
 * @param {string} parentId - The parent container ID
 * @param {string} value - The text value ("0", "25", etc.)
 * @returns {Promise} Test result with text creation and resizing status
 */
async function create_progress_indicator_label(parentId, value) {
  // 1. Create the text node
  const textParams = {
    x: 0,
    y: 0,
    text: value,
    fontSize: 12,
    fontColor: { r: 0.8, g: 0.8, b: 0.8, a: 0.4 },
    name: "progress-indicator-label",
    parentId
  };
  const textResult = await runStep({
    ws, channel,
    command: "set_text",
    params: { text: textParams },
    assert: (response) => ({
      pass: (Array.isArray(response.ids) && response.ids.length > 0) || typeof response.id === "string",
      response
    }),
    label: `create_progress_indicator_label (${value})`
  });

  const textId = textResult.response?.id || (textResult.response?.ids && textResult.response.ids[0]);
  if (!textId) return textResult;

  // 2. Set auto layout resizing: horizontal FILL
  // const resizingResult = await runStep({
  //   ws, channel,
  //   command: "set_auto_layout_resizing",
  //   params: {
  //     nodeId: textId,
  //     axis: "horizontal",
  //     mode: "FILL"
  //   },
  //   assert: r => r && r.nodeId === textId,
  //   label: "Set text to fill horizontally"
  // });

  return {
    textResult,
   // resizingResult
  };
}

// container for progress bars

async function create_progress_indicators_container(parentId) {
  const params = {
    x: 0,
    y: 0,
    name: "progress-indicators-container",
    fillColor: { r: 0, g: 0, b: 1, a: 0.2 }, // transperant color
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

  const layoutParams = {
    layout: {
      nodeId: containerId,
      mode: "HORIZONTAL",
      itemSpacing: 8,
     //  primaryAxisSizing: "AUTO",  // ⚠️️ do not uncomment this
      // counterAxisSizing: "FILL"  // ⚠️️ do not uncomment this
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

  const resizingResult = await runStep({
    ws, channel,
    command: "set_auto_layout_resizing",
    params: {
      nodeId: containerId,
      horizontal: "FILL",
      vertical: "AUTO"
    },
    assert: (response) => ({
      pass: response && response.nodeId === frameId,
      response
    }),
    label: "set_auto_layout_resizing on progress-indicators-container"
  });

  const barResults = [];
  for (let i = 0; i < 24; i++) {
    const fillColor = i < 12
      ? { r: 0.8, g: 1, b: 0, a: 1 }
      : { r: 0.25, g: 0.25, b: 0.25, a: 1 };
    const barResult = await create_progress_bar_element_rectangle(containerId, fillColor);
    barResults.push(barResult);
  }

  return {
    containerResult,
    layoutResult,
    resizingResult,
    barResults
  };
}

/**
 * Creates a progress bar element rectangle.
 * @param {string} parentId - The parent container ID
 * @param {object} fillColor - The fill color object
 * @returns {Promise} Test result with rectangle creation status
 */
async function create_progress_bar_element_rectangle(parentId, fillColor) {
  const barParams = {
    x: 0,
    y: 0,
    width: 6,
    height: 42,
    cornerRadius: 6,
    fillColor,
    name: "progress-bar-element",
    parentId
  };
  const barResult = await runStep({
    ws, channel,
    command: "create_rectangle",
    params: { rectangle: barParams },
    assert: (response) => ({
      pass: (Array.isArray(response.ids) && response.ids.length > 0) || typeof response.id === "string",
      response
    }),
    label: `create_progress_bar_element`
  });
  return barResult;
}

/**
 * Main entry point for the layout-b test.
 * Creates the main container frame and all children in strict sequence.
 * @param {Array} results - Array to collect test results
 * @param {string} [parentFrameId] - Optional parent frame ID
 */
export async function layoutBTest(results, parentFrameId) {
  // 1. Create main container
  const mainResult = await create_main_container_frame(parentFrameId);
  results.push(mainResult);
  const mainContainerFrameId = mainResult.response?.ids?.[0];
  if (!mainContainerFrameId) return;

  // 2. Create progress section
   const sectionResult = await create_progress_section_frame(mainContainerFrameId);
   results.push(sectionResult);
   const progressSectionFrameId = sectionResult.response?.ids?.[0];
   if (!progressSectionFrameId) return;
 
   // 3. Create progress bar container
   const barContainerResult = await create_progress_bar_container_frame(progressSectionFrameId);
   results.push(barContainerResult);
   const progressBarContainerId = barContainerResult.response?.ids?.[0];
   if (!progressBarContainerId) return;

   // 4. Add progress indicator labels
  const labelContainerResult = await create_progress_indicators_label_container(progressBarContainerId);
  results.push(labelContainerResult);

  // // 5. Add progress indicators container and bars
  const indicatorsContainerResult = await create_progress_indicators_container(progressBarContainerId);
  results.push(indicatorsContainerResult);
}
