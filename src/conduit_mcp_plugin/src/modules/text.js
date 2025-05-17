/**
 * Text operations module.
 * Provides functions for creating, modifying, and scanning text nodes in Figma via MCP.
 *
 * Exposed functions:
 * - createText(params)
 * - createBoundedText(params)
 * - setTextContent(params)
 * - scanTextNodes(params)
 * - setMultipleTextContents(params)
 * - createText(params)
 * - createBoundedText(params)
 * - setTextContent(params)
 * - scanTextNodes(params)
 * - setMultipleTextContents(params)
 * - setTextCase(params)
 * - setTextDecoration(params)
 * - getStyledTextSegments(params)
 *
 * @module modules/text
 * @example
 * import { textOperations } from './modules/text.js';
 * const result = await textOperations.createText({ x: 0, y: 0, text: 'Hello' });
 * console.log('Created text node ID:', result.id);
 */

/**
 * Text operations module.
 * Provides functions for creating, modifying, and scanning text nodes in Figma via MCP.
 *
 * Exposed functions:
 * - sendProgressUpdate(commandId, commandType, status, progress, totalItems, processedItems, message, payload?): object
 * - delay(ms): Promise<void>
 * - createText(params): Promise<object>
 * - createBoundedText(params): Promise<object>
 * - setTextContent(params): Promise<object>
 * - scanTextNodes(params): Promise<object>
 * - setMultipleTextContents(params): Promise<object>
 * - setTextCase(params): Promise<object>
 * - setTextDecoration(params): Promise<object>
 * - getStyledTextSegments(params): Promise<object>
 *
 * @example
 * import { textOperations } from './modules/text.js';
 * const result = await textOperations.createText({ x:0, y:0, text: 'Hello' });
 * console.log('Created text node ID:', result.id);
 */
import { generateCommandId, setCharacters, canAcceptChildren } from './utils.js';
import { createText, createBoundedText, createTexts } from './text/text-create.js';
import { setTextContent, setMultipleTextContents, setTextCase, setTextDecoration } from './text/text-edit.js';
import { scanTextNodes, getStyledTextSegments, findTextNodes, collectNodesToProcess, processTextNode } from './text/text-scan.js';
import { sendProgressUpdate, delay } from './text/text-helpers.js';

/**
 * Create a new text node in the Figma document.
 *
 * This asynchronous function creates a text node at specified x,y coordinates,
 * applies fonts and colors, and appends it to the given parent node if provided.
 *
 * @param {object} params - Object containing text node configuration.
 * @param {number} [params.x=0] - Horizontal coordinate for the text node.
 * @param {number} [params.y=0] - Vertical coordinate for the text node.
 * @param {string} [params.text="Text"] - The text content to display.
 * @param {number} [params.fontSize=14] - Font size in pixels.
 * @param {number} [params.fontWeight=400] - Numeric font weight (commonly 100-900).
 * @param {object} [params.fontColor={r:0, g:0, b:0, a:1}] - RGBA font color.
 * @param {string} [params.name="Text"] - Node name.
 * @param {string} [params.parentId] - ID of the parent node for appending the text node.
 *
 * @returns {Promise<object>} Details of the created text node.
 * @throws {Error} When the parent node is not found or cannot have child nodes.
 */


/**
 * Scan text nodes within a specified parent node.
 *
 * This function scans for all text nodes under the given node ID. It includes options
 * for chunked processing for performance considerations with progress reporting.
 *
 * @param {object} params - Parameters for scanning.
 * @param {string} params.nodeId - ID of the parent node to scan.
 * @param {boolean} [params.useChunking=true] - Whether to process nodes in chunks.
 * @param {number} [params.chunkSize=10] - Number of nodes per chunk.
 * @param {string} [params.commandId] - Optional identifier for progress tracking.
 *
 * @returns {Promise<object>} Result object with metadata about the scan.
 * @throws {Error} If scanning fails or the parent node is not found.
 */
