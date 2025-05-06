// Components module - Provides functionality for working with Figma components
// including local components, team library components, component instances, and conversion

/**
 * Retrieves all local components available in the Figma document.
 * @returns {Promise<{count: number, components: Array<{id: string, name: string, key: string|null}>}>}
 */
export async function getLocalComponents() {
  await figma.loadAllPagesAsync();
  const comps = figma.root.findAllWithCriteria({ types: ["COMPONENT"] });
  return {
    count: comps.length,
    components: comps.map(c => ({
      id: c.id,
      name: c.name,
      key: "key" in c ? c.key : null
    }))
  };
}

/**
 * Retrieves remote components from team libraries.
 * @returns {Promise<{success: boolean, count?: number, components?: Array<any>, error?: boolean, message?: string}>}
 */
export async function getRemoteComponents() {
  try {
    if (!figma.teamLibrary || !figma.teamLibrary.getAvailableComponentsAsync) {
      return { error: true, message: "Team library API unavailable", apiAvailable: !!figma.teamLibrary };
    }
    let timeoutId;
    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Timeout")), 15000);
    });
    const comps = await Promise.race([
      figma.teamLibrary.getAvailableComponentsAsync(),
      timeout
    ]).finally(() => clearTimeout(timeoutId));
    return { success: true, count: comps.length, components: comps.map(c => ({
      key: c.key, name: c.name, description: c.description || "", libraryName: c.libraryName
    })) };
  } catch (err) {
    return { error: true, message: err.message || String(err), stack: err.stack };
  }
}

/**
 * Converts an existing node into a component.
 * @param {{nodeId: string}} params
 * @returns {Promise<{success: boolean, componentId: string}>}
 */
export async function createComponentFromNode(params) {
  const { nodeId } = params;
  if (!nodeId) throw new Error("Missing nodeId");
  const node = figma.getNodeById(nodeId);
  if (!node) throw new Error(`Node not found: ${nodeId}`);
  const comp = figma.createComponentFromNode(node);
  figma.currentPage.appendChild(comp);
  return { success: true, componentId: comp.id };
}

/**
 * Creates an instance of a component by key.
 * @param {{componentKey: string, x?: number, y?: number}} params
 * @returns {Promise<{id: string, name: string, x: number, y: number, width: number, height: number, componentId: string}>}
 */
export async function createComponentInstance(params) {
  const { componentKey, x = 0, y = 0 } = params;
  if (!componentKey) throw new Error("Missing componentKey");
  const comp = await figma.importComponentByKeyAsync(componentKey);
  const inst = comp.createInstance();
  inst.x = x;
  inst.y = y;
  figma.currentPage.appendChild(inst);
  return {
    id: inst.id, name: inst.name,
    x: inst.x, y: inst.y,
    width: inst.width, height: inst.height,
    componentId: inst.componentId
  };
}

/**
 * Creates multiple component instances.
 * @param {{instances: Array<{componentKey: string, x?: number, y?: number}>}} params
 * @returns {Promise<{instances: Array<any>}>}
 */
export async function createComponentInstances(params) {
  const { instances } = params;
  if (!Array.isArray(instances)) throw new Error("Missing instances array");
  const results = [];
  for (const cfg of instances) {
    results.push(await createComponentInstance(cfg));
  }
  return { instances: results };
}

/**
 * Exports a node as an image.
 * @param {{nodeId: string, format?: 'PNG'|'JPG'|'SVG'|'PDF', scale?: number}} params
 * @returns {Promise<{nodeId: string, format: string, scale: number, mimeType: string, imageData: string}>}
 */
export async function exportNodeAsImage(params) {
  const { nodeId, format = "PNG", scale = 1 } = params;
  if (!nodeId) throw new Error("Missing nodeId");
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node || typeof node.exportAsync !== "function") {
    throw new Error(`Cannot export node: ${nodeId}`);
  }
  const bytes = await node.exportAsync({ format, constraint: { type: "SCALE", value: scale } });
  const mime = format === "PNG" ? "image/png"
    : format === "JPG" ? "image/jpeg"
    : format === "SVG" ? "image/svg+xml"
    : format === "PDF" ? "application/pdf"
    : "application/octet-stream";
  const base64 = customBase64Encode(bytes);
  return { nodeId, format, scale, mimeType: mime, imageData: base64 };
}

export const componentOperations = {
  getLocalComponents,
  getRemoteComponents,
  createComponentFromNode,
  createComponentInstance,
  createComponentInstances,
  exportNodeAsImage
};
