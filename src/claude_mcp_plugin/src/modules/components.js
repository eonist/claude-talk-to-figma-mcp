// Components module
import { customBase64Encode } from './utils.js';

/**
 * Retrieves all local components available in the Figma document.
 *
 * Loads all pages and finds components by type, returning a summary including component id, name, and key.
 *
 * @returns {Promise<object>} An object containing a count of components and an array with each component's details.
 *
 * @example
 * const components = await getLocalComponents();
 * console.log(components.count, components.components);
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
 * Retrieves available remote components from team libraries in Figma.
 *
 * @returns {Promise<object>} An object containing success status, count, and an array of components with details.
 *
 * @throws Will return an error object if the API is unavailable or retrieval fails.
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
 * Creates an instance of a component in the Figma document.
 *
 * @param {object} params - Parameters for creating component instance.
 * @param {string} params.componentKey - The key of the component to import.
 * @param {number} [params.x=0] - The X coordinate for the new instance.
 * @param {number} [params.y=0] - The Y coordinate for the new instance.
 *
 * @returns {Promise<object>} Details of the created instance including id, name, position, size, and componentId.
 *
 * @throws Will throw an error if the component cannot be imported.
 *
 * @example
 * const instance = await createComponentInstance({ componentKey: "abc123", x: 10, y: 20 });
 * console.log(instance.id, instance.name);
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
 * Exports a node as an image in the Figma document.
 *
 * @param {object} params - Export parameters.
 * @param {string} params.nodeId - The ID of the node to export.
 * @param {string} [params.format="PNG"] - The desired image format ("PNG","JPG","SVG","PDF").
 * @param {number} [params.scale=1] - The scale factor for the export.
 *
 * @returns {Promise<object>} An object containing nodeId, format, scale, mimeType, and base64-encoded image data.
 *
 * @throws Will throw an error if the node is not found, does not support exporting, or if the export fails.
 *
 * @example
 * const image = await exportNodeAsImage({ nodeId: "12345", format: "PNG", scale: 2 });
 * console.log(image.mimeType, image.imageData);
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

// Export the operations as a group
export const componentOperations = {
  getLocalComponents,
  getRemoteComponents,
  createComponentInstance,
  exportNodeAsImage
};
