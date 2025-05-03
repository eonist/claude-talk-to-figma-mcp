// Import modules (these will be created later)
import { documentOperations } from './document';
import { shapeOperations } from './shapes';
import { textOperations } from './text';
import { styleOperations } from './style';
import { componentOperations } from './components';

/**
 * Handles command execution for the plugin
 * 
 * @param command The command to execute
 * @param params Parameters for the command
 * @returns Result of the command execution
 */
export async function handleCommand(command: string, params: any): Promise<any> {
  console.log(`Received command: ${command}`);
  
  switch (command) {
    // Document operations
    case "get_document_info":
      return await documentOperations.getDocumentInfo();
    case "get_selection":
      return await documentOperations.getSelection();
    case "get_node_info":
      if (!params || !params.nodeId) {
        throw new Error("Missing nodeId parameter");
      }
      return await documentOperations.getNodeInfo(params.nodeId);
    case "get_nodes_info":
      if (!params || !params.nodeIds || !Array.isArray(params.nodeIds)) {
        throw new Error("Missing or invalid nodeIds parameter");
      }
      return await documentOperations.getNodesInfo(params.nodeIds);
      
    // Shape operations
    case "create_rectangle":
      return await shapeOperations.createRectangle(params);
    case "create_frame":
      return await shapeOperations.createFrame(params);
    case "create_ellipse":
      return await shapeOperations.createEllipse(params);
    case "create_polygon":
      return await shapeOperations.createPolygon(params);
    case "create_star":
      return await shapeOperations.createStar(params);
    case "create_vector":
      return await shapeOperations.createVector(params);
    case "create_line":
      return await shapeOperations.createLine(params);
    case "set_corner_radius":
      return await shapeOperations.setCornerRadius(params);
    case "resize_node":
      return await shapeOperations.resizeNode(params);
    case "delete_node":
      return await shapeOperations.deleteNode(params);
    case "move_node":
      return await shapeOperations.moveNode(params);
    case "clone_node":
      return await shapeOperations.cloneNode(params);
    case "flatten_node":
      return await shapeOperations.flattenNode(params);
      
    // Style operations
    case "set_fill_color":
      return await styleOperations.setFillColor(params);
    case "set_stroke_color":
      return await styleOperations.setStrokeColor(params);
    case "get_styles":
      return await styleOperations.getStyles();
    case "set_effects":
      return await styleOperations.setEffects(params);
    case "set_effect_style_id":
      return await styleOperations.setEffectStyleId(params);
    case "set_auto_layout":
      return await styleOperations.setAutoLayout(params);
    case "set_auto_layout_resizing":
      return await styleOperations.setAutoLayoutResizing(params);
      
    // Text operations
    case "create_text":
      return await textOperations.createText(params);
    case "set_text_content":
      return await textOperations.setTextContent(params);
    case "scan_text_nodes":
      return await textOperations.scanTextNodes(params);
    case "set_multiple_text_contents":
      return await textOperations.setMultipleTextContents(params);
    case "set_font_name":
      return await textOperations.setFontName(params);
    case "set_font_size":
      return await textOperations.setFontSize(params);
    case "set_font_weight":
      return await textOperations.setFontWeight(params);
    case "set_letter_spacing":
      return await textOperations.setLetterSpacing(params);
    case "set_line_height":
      return await textOperations.setLineHeight(params);
    case "set_paragraph_spacing":
      return await textOperations.setParagraphSpacing(params);
    case "set_text_case":
      return await textOperations.setTextCase(params);
    case "set_text_decoration":
      return await textOperations.setTextDecoration(params);
    case "get_styled_text_segments":
      return await textOperations.getStyledTextSegments(params);
    case "load_font_async":
      return await textOperations.loadFontAsyncWrapper(params);
      
    // Component operations
    case "get_local_components":
      return await componentOperations.getLocalComponents();
    case "get_remote_components":
      return await componentOperations.getRemoteComponents();
    case "create_component_instance":
      return await componentOperations.createComponentInstance(params);
    case "export_node_as_image":
      return await componentOperations.exportNodeAsImage(params);
    case "group_nodes":
      return await componentOperations.groupNodes(params);
    case "ungroup_nodes":
      return await componentOperations.ungroupNodes(params);
    case "insert_child":
      return await componentOperations.insertChild(params);
    case "rename_layer":
      return await componentOperations.rename_layer(params);
    case "rename_layers":
      return await componentOperations.rename_layers(params);
    case "rename_multiple":
      return await componentOperations.rename_multiple(params);
    case "ai_rename_layers":
      return await componentOperations.ai_rename_layers(params);
      
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}
