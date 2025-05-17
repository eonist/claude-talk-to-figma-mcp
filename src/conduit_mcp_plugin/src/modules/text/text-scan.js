import { generateCommandId } from "../utils.js";
import { sendProgressUpdate, delay } from "./text-helpers.js";

/**
 * Scanning and analysis functions for text nodes.
 * Exports: scanTextNodes, getStyledTextSegments, findTextNodes, collectNodesToProcess, processTextNode
 */

/**
 * Scan text nodes within a specified parent node.
 */
export async function scanTextNodes(params) {
  console.log(`Starting to scan text nodes from node ID: ${params.nodeId}`);
  const { nodeId, useChunking = true, chunkSize = 10, commandId = generateCommandId() } = params || {};
  
  const node = await figma.getNodeByIdAsync(nodeId);

  if (!node) {
    console.error(`Node with ID ${nodeId} not found`);
    sendProgressUpdate(
      commandId,
      'scan_text_nodes',
      'error',
      0,
      0,
      0,
      `Node with ID ${nodeId} not found`,
      { error: `Node not found: ${nodeId}` }
    );
    throw new Error(`Node with ID ${nodeId} not found`);
  }

  if (!useChunking) {
    const textNodes = [];
    try {
      sendProgressUpdate(
        commandId,
        'scan_text_nodes',
        'started',
        0,
        1,
        0,
        `Starting scan of node "${node.name || nodeId}" without chunking`,
        null
      );

      await findTextNodes(node, [], 0, textNodes);
      
      sendProgressUpdate(
        commandId,
        'scan_text_nodes',
        'completed',
        100,
        textNodes.length,
        textNodes.length,
        `Scan complete. Found ${textNodes.length} text nodes.`,
        { textNodes }
      );

      return {
        success: true,
        message: `Scanned ${textNodes.length} text nodes.`,
        count: textNodes.length,
        textNodes: textNodes, 
        commandId
      };
    } catch (error) {
      console.error("Error scanning text nodes:", error);
      sendProgressUpdate(
        commandId,
        'scan_text_nodes',
        'error',
        0,
        0,
        0,
        `Error scanning text nodes: ${error.message}`,
        { error: error.message }
      );
      throw new Error(`Error scanning text nodes: ${error.message}`);
    }
  }
  
  // Chunked implementation
  const nodesToProcess = [];
  sendProgressUpdate(
    commandId,
    'scan_text_nodes',
    'started',
    0,
    0,
    0,
    `Starting chunked scan of node "${node.name || nodeId}"`,
    { chunkSize }
  );
  await collectNodesToProcess(node, [], 0, nodesToProcess);
  const totalNodes = nodesToProcess.length;
  const totalChunks = Math.ceil(totalNodes / chunkSize);
  sendProgressUpdate(
    commandId,
    'scan_text_nodes',
    'in_progress',
    5,
    totalNodes,
    0,
    `Found ${totalNodes} nodes to scan. Will process in ${totalChunks} chunks.`,
    {
      totalNodes,
      totalChunks,
      chunkSize
    }
  );
  const allTextNodes = [];
  let processedNodes = 0;
  let chunksProcessed = 0;
  for (let i = 0; i < totalNodes; i += chunkSize) {
    const chunkEnd = Math.min(i + chunkSize, totalNodes);
    sendProgressUpdate(
      commandId,
      'scan_text_nodes',
      'in_progress',
      Math.round(5 + ((chunksProcessed / totalChunks) * 90)),
      totalNodes,
      processedNodes,
      `Processing chunk ${chunksProcessed + 1}/${totalChunks}`,
      {
        currentChunk: chunksProcessed + 1,
        totalChunks,
        textNodesFound: allTextNodes.length
      }
    );
    const chunkNodes = nodesToProcess.slice(i, chunkEnd);
    const chunkTextNodes = [];
    for (const nodeInfo of chunkNodes) {
      if (nodeInfo.node.type === "TEXT") {
        try {
          const textNodeInfo = await processTextNode(nodeInfo.node, nodeInfo.parentPath, nodeInfo.depth);
          if (textNodeInfo) {
            chunkTextNodes.push(textNodeInfo);
          }
        } catch (error) {
          console.error(`Error processing text node: ${error.message}`);
        }
      }
      await delay(5);
    }
    allTextNodes.push(...chunkTextNodes);
    processedNodes += chunkNodes.length;
    chunksProcessed++;
    sendProgressUpdate(
      commandId,
      'scan_text_nodes',
      'in_progress',
      Math.round(5 + ((chunksProcessed / totalChunks) * 90)),
      totalNodes,
      processedNodes,
      `Processed chunk ${chunksProcessed}/${totalChunks}. Found ${allTextNodes.length} text nodes so far.`,
      {
        currentChunk: chunksProcessed,
        totalChunks,
        processedNodes,
        textNodesFound: allTextNodes.length,
        chunkResult: chunkTextNodes
      }
    );
    if (i + chunkSize < totalNodes) {
      await delay(50);
    }
  }
  sendProgressUpdate(
    commandId,
    'scan_text_nodes',
    'completed',
    100,
    totalNodes,
    processedNodes,
    `Scan complete. Found ${allTextNodes.length} text nodes.`,
    {
      textNodes: allTextNodes,
      processedNodes,
      chunks: chunksProcessed
    }
  );
  return {
    success: true,
    message: `Chunked scan complete. Found ${allTextNodes.length} text nodes.`,
    totalNodes: totalNodes,
    processedNodes: processedNodes,
    chunks: chunksProcessed,
    textNodes: allTextNodes,
    commandId
  };
}

