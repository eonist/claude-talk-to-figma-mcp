// Main entry point for the Figma plugin

// Import modules
import { documentOperations } from './modules/document.js';
import { shapeOperations } from './modules/shapes.js';
import { textOperations } from './modules/text.js';
import { styleOperations } from './modules/styles.js';
import { componentOperations } from './modules/components.js';
import { layoutOperations } from './modules/layout.js';
import { renameOperations } from './modules/rename.js';
import { 
  sendProgressUpdate, 
  initializePlugin, 
  updateSettings, 
  customBase64Encode 
} from './utils.js';

// Destructure operations for easier access
const {
  getDocumentInfo,
  getSelection,
  getNodeInfo,
  getNodesInfo
} = documentOperations;

const {
  createRectangle,
  createFrame,
  createEllipse,
  createPolygon,
  createStar,
  createVector,
  createLine,
  setCornerRadius,
  resizeNode,
  deleteNode,
  moveNode,
  cloneNode,
  flattenNode
} = shapeOperations;

const {
  createText,
  setTextContent,
  scanTextNodes,
  setMultipleTextContents,
  setFontName,
  setFontSize,
  setFontWeight,
  setLetterSpacing,
  setLineHeight,
  setParagraphSpacing,
  setTextCase,
  setTextDecoration,
  getStyledTextSegments,
  loadFontAsyncWrapper
} = textOperations;

const {
  setFillColor,
  setStrokeColor,
  getStyles,
  setEffects,
  setEffectStyleId
} = styleOperations;

const {
  getLocalComponents,
  getRemoteComponents,
  createComponentInstance,
  exportNodeAsImage
} = componentOperations;

const {
  setAutoLayout,
  setAutoLayoutResizing,
  groupNodes,
  ungroupNodes,
  insertChild
} = layoutOperations;

const {
  rename_layers,
  ai_rename_layers,
  rename_layer,
  rename_multiples
} = renameOperations;

// Show UI
figma.showUI(__html__, { width: 350, height: 450 });

// Plugin commands from UI
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case "update-settings":
      updateSettings(msg);
      break;
    case "notify":
      figma.notify(msg.message);
      break;
    case "close-plugin":
      figma.closePlugin();
      break;
    case "execute-command":
      // Execute commands received from UI (which gets them from WebSocket)
      try {
        const result = await handleCommand(msg.command, msg.params);
        // Send result back to UI
        figma.ui.postMessage({
          type: "command-result",
          id: msg.id,
          result,
        });
      } catch (error) {
        figma.ui.postMessage({
          type: "command-error",
          id: msg.id,
          error: error.message || "Error executing command",
        });
      }
      break;
  }
};

// Listen for plugin commands from menu
figma.on("run", ({ command }) => {
  figma.ui.postMessage({ type: "auto-connect" });
});

/**
 * Handles incoming commands and routes them to the appropriate handler functions
 * 
 * @param {string} command - The command to execute
 * @param {object} params - Parameters for the command
 * @returns {Promise<any>} - The result of the command execution
 * @throws {Error} - If the command is unknown or execution fails
 */
async function handleCommand(command, params) {
  console.log(`Received command: ${command}`);
  
  switch (command) {
    // Document operations
    case "get_document_info":
      return await getDocumentInfo();
    case "get_selection":
      return await getSelection();
    case "get_node_info":
      return await getNodeInfo(params);
    case "get_nodes_info":
      return await getNodesInfo(params);
      
    // Shape operations
    case "create_rectangle":
      return await createRectangle(params);
    case "create_frame":
      return await createFrame(params);
    case "create_ellipse":
      return await createEllipse(params);
    case "create_polygon":
      return await createPolygon(params);
    case "create_star":
      return await createStar(params);
    case "create_vector":
      return await createVector(params);
    case "create_line":
      return await createLine(params);
    case "set_corner_radius":
      return await setCornerRadius(params);
    case "resize_node":
      return await resizeNode(params);
    case "delete_node":
      return await deleteNode(params);
    case "move_node":
      return await moveNode(params);
    case "clone_node":
      return await cloneNode(params);
    case "flatten_node":
      return await flattenNode(params);
      
    // Text operations
    case "create_text":
      return await createText(params);
    case "set_text_content":
      return await setTextContent(params);
    case "scan_text_nodes":
      return await scanTextNodes(params);
    case "set_multiple_text_contents":
      return await setMultipleTextContents(params);
    case "set_font_name":
      return await setFontName(params);
    case "set_font_size":
      return await setFontSize(params);
    case "set_font_weight":
      return await setFontWeight(params);
    case "set_letter_spacing":
      return await setLetterSpacing(params);
    case "set_line_height":
      return await setLineHeight(params);
    case "set_paragraph_spacing":
      return await setParagraphSpacing(params);
    case "set_text_case":
      return await setTextCase(params);
    case "set_text_decoration":
      return await setTextDecoration(params);
    case "get_styled_text_segments":
      return await getStyledTextSegments(params);
    case "load_font_async":
      return await loadFontAsyncWrapper(params);
      
    // Style operations
    case "set_fill_color":
      return await setFillColor(params);
    case "set_stroke_color":
      return await setStrokeColor(params);
    case "get_styles":
      return await getStyles();
    case "set_effects":
      return await setEffects(params);
    case "set_effect_style_id":
      return await setEffectStyleId(params);
      
    // Component operations
    case "get_local_components":
      return await getLocalComponents();
    case "get_remote_components":
      return await getRemoteComponents(params);
    case "create_component_instance":
      return await createComponentInstance(params);
    case "export_node_as_image":
      return await exportNodeAsImage(params);
      
    // Layout operations
    case "set_auto_layout":
      return await setAutoLayout(params);
    case "set_auto_layout_resizing":
      return await setAutoLayoutResizing(params);
    case "group_nodes":
      return await groupNodes(params);
    case "ungroup_nodes":
      return await ungroupNodes(params);
    case "insert_child":
      return await insertChild(params);
      
    // Rename operations
    case "rename_layers":
      return await rename_layers(params);
    case "ai_rename_layers":
      return await ai_rename_layers(params);
    case "rename_layer":
      return await rename_layer(params);
    case "rename_multiple":
      return await rename_multiples(params);
      
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

// Initialize the plugin on load
initializePlugin();

// Export the command handler for testing
export { handleCommand };
