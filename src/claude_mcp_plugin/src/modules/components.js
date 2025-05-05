// Components module - Provides functionality for working with Figma components
// including local components, team library components, and component instances
import { customBase64Encode } from './utils.js';

/**
 * Retrieves all local components available in the Figma document. 
 * 
 * First loads all pages in the document to ensure complete component discovery,
 * then searches for all components using Figma's node traversal API.
 *
 * @returns {Promise<object>} Component data object
 * @property {number} count - Total number of local components found
 * @property {Array<object>} components - Array of component details
 * @property {string} components[].id - Unique Figma node ID of the component
 * @property {string} components[].name - Display name of the component
 * @property {string|null} components[].key - Component's key for team library usage, null if not available
 *
 * @example
 * const { count, components } = await getLocalComponents();
 * console.log(`Found ${count} components:`);
 * components.forEach(c => console.log(`- ${c.name} (${c.id})`));
 */
export async function getLocalComponents() {
  await figma.loadAllPagesAsync();

  const components = figma.root.findAllWithCriteria({
    types: ["COMPONENT"],
  });

  return {
    count: components.length,
    components: components.map((component) => ({
      id: component.id,
      name: component.name,
      key: "key" in component ? component.key : null,
    })),
  };
}

/**
 * Retrieves available components from all team libraries accessible to the current user. 
 * 
 * Performs API availability checks and implements timeout protection against potential
 * deadlocks when fetching remote components.
 *
 * @returns {Promise<object>} Response object with component data or error information
 * @property {boolean} success - Whether the operation was successful
 * @property {number} [count] - Number of components found (only if successful)
 * @property {Array<object>} [components] - Array of component details (only if successful)
 * @property {string} components[].key - Unique key of the component in the team library
 * @property {string} components[].name - Display name of the component
 * @property {string} components[].description - Component description from the library
 * @property {string} components[].libraryName - Name of the team library containing the component
 * @property {boolean} [error] - Whether an error occurred
 * @property {string} [message] - Error message if applicable
 * @property {boolean} [apiAvailable] - Whether the team library API is available
 * @property {string} [stack] - Error stack trace if available
 *
 * @throws Returns error object instead of throwing if API is unavailable or retrieval fails
 */
export async function getRemoteComponents() {
  try {
    // Check if figma.teamLibrary is available
    if (!figma.teamLibrary) {
      console.error("Error: figma.teamLibrary API is not available");
      return {
        error: true,
        message: "The figma.teamLibrary API is not available in this context",
        apiAvailable: false
      };
    }
    
    // Check if figma.teamLibrary.getAvailableComponentsAsync exists
    if (!figma.teamLibrary.getAvailableComponentsAsync) {
      console.error("Error: figma.teamLibrary.getAvailableComponentsAsync is not available");
      return {
        error: true,
        message: "The getAvailableComponentsAsync method is not available",
        apiAvailable: false
      };
    }
    
    console.log("Starting remote components retrieval...");
    
    // Set up a manual timeout to detect deadlocks
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Internal timeout while retrieving remote components (15s)"));
      }, 15000); // 15 seconds internal timeout
    });
    
    // Execute the request with a manual timeout
    const fetchPromise = figma.teamLibrary.getAvailableComponentsAsync();
    
    // Use Promise.race to implement the timeout
    const teamComponents = await Promise.race([fetchPromise, timeoutPromise])
      .finally(() => {
        clearTimeout(timeoutId); // Clear the timeout
      });
    
    console.log(`Retrieved ${teamComponents.length} remote components`);
    
    return {
      success: true,
      count: teamComponents.length,
      components: teamComponents.map(component => ({
        key: component.key,
        name: component.name,
        description: component.description || "",
        libraryName: component.libraryName
      }))
    };
  } catch (error) {
    console.error(`Detailed error retrieving remote components: ${error.message || "Unknown error"}`);
    console.error(`Stack trace: ${error.stack || "Not available"}`);
    
    return {
      error: true,
      message: `Error retrieving remote components: ${error.message}`,
      stack: error.stack,
      apiAvailable: true,
      methodExists: true
    };
  }
}