export async function scanTextNodes(params) {
  console.log(`Starting to scan text nodes from node ID: ${params.nodeId}`);
  const { nodeId, useChunking = true, chunkSize = 10, commandId = generateCommandId() } = params || {};
  
  const node = await figma.getNodeByIdAsync(nodeId);

  if (!node) {
    console.error(`Node with ID ${nodeId} not found`);
    // Send error progress update
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

  // If chunking is not enabled, use the original implementation
  if (!useChunking) {
    const textNodes = [];
    try {
      // Send started progress update
      sendProgressUpdate(
        commandId,
        'scan_text_nodes',
        'started',
        0,
        1, // Not known yet how many nodes there are
        0,
        `Starting scan of node "${node.name || nodeId}" without chunking`,
        null
      );

      await findTextNodes(node, [], 0, textNodes);
      
      // Send completed progress update
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
      
      // Send error progress update
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
  console.log(`Using chunked scanning with chunk size: ${chunkSize}`);
  
  // First, collect all nodes to process (without processing them yet)
  const nodesToProcess = [];
  
  // Send started progress update
  sendProgressUpdate(
    commandId,
    'scan_text_nodes',
    'started',
    0,
    0, // Not known yet how many nodes there are
    0,
    `Starting chunked scan of node "${node.name || nodeId}"`,
    { chunkSize }
  );
  
  await collectNodesToProcess(node, [], 0, nodesToProcess);
  
  const totalNodes = nodesToProcess.length;
  console.log(`Found ${totalNodes} total nodes to process`);
  
  // Calculate number of chunks needed
  const totalChunks = Math.ceil(totalNodes / chunkSize);
  console.log(`Will process in ${totalChunks} chunks`);
  
  // Send update after node collection
  sendProgressUpdate(
    commandId,
    'scan_text_nodes',
    'in_progress',
    5, // 5% progress for collection phase
    totalNodes,
    0,
    `Found ${totalNodes} nodes to scan. Will process in ${totalChunks} chunks.`,
    {
      totalNodes,
      totalChunks,
      chunkSize
    }
  );
  
  // Process nodes in chunks
  const allTextNodes = [];
  let processedNodes = 0;
  let chunksProcessed = 0;
  
  for (let i = 0; i < totalNodes; i += chunkSize) {
    const chunkEnd = Math.min(i + chunkSize, totalNodes);
    console.log(`Processing chunk ${chunksProcessed + 1}/${totalChunks} (nodes ${i} to ${chunkEnd - 1})`);
    
    // Send update before processing chunk
    sendProgressUpdate(
      commandId,
      'scan_text_nodes',
      'in_progress',
      Math.round(5 + ((chunksProcessed / totalChunks) * 90)), // 5-95% for processing
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
    
    // Process each node in this chunk
    for (const nodeInfo of chunkNodes) {
      if (nodeInfo.node.type === "TEXT") {
        try {
          const textNodeInfo = await processTextNode(nodeInfo.node, nodeInfo.parentPath, nodeInfo.depth);
          if (textNodeInfo) {
            chunkTextNodes.push(textNodeInfo);
          }
        } catch (error) {
          console.error(`Error processing text node: ${error.message}`);
          // Continue with other nodes
        }
      }
      
      // Brief delay to allow UI updates and prevent freezing
      await delay(5);
    }
    
    // Add results from this chunk
    allTextNodes.push(...chunkTextNodes);
    processedNodes += chunkNodes.length;
    chunksProcessed++;
    
    // Send update after processing chunk
    sendProgressUpdate(
      commandId,
      'scan_text_nodes',
      'in_progress',
      Math.round(5 + ((chunksProcessed / totalChunks) * 90)), // 5-95% for processing
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
    
    // Small delay between chunks to prevent UI freezing
    if (i + chunkSize < totalNodes) {
      await delay(50);
    }
  }
  
  // Send completed progress update
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

/**
 * Recursively collects all nodes to be processed starting from a given node.
 *
 * @param {object} node - The starting node.
 * @param {Array<string>} [parentPath=[]] - The path of parent node names.
 * @param {number} [depth=0] - The current depth in the node tree.
 * @param {Array} [nodesToProcess=[]] - Accumulator array for nodes to process.
 *
 * @returns {Promise<void>}
 */
async function collectNodesToProcess(node, parentPath = [], depth = 0, nodesToProcess = []) {
  // Skip invisible nodes
  if (node.visible === false) return;
  
  // Get the path to this node
  const nodePath = [...parentPath, node.name || `Unnamed ${node.type}`];
  
  // Add this node to the processing list
  nodesToProcess.push({
    node: node,
    parentPath: nodePath,
    depth: depth
  });
  
  // Recursively add children
  if ("children" in node) {
    for (const child of node.children) {
      await collectNodesToProcess(child, nodePath, depth + 1, nodesToProcess);
    }
  }
}

/**
 * Processes a single text node to extract relevant information.
 *
 * @param {object} node - The text node to process.
 * @param {Array<string>} parentPath - The path of parent node names.
 * @param {number} depth - The depth of the node in the tree.
 *
 * @returns {Promise<object|null>} A safe representation of the text node or null if not a text node.
 */
async function processTextNode(node, parentPath, depth) {
  if (node.type !== "TEXT") return null;
  
  try {
    // Safely extract font information
    let fontFamily = "";
    let fontStyle = "";

    if (node.fontName) {
      if (typeof node.fontName === "object") {
        if ("family" in node.fontName) fontFamily = node.fontName.family;
        if ("style" in node.fontName) fontStyle = node.fontName.style;
      }
    }

    // Create a safe representation of the text node
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

    // Highlight the node briefly (optional visual feedback)
    try {
      const originalFills = JSON.parse(JSON.stringify(node.fills));
      node.fills = [
        {
          type: "SOLID",
          color: { r: 1, g: 0.5, b: 0 },
          opacity: 0.3,
        },
      ];

      // Brief delay for the highlight to be visible
      await delay(100);
      
      try {
        node.fills = originalFills;
      } catch (err) {
        console.error("Error resetting fills:", err);
      }
    } catch (highlightErr) {
      console.error("Error highlighting text node:", highlightErr);
      // Continue anyway, highlighting is just visual feedback
    }

    return safeTextNode;
  } catch (nodeErr) {
    console.error("Error processing text node:", nodeErr);
    return null;
  }
}

/**
 * Recursively finds all text nodes within a node.
 *
 * @param {object} node - The node to search.
 * @param {Array<string>} [parentPath=[]] - The path of parent node names.
 * @param {number} [depth=0] - The current depth in the node tree.
 * @param {Array} [textNodes=[]] - Accumulator array for found text nodes.
 *
 * @returns {Promise<void>}
 */
async function findTextNodes(node, parentPath = [], depth = 0, textNodes = []) {
  // Skip invisible nodes
  if (node.visible === false) return;

  // Get the path to this node including its name
  const nodePath = [...parentPath, node.name || `Unnamed ${node.type}`];

  if (node.type === "TEXT") {
    try {
      // Safely extract font information to avoid Symbol serialization issues
      let fontFamily = "";
      let fontStyle = "";

      if (node.fontName) {
        if (typeof node.fontName === "object") {
          if ("family" in node.fontName) fontFamily = node.fontName.family;
          if ("style" in node.fontName) fontStyle = node.fontName.style;
        }
      }

      // Create a safe representation of the text node with only serializable properties
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

      // Only highlight the node if it's not being done via API
      try {
        // Safe way to create a temporary highlight without causing serialization issues
        const originalFills = JSON.parse(JSON.stringify(node.fills));
        node.fills = [
          {
            type: "SOLID",
            color: { r: 1, g: 0.5, b: 0 },
            opacity: 0.3,
          },
        ];

        // Promise-based delay instead of setTimeout
        await delay(500);
        
        try {
          node.fills = originalFills;
        } catch (err) {
          console.error("Error resetting fills:", err);
        }
      } catch (highlightErr) {
        console.error("Error highlighting text node:", highlightErr);
        // Continue anyway, highlighting is just visual feedback
      }

      textNodes.push(safeTextNode);
    } catch (nodeErr) {
      console.error("Error processing text node:", nodeErr);
      // Skip this node but continue with others
    }
  }

  // Recursively process children of container nodes
  if ("children" in node) {
    for (const child of node.children) {
      await findTextNodes(child, nodePath, depth + 1, textNodes);
    }
  }
}

/**
 * Replace text content in multiple text nodes in a batch operation.
 *
 * This function applies text replacements to multiple nodes within a parent node.
 *
 * @param {object} params - Batch operation parameters.
 * @param {string} params.nodeId - ID of the parent node containing text nodes.
 * @param {Array<object>} params.text - Array of text replacement objects.
 * @param {string} [params.commandId] - Optional command identifier for progress.
 *
 * @returns {Promise<object>} Summary of the replacement operation.
 * @throws {Error} If required parameters are missing or invalid.
 */




/**
 * Update the text case of a text node.
 *
 * Changes the case transformation applied to the text content.
 *
 * @param {object} params - Configuration for text case update.
 * @param {string} params.nodeId - ID of the text node.
 * @param {string} params.textCase - New text case ("ORIGINAL", "UPPER", "LOWER", "TITLE").
 *
 * @returns {Promise<object>} Updated node information including text case.
 * @throws {Error} If the node is not found or not a text node.
 */

/**
 * Update the text decoration of a text node.
 *
 * This function sets the decoration style of the text such as underline or strikethrough.
 *
 * @param {object} params - Configuration for text decoration.
 * @param {string} params.nodeId - ID of the text node.
 * @param {string} params.textDecoration - Decoration style ("NONE", "UNDERLINE", "STRIKETHROUGH").
 *
 * @returns {Promise<object>} Updated node information including text decoration.
 * @throws {Error} If the node is not found or not a text node.
 */

/**
 * Retrieve styled text segments based on a specified property.
 *
 * Identifies sections of the text that share the same style (e.g., fontName or fontSize)
 * and returns the segments for further processing.
 *
 * @param {object} params - Configuration for retrieving styled segments.
 * @param {string} params.nodeId - ID of the text node.
 * @param {string} params.property - Name of the property to scan (e.g., "fontName", "fontSize").
 *
 * @returns {Promise<object>} Object containing the styled segments of the node.
 * @throws {Error} If the node is not found, not a text node, or the property is invalid.
 */
export async function getStyledTextSegments(params) {
  const { nodeId, property } = params || {};
  
  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  
  if (!property) {
    throw new Error("Missing property parameter");
  }
  
  // Validate property name
  const validProperties = ["fillStyleId", "fontName", "fontSize", "textCase", 
                           "textDecoration", "textStyleId", "fills", 
                           "letterSpacing", "lineHeight", "fontWeight"];
                           
  if (!validProperties.includes(property)) {
    throw new Error(`Invalid property: must be one of ${validProperties.join(", ")}`);
  }
  
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }
  
  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }
  
  try {
    // Load the font to ensure we can access text properties
    await figma.loadFontAsync(node.fontName);
    
    // Get the text content
    const text = node.characters;
    
    // Get style ranges for the specified property
    let styleRanges = [];
    
    if (property === "fontWeight") {
      // Special handling for fontWeight which is derived from fontName.style
      const ranges = node.getStyledTextSegments(['fontName']);
      styleRanges = ranges.map(range => {
        // Extract weight from font style
        let weight = 400; // Default to Regular weight
        const style = range.fontName.style;
        
        // Map common font style names to weights
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
      // For all other properties, use the standard Figma method
      styleRanges = node.getStyledTextSegments([property]).map(range => {
        // Create a copy of the range with just the needed properties
        const result = {
          characters: range.characters,
          start: range.start,
          end: range.end
        };
        
        // Add the specific style property
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


// Group export for all text operations.
/**
 * Named group of text operation functions for convenient importing.
 * @namespace textOperations
 * @example
 * const { setTextContent } = textOperations;
 * const updateResult = await setTextContent({ nodeId: '123', text: 'Goodbye' });
 */

export const textOperations = {
  createText,
  createBoundedText,
  createTexts,
  setTextContent,
  scanTextNodes,
  setMultipleTextContents,
  setTextCase,
  setTextDecoration,
  getStyledTextSegments
};
