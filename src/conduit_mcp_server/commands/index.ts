/**
 * Command registry for the MCP server.
 *
 * This module centralizes registration of all command categories:
 * - Read commands (data retrieval operations)
 * - Create commands (element creation operations)
 * - Modify commands (element mutation operations)
 * - Rename commands (layer renaming operations)
 * - Channel commands (communication channel management)
 *
 * @module commands/index
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../clients/figma-client/index.js";
import { registerChannelCommand } from "./channel.js";
import { logger } from "../utils/logger.js";
import { registerHtmlCommands } from "./figma/export/html-tools.js";
import { registerReorderLayerTools } from "./figma/node/reorder-layer-tools.js";
import { registerAnnotationCommands } from "./figma/document/annotation-tools.js";
import { registerUnifiedGridCommands } from "./figma/page/grid-unified-tools.js";
import { registerGuideCommands } from "./figma/page/guide-tools.js";
import { registerConstraintCommands } from "./figma/layout/constraint-tools.js";
import { registerPageCommands } from "./figma/page/page-tools.js";
import { registerEventCommands } from "./figma/document/event-tools.js";
import { registerVariantCommands } from "./figma/component/variant-tools.js";
/**
 * Figma READ command registrations for the MCP server.
 *
 * Orchestrates registration of all Figma read tools by delegating to submodules.
 *
 * @module commands/figma/read
 * @param {McpServer} server - The MCP server instance.
 * @param {FigmaClient} figmaClient - The Figma client instance.
 * @example
 * import { registerReadCommands } from './read.js';
 * registerReadCommands(server, figmaClient);
 */
 
// Import all tool registration functions from submodules
import { registerDocumentTools } from "./figma/document/document-tools.js";
import { registerNodeTools } from "./figma/node/node-tools.js";
import { registerSelectionTools } from "./figma/node/selection-tools.js";
import { registerStyleTools } from "./figma/style/style-tools.js";
import { registerComponentTools } from "./figma/component/component-tools.js";
import { registerTextAnalysisTools } from "./figma/text/text-analysis-tools.js";
import { registerCssTools } from "./figma/export/css-tools.js";
// new
 
// import { registerDocumentTools } from "./figma/document/document-tools.js";
// import { registerSelectionTools } from "./figma/document/selection-tools.js";
// import { registerNodeTools } from "./figma/node/node-tools.js";
// import { registerStyleTools, registerNodeStylesTool } from "./figma/style/style-tools.js";
// import { registerComponentTools } from "./figma/component/component-tools.js";
// import { registerTextAnalysisTools } from "./figma/text/text-analysis-tools.js";
// import { registerCssTools } from "./figma/export/css-tools.js";
import { registerSvgVectorTool } from "./figma/svg/vector-tools.js";
import { registerImageTools } from "./figma/image/image-tools.js";
import { registerTextStyleTools } from "./figma/style/text-style-tools.js";

// modify imports
//import { registerStylingCommands } from "./figma/style/index.js";
import { registerPositioningCommands } from "./figma/layout/positioning-tools.js";
import { registerTransformCommands } from "./figma/layout/transform-tools.js";
// import { registerLayerManagementCommands } from "./figma/node/index.js";
import { registerPropertyManipulationCommands } from "./figma/export/index.js";
import { registerRenameCommands } from "./figma/node/rename.js";
import { registerSelectionModifyTools } from "./figma/document/selection-tools.js";
import { registerLayoutAutoTools } from "./figma/layout/layout-auto-tools.js";

 
import { registerFillTools } from "./figma/style/fill-tools.js";
//import { registerStyleTools } from "./style-tools.js";
import { registerGradientTools } from "./figma/style/gradient-tools.js";
import { registerEffectTools } from "./figma/style/effect-tools.js";
import { registerVariableTools } from "./figma/document/variables-tools.js";

/**
 * Figma CREATE command registrations for the MCP server.
 *
 * Adds tools for creating shapes, text, vectors, components, and images via Figma.
 *
 * @module commands/figma/create
 * @param {McpServer} server - The MCP server instance.
 * @param {FigmaClient} figmaClient - The Figma client instance.
 * @example
 * import { registerCreateCommands } from './create.js';
 * registerCreateCommands(server, figmaClient);
 */
 
// import { registerShapeCreationCommands } from "./figma/shape/index.js";
//import { registerTextCreationCommands } from "./figma/text/index.js";
import { registerTextTools } from "./figma/text/text-tools.js";