export async function getStyledTextSegments(params) {
  const { nodeId, property } = params || {};
  if (!nodeId) throw new Error("Missing nodeId parameter");
  if (!property) throw new Error("Missing property parameter");
  const validProperties = ["fillStyleId", "fontName", "fontSize", "textCase", 
    "textDecoration", "textStyleId", "fills", "letterSpacing", "lineHeight", "fontWeight"];
  if (!validProperties.includes(property)) {
    throw new Error(`Invalid property: must be one of ${validProperties.join(", ")}`);
  }
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found with ID: ${nodeId}`);
  if (node.type !== "TEXT") throw new Error(`Node is not a text node: ${nodeId}`);
  try {
    await figma.loadFontAsync(node.fontName);
    const text = node.characters;
    let styleRanges = [];
    if (property === "fontWeight") {
      const ranges = node.getStyledTextSegments(['fontName']);
      styleRanges = ranges.map(range => {
        let weight = 400;
        const style = range.fontName.style;
        if (/thin/i.test(style)) weight = 100;
        else if (/extra\s*light/i.test(style)) weight = 200;
        else if (/light/i.test(style)) weight = 300;
        else if (/regular/i.test(style)) weight = 400;
        else if (/medium/i.test(style)) weight = 500;
        else if (/semi\s*bold/i.test(style)) weight = 600;
        else if (/bold/i.test(style)) weight = 700;
        else if (/extra\s*bold/i.test(style)) weight = 800;
        else if (/black/i.test(style)) weight = 900;
        return {
          characters: range.characters,
          start: range.start,
          end: range.end,
          fontWeight: weight
        };
      });
    } else {
      styleRanges = node.getStyledTextSegments([property]).map(range => {
        const result = {
          characters: range.characters,
          start: range.start,
          end: range.end
        };
        result[property] = range[property];
        return result;
      });
    }
    return {
      id: node.id,
      name: node.name,
      characters: text,
      property: property,
      segments: styleRanges
    };
  } catch (error) {
    throw new Error(`Error getting styled text segments: ${error.message}`);
  }
}

export async function findTextNodes(node, parentPath = [], depth = 0, textNodes = []) {
  if (node.visible === false) return;
  const nodePath = [...parentPath, node.name || `Unnamed ${node.type}`];
  if (node.type === "TEXT") {
    try {
      let fontFamily = "";
      let fontStyle = "";
      if (node.fontName) {
        if (typeof node.fontName === "object") {
          if ("family" in node.fontName) fontFamily = node.fontName.family;
          if ("style" in node.fontName) fontStyle = node.fontName.style;
        }
      }
      const safeTextNode = {
        id: node.id,
        name: node.name || "Text",
        type: node.type,
        characters: node.characters,
        fontSize: typeof node.fontSize === "number" ? node.fontSize : 0,
        fontFamily: fontFamily,
        fontStyle: fontStyle,
        x: typeof node.x === "number" ? node.x : 0,
        y: typeof node.y === "number" ? node.y : 0,
        width: typeof node.width === "number" ? node.width : 0,
        height: typeof node.height === "number" ? node.height : 0,
        path: nodePath.join(" > "),
        depth: depth,
      };
      try {
        const originalFills = JSON.parse(JSON.stringify(node.fills));
        node.fills = [
          {
            type: "SOLID",
            color: { r: 1, g: 0.5, b: 0 },
            opacity: 0.3,
          },
        ];
        await delay(500);
        try {
          node.fills = originalFills;
        } catch (err) {
          console.error("Error resetting fills:", err);
        }
      } catch (highlightErr) {
        console.error("Error highlighting text node:", highlightErr);
      }
      textNodes.push(safeTextNode);
    } catch (nodeErr) {
      console.error("Error processing text node:", nodeErr);
    }
  }
  if ("children" in node) {
    for (const child of node.children) {
      await findTextNodes(child, nodePath, depth + 1, textNodes);
    }
  }
}

export async function collectNodesToProcess(node, parentPath = [], depth = 0, nodesToProcess = []) {
  if (node.visible === false) return;
  const nodePath = [...parentPath, node.name || `Unnamed ${node.type}`];
  nodesToProcess.push({
    node: node,
    parentPath: nodePath,
    depth: depth
  });
  if ("children" in node) {
    for (const child of node.children) {
      await collectNodesToProcess(child, nodePath, depth + 1, nodesToProcess);
    }
  }
}

export async function processTextNode(node, parentPath, depth) {
  if (node.type !== "TEXT") return null;
  try {
    let fontFamily = "";
    let fontStyle = "";
    if (node.fontName) {
      if (typeof node.fontName === "object") {
        if ("family" in node.fontName) fontFamily = node.fontName.family;
        if ("style" in node.fontName) fontStyle = node.fontName.style;
      }
    }
    const safeTextNode = {
      id: node.id,
      name: node.name || "Text",
      type: node.type,
      characters: node.characters,
      fontSize: typeof node.fontSize === "number" ? node.fontSize : 0,
      fontFamily: fontFamily,
      fontStyle: fontStyle,
      x: typeof node.x === "number" ? node.x : 0,
      y: typeof node.y === "number" ? node.y : 0,
      width: typeof node.width === "number" ? node.width : 0,
      height: typeof node.height === "number" ? node.height : 0,
      path: parentPath.join(" > "),
      depth: depth,
    };
    try {
      const originalFills = JSON.parse(JSON.stringify(node.fills));
      node.fills = [
        {
          type: "SOLID",
          color: { r: 1, g: 0.5, b: 0 },
          opacity: 0.3,
        },
      ];
      await delay(100);
      try {
        node.fills = originalFills;
      } catch (err) {
        console.error("Error resetting fills:", err);
      }
    } catch (highlightErr) {
      console.error("Error highlighting text node:", highlightErr);
    }
    return safeTextNode;
  } catch (nodeErr) {
    console.error("Error processing text node:", nodeErr);
    return null;
  }
}

export {
  scanTextNodes,
  getStyledTextSegments,
  findTextNodes,
  collectNodesToProcess,
  processTextNode
};