/**
 * Creates an instance of a component from either local components or team libraries. 
 * 
 * First imports the component by its key, then creates an instance at the specified
 * coordinates. The instance is automatically added to the current page.
 *
 * @param {object} params - Instance creation parameters
 * @param {string} params.componentKey - Unique key identifying the component to instantiate
 * @param {number} [params.x=0] - X coordinate for placement in the current page
 * @param {number} [params.y=0] - Y coordinate for placement in the current page
 *
 * @returns {Promise<object>} Created instance details
 * @property {string} id - Unique node ID of the created instance
 * @property {string} name - Name of the instance (inherited from component)
 * @property {number} x - Final X coordinate of the instance
 * @property {number} y - Final Y coordinate of the instance
 * @property {number} width - Width of the instance
 * @property {number} height - Height of the instance
 * @property {string} componentId - ID of the master component this is an instance of
 *
 * @throws {Error} If componentKey is missing or component import fails
 * @throws {Error} If instance creation or placement fails
 */
export async function createComponentInstance(params) {
  const { componentKey, x = 0, y = 0 } = params || {};

  if (!componentKey) {
    throw new Error("Missing componentKey parameter");
  }

  try {
    const component = await figma.importComponentByKeyAsync(componentKey);
    const instance = component.createInstance();

    instance.x = x;
    instance.y = y;

    figma.currentPage.appendChild(instance);

    return {
      id: instance.id,
      name: instance.name,
      x: instance.x,
      y: instance.y,
      width: instance.width,
      height: instance.height,
      componentId: instance.componentId,
    };
  } catch (error) {
    throw new Error(`Error creating component instance: ${error.message}`);
  }
}

/**
 * Exports a Figma node (frame, component, instance, etc.) as an image. 
 * 
 * Supports multiple export formats and custom scaling. The image data is returned
 * as a base64-encoded string suitable for data URLs or further processing.
 *
 * @param {object} params - Export configuration
 * @param {string} params.nodeId - ID of the node to export
 * @param {('PNG'|'JPG'|'SVG'|'PDF')} [params.format='PNG'] - Output format
 * @param {number} [params.scale=1] - Export scale factor (1 = 100%)
 *
 * @returns {Promise<object>} Export result
 * @property {string} nodeId - ID of the exported node
 * @property {string} format - Format used for the export
 * @property {number} scale - Scale factor used
 * @property {string} mimeType - MIME type of the exported data
 * @property {string} imageData - Base64-encoded image data
 *
 * @throws {Error} If node is not found
 * @throws {Error} If node doesn't support exporting
 * @throws {Error} If export operation fails
 */
export async function exportNodeAsImage(params) {
  const { nodeId, scale = 1 } = params || {};
  const format = "PNG";

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("exportAsync" in node)) {
    throw new Error(`Node does not support exporting: ${nodeId}`);
  }

  try {
    const settings = {
      format: format,
      constraint: { type: "SCALE", value: scale },
    };

    const bytes = await node.exportAsync(settings);

    let mimeType;
    switch (format) {
      case "PNG":
        mimeType = "image/png";
        break;
      case "JPG":
        mimeType = "image/jpeg";
        break;
      case "SVG":
        mimeType = "image/svg+xml";
        break;
      case "PDF":
        mimeType = "application/pdf";
        break;
      default:
        mimeType = "application/octet-stream";
    }

    // Convert Uint8Array to base64
    const base64 = customBase64Encode(bytes);

    return {
      nodeId,
      format,
      scale,
      mimeType,
      imageData: base64,
    };
  } catch (error) {
    throw new Error(`Error exporting node as image: ${error.message}`);
  }
}

/**
 * Collection of all component-related operations exposed by this module.
 * Use this object to access the component manipulation functions.
 */
export async function createComponentInstances(params) {
  const { instances } = params || {};
  if (!instances || !Array.isArray(instances)) {
    throw new Error("Missing instances array");
  }
  const instanceResults = [];
  for (const instanceData of instances) {
    const result = await createComponentInstance(instanceData);
    instanceResults.push(result);
  }
  return { instances: instanceResults };
}

export const componentOperations = {
  getLocalComponents,
  getRemoteComponents,
  createComponentInstance,
  createComponentInstances,
  exportNodeAsImage
};