// import { registerComponentCreationCommands } from "./figma/component/index.js";
//import { registerImageCreationCommands } from "./figma/image/index.js";
import { registerSvgCreationCommands } from "./figma/svg/svg-creation-tools.js";
import { registerDocumentCreationCommands } from "./figma/document/document-creation.js";
// node
import { registerBooleanTools } from "./figma/node/boolean-tools.js";
import { registerGroupTools } from "./figma/node/group-tools.js";
import { registerDeleteTools } from "./figma/node/delete-tools.js";
import { registerInsertChildTools } from "./figma/node/insert-child-tools.js";
import { registerFlattenNodeTools } from "./figma/node/flatten-node-tools.js";
import { registerCloneNodeTools } from "./figma/node/clone-node-tools.js";

import { registerRectanglesTools } from "./figma/shape/rectangles.js";
import { registerFramesTools } from "./figma/shape/frames.js";
import { registerLinesTools } from "./figma/shape/lines.js";
import { registerEllipsesTools } from "./figma/shape/ellipses.js";
import { registerPolygonsTools } from "./figma/shape/polygons.js";

import { registerUnifiedImageTool } from "./figma/image/insert-image.js";

import { registerCreateInstancesFromComponentsTools } from "./figma/component/instance-tools.js";
import { registerComponentNodeTools } from "./figma/component/component-node-tools.js";
import { registerButtonTools } from "./figma/shape/button-tools.js";

/**
 * Registers all tool commands with the given MCP server.
 *
 * Sets up:
 * - Read operations: get_document_info, get_selection, get_node_info, etc.
 * - Create operations: create_rectangle, create_text, etc.
 * - Modify operations: move_node, resize_node, set_style, etc.
 * - Rename operations: rename_layer, rename_layers, ai_rename_layers, etc.
 * - Channel operations: join_channel
 *
 * @param {McpServer} server - The MCP server instance
 */
