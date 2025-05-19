/**
 * Components operations module.
 * Provides functions to retrieve and manage Figma components via MCP.
 *
 * Exposed functions:
 * - getLocalComponents(): Promise<{ count: number, components: Array<{ id: string, name: string, key: string|null }> }>
 * - getRemoteComponents(): Promise<{ success: boolean, count?: number, components?: Array<any>, error?: boolean, message?: string }>
 * - createComponentInstance(params): Promise<{ instances: Array<any> }>
 * - exportNodeAsImage(params): Promise<{ nodeId: string, format: string, scale: number, mimeType: string, imageData: string }>
 *
 * @module modules/components
 * @see {@link https://help.figma.com/hc/en-us/articles/360040451373-Components-in-Figma}
 * @example
 * import { componentOperations } from './modules/components.js';
 * const locals = await componentOperations.getLocalComponents();
 * console.log(`Found ${locals.count} local components`);
 */

/**
 * Retrieves all local components available in the Figma document.
 * @async
 * @function getLocalComponents
 * @returns {Promise<{ count: number, components: Array<{ id: string, name: string, key: string|null }> }>}
 * @throws {Error} If Figma pages cannot be loaded
 * @example
 * const result = await getLocalComponents();
 * console.log(`Found ${result.count} components`, result.components);
 */


/**
 * Converts one or more existing nodes into components.
 * Accepts either a single entry or an array of entries.
 *
 * @param {object} params - Parameters for component creation.
 * @param {{nodeId: string, maintain_position?: boolean}} [params.entry] - Single node config.
 * @param {Array<{nodeId: string, maintain_position?: boolean}>} [params.entries] - Array of node configs.
 * @param {boolean} [params.skip_errors] - If true, skip errors and continue processing.
 * @returns {Promise<Array<{nodeId: string, componentId?: string, error?: string}>>}
 * @throws {Error} If no valid entry/entries are provided or a node is not found (unless skip_errors is true).
 * @example
 * // Single node
 * const results = await createComponentsFromNodes({ entry: { nodeId: '123:45' } });
 * // Batch
 * const results = await createComponentsFromNodes({ entries: [{ nodeId: '123:45' }, { nodeId: '678:90', maintain_position: true }], skip_errors: true });
 */
export async function createComponentsFromNodes(params) {
  const { entry, entries, skip_errors } = params || {};
  const nodeEntries =
    Array.isArray(entries) && entries.length > 0
      ? entries
      : entry
      ? [entry]
      : [];
  if (!nodeEntries.length) throw new Error("No node entries provided");
  const results = [];
  for (const nodeCfg of nodeEntries) {
    try {
      const { nodeId, maintain_position } = nodeCfg;
      if (!nodeId) throw new Error("Missing nodeId");
      const node = figma.getNodeById(nodeId);
      if (!node) throw new Error(`Node not found: ${nodeId}`);
      // Store original position if needed
      const originalX = node.x;
      const originalY = node.y;
      const comp = figma.createComponentFromNode(node);
      if (maintain_position) {
        comp.x = originalX;
        comp.y = originalY;
      }
      figma.currentPage.appendChild(comp);
      results.push({ nodeId, componentId: comp.id });
    } catch (err) {
      if (skip_errors) {
        results.push({
          nodeId: nodeCfg.nodeId,
          error: err && err.message ? err.message : String(err),
        });
        continue;
      } else {
        throw err;
      }
    }
  }
  return results;
}

/**
 * Creates one or more instances of a component by key.
 * Accepts either a single object (instance) or an array (instances).
 *
 * @async
 * @function createComponentInstance
 * @param {object} params - Parameters for instance creation.
 * @param {{componentKey: string, x?: number, y?: number}} [params.instance] - Single instance config.
 * @param {Array<{componentKey: string, x?: number, y?: number}>} [params.instances] - Array of instance configs.
 * @returns {Promise<{instances: Array<{id: string, name: string, x: number, y: number, width: number, height: number, componentId: string}>}>} Array of created instance details.
 * @throws {Error} If componentKey is missing in any config.
 * @example
 * // Single instance
 * const { instances } = await createComponentInstance({ instance: { componentKey: 'ABC123', x: 100, y: 200 } });
 * // Batch
 * const { instances } = await createComponentInstance({ instances: [{ componentKey: 'ABC123', x: 100, y: 200 }, { componentKey: 'DEF456', x: 300, y: 400 }] });
 */
export async function createComponentInstance(params) {
  let instancesArr;
  if (params.instances) {
    instancesArr = params.instances;
  } else if (params.instance) {
    instancesArr = [params.instance];
  } else {
    // Fallback for legacy single input
    instancesArr = [params];
  }
  instancesArr = instancesArr.filter(Boolean);
  const results = [];
  for (const cfg of instancesArr) {
    const { componentKey, x = 0, y = 0 } = cfg;
    if (!componentKey) throw new Error("Missing componentKey");
    const comp = await figma.importComponentByKeyAsync(componentKey);
    const inst = comp.createInstance();
    inst.x = x;
    inst.y = y;
    figma.currentPage.appendChild(inst);
    results.push({
      id: inst.id, name: inst.name,
      x: inst.x, y: inst.y,
      width: inst.width, height: inst.height,
      componentId: inst.componentId
    });
  }
  return { instances: results };
}

/**
 * Exports a node as an image in the specified format and scale.
 *
 * @async
 * @function exportNodeAsImage
 * @param {object} params - Parameters for export.
 * @param {string} params.nodeId - Node ID to export.
 * @param {'PNG'|'JPG'|'SVG'|'PDF'} [params.format='PNG'] - Image format.
 * @param {number} [params.scale=1] - Export scale factor.
 * @returns {Promise<{nodeId: string, format: string, scale: number, mimeType: string, imageData: string}>} Exported image data.
 * @throws {Error} If nodeId is missing or node cannot be exported.
 * @example
 * const image = await exportNodeAsImage({ nodeId: '123:45', format: 'PNG', scale: 2 });
 * console.log(image.mimeType, image.imageData);
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


/**
 * Collection of component operation functions for Figma nodes.
 * @namespace componentOperations
 * @property {function} getLocalComponents - Retrieve local components.
 * @property {function} getRemoteComponents - Retrieve remote components.
 * @property {function} getTeamComponents - Retrieve team library components.
 * @property {function} createComponentInstance - Create component instance(s).
 * @property {function} exportNodeAsImage - Export node as image.
 */
/**
 * Unified getComponents: retrieves local, team, or remote components based on source param.
 * @param {object} params
 * @param {"local"|"team"|"remote"} params.source
 * @param {string} [params.team_id] - Required if source is "team"
 * @param {number} [params.page_size]
 * @param {string|number} [params.after]
 * @returns {Promise<any>}
 */
/**
 * Sends a "get_components" command to the MCP server, passing the parameters as-is.
 * The server will handle the logic for local, team, or remote components.
 */
export async function getComponents(params) {
  // Assumes sendCommand is available in the plugin context
  if (typeof sendCommand !== "function") {
    throw new Error("sendCommand is not defined in this context.");
  }
  return await sendCommand("get_components", params);
}

export const componentOperations = {
  getComponents,
  createComponentsFromNodes,
  createComponentInstance,
  exportNodeAsImage
};