export function registerAllCommands(server: McpServer): void {
  try {
    logger.info("Registering all commands...");
    // Instantiate Figma client to pass into each command group
    // Note: Using explicit FigmaClient type instead of 'any' to prevent type issues
    const figmaClient: FigmaClient = new FigmaClient();
    // Register command categories
    registerReadCommands(server, figmaClient); // Register read commands (data retrieval)
    registerCreateCommands(server, figmaClient);// Register create commands (element creation)
    registerModifyCommands(server, figmaClient);// Register modify commands (element mutation)
    registerChannelCommand(server, figmaClient);// Register channel commands (communication channel management)
    registerHtmlCommands(server, figmaClient);// Register HTML commands (HTML generation from Figma nodes)
    registerUnifiedGridCommands(server, figmaClient); // Register unified grid commands (set_grid, get_grid)
    registerGuideCommands(server, figmaClient); // Register guide commands (set_guide, get_guide)
    registerConstraintCommands(server, figmaClient); // Register constraint commands (set_constraints, get_constraints)
    registerPageCommands(server, figmaClient); // Register page commands (set_page, get_page)
+   registerEventCommands(server, figmaClient); // Register event commands (subscribe_event, unsubscribe_event)
+   registerVariantCommands(server, figmaClient); // Register variant commands (set_variant, get_variant)
+   registerAnnotationCommands(server, figmaClient); // Register annotation commands
+   registerReorderLayerTools(server, figmaClient); // Register reorder layer tools (z-order/layer order)
    logger.info("All commands registered successfully");
  } catch (error) {
    logger.error(`Error registering commands: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Registers all Figma read commands for the MCP server by delegating to submodules.
 *
 * @param {McpServer} server - The MCP server instance
 * @param {FigmaClient} figmaClient - The Figma client instance
 */
export function registerReadCommands(server: McpServer, figmaClient: FigmaClient) {
  registerDocumentTools(server, figmaClient); // fixme add comment
  registerNodeTools(server, figmaClient); // fixme add comment
  registerSelectionTools(server, figmaClient); // fixme add comment
  registerStyleTools(server, figmaClient); // fixme add comment
  registerComponentTools(server, figmaClient); // fixme add comment
  registerTextAnalysisTools(server, figmaClient); // fixme add comment
  registerCssTools(server, figmaClient); // fixme add comment
  // New
  registerDocumentTools(server, figmaClient); // fixme: add doc
  registerSelectionTools(server, figmaClient); // fixme: add doc
  registerNodeTools(server, figmaClient); // fixme: add doc
  registerStyleTools(server, figmaClient); // fixme: add doc
  //registerNodeStylesTool(server, figmaClient); // fixme: add doc
  registerComponentTools(server, figmaClient); // fixme: add doc
  registerTextAnalysisTools(server, figmaClient); // fixme: add doc
  registerCssTools(server, figmaClient); // fixme: add doc
  registerSvgVectorTool(server, figmaClient); // fixme: add doc
  registerImageTools(server, figmaClient); // fixme: add doc
  registerTextStyleTools(server, figmaClient); // fixme: add doc
}


/**
 * Registers all modify commands by delegating to category modules.
 *
 * @param server - The MCP server instance
 * @param figmaClient - The Figma client instance
 */
export function registerModifyCommands(server: McpServer, figmaClient: FigmaClient): void {
  registerStylingCommands(server, figmaClient); // fixme add comment
  registerPositioningCommands(server, figmaClient); // fixme add comment
  registerTransformCommands(server, figmaClient); // fixme add comment
  registerLayerManagementCommands(server, figmaClient); // fixme add comment
  registerPropertyManipulationCommands(server, figmaClient); // fixme add comment
  registerRenameCommands(server, figmaClient); // fixme add comment
  registerSelectionModifyTools(server); // fixme add comment
  registerLayoutAutoTools(server, figmaClient); // fixme add comment
}

/**
 * Registers all creation commands by delegating to category modules.
 *
 * @param server - The MCP server instance
 * @param figmaClient - The Figma client instance
 */
export function registerCreateCommands(server: McpServer, figmaClient: FigmaClient): void {
  registerShapeCreationCommands(server, figmaClient); // fixme add comment
  //registerTextCreationCommands(server, figmaClient); // fixme add comment
  registerTextTools(server, figmaClient); // Registers all text creation commands by delegating to submodules.
  
  registerComponentCreationCommands(server, figmaClient); // fixme add comment
  registerImageCreationCommands(server, figmaClient); // fixme add comment
  registerSvgCreationCommands(server, figmaClient); // fixme add comment
  registerDocumentCreationCommands(server, figmaClient); // fixme add comment
}

 

/**
 * Registers all styling commands by delegating to submodules.
 */
export function registerStylingCommands(server: McpServer, figmaClient: FigmaClient) {
  registerFillTools(server, figmaClient);
  registerStyleTools(server, figmaClient);
  registerGradientTools(server, figmaClient);
  registerEffectTools(server, figmaClient);
  registerVariableTools(server, figmaClient);
}

/**
 * Registers all layer management commands on the MCP server by delegating to submodules.
 *
 * This function acts as a central registration point for layer management tools including boolean operations,
 * grouping, deletion, child insertion, flattening, and cloning. It calls the respective registration functions for each tool.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerLayerManagementCommands(server, figmaClient);
 */
export function registerLayerManagementCommands(server: McpServer, figmaClient: FigmaClient) {
  registerBooleanTools(server, figmaClient);
  registerGroupTools(server, figmaClient);
  registerDeleteTools(server, figmaClient);
  registerInsertChildTools(server, figmaClient);
  registerFlattenNodeTools(server, figmaClient);
  registerCloneNodeTools(server, figmaClient);
}

 
/**
 * Registers all shape creation commands on the MCP server by delegating to submodules.
 *
 * This function acts as a central registration point for shape creation tools including rectangles,
 * frames, lines, ellipses, and polygons. It calls the respective registration functions for each shape type.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerShapeCreationCommands(server, figmaClient);
 */
export function registerShapeCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  registerRectanglesTools(server, figmaClient);
  registerFramesTools(server, figmaClient);
  registerLinesTools(server, figmaClient);
  registerEllipsesTools(server, figmaClient);
  registerPolygonsTools(server, figmaClient);
}

/**
 * Registers all image creation commands by delegating to submodules.
 */
export function registerImageCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  registerUnifiedImageTool(server, figmaClient);
}


/**
 * Registers all component creation commands on the MCP server by delegating to submodules.
 *
 * This function acts as a central registration point for component creation tools including instance creation,
 * node conversion, and button creation. It calls the respective registration functions for each tool.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerComponentCreationCommands(server, figmaClient);
 */
export function registerComponentCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  registerCreateInstancesFromComponentsTools(server, figmaClient);
  registerComponentNodeTools(server, figmaClient);
  registerButtonTools(server, figmaClient);
}


// Re-export for granular imports if needed
// export {
//   registerCreateInstancesFromComponentsTools as registerInstanceTools,
//   registerNodeTools,
//   registerButtonTools,
// };



// Re-export for granular imports if needed
// export {
//   registerRectanglesTools,
//   registerFramesTools,
//   registerLinesTools,
//   registerEllipsesTools,
//   registerPolygonsTools,
// };
 


// Re-export for granular imports if needed
// export {
//   registerBooleanTools,
//   registerGroupTools,
//   registerDeleteTools,
//   registerInsertChildTools,
//   registerFlattenNodeTools,
//   registerCloneNodeTools,
// };


// Re-export for granular imports if needed
//export {
//  registerFillTools,
//  registerStyleTools,
//  registerGradientTools,
//  registerEffectTools,
//  registerVariableTools,
//};

// Re-export for granular imports if needed
// export {
//   registerDocumentTools,
//   registerSelectionTools,
//   registerNodeTools,
//   registerStyleTools,
//   registerNodeStylesTool,
//   registerComponentTools,
//   registerTextAnalysisTools,
//   registerCssTools,
//   registerSvgVectorTool,
//   registerImageTools,
//   registerTextStyleTools,
// };