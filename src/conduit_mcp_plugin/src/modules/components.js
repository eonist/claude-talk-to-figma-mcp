/**
 * Components operations module for Figma MCP plugin.
 * Provides functions to retrieve and manage Figma components.
 *
 * @module modules/components
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
 * Retrieves remote components from team libraries using the Figma plugin teamLibrary API.
 * @async
 * @function getRemoteComponents
 * @returns {Promise<{ success: boolean, count?: number, components?: Array<{ key: string, name: string, description: string, libraryName: string }>, error?: boolean, message?: string }>}
 * @throws {Error} If the team library API is unavailable or times out
 * @example
 * const remote = await getRemoteComponents();
 * if (remote.success) {
 *   console.log(`Loaded ${remote.count} remote components`);
 * } else {
 *   console.error('Failed to load remote components:', remote.message);
 * }
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
 * Retrieves components from a Figma team library with pagination.
 * @async
 * @function getTeamComponents
 * @param {{ teamId: string, pageSize?: number, after?: number }} params
 * @returns {Promise<{ components: Array<{ key: string, name: string, description: string, created_at: string, modified_at: string, containing_frame: object|null }>, pagination: { next_cursor: number, has_next: boolean } }>}
 * @throws {Error} If teamId is missing or the team library API is unavailable or times out
 * @example
 * const team = await getTeamComponents({ teamId: "123456" });
 * console.log(team.components, team.pagination);
 */
export async function getTeamComponents(params) {
  const { teamId, pageSize = 30, after = 0 } = params || {};
  if (!teamId) throw new Error("Missing teamId");
  if (!figma.teamLibrary || !figma.teamLibrary.getAvailableLibraryAssetsAsync) {
    throw new Error("Team library API unavailable");
  }
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Timeout")), 15000);
  });
  const result = await Promise.race([
    figma.teamLibrary.getAvailableLibraryAssetsAsync({
      teamId,
      pageSize,
      after,
      types: ["COMPONENT"]
    }),
    timeout
  ]).finally(() => clearTimeout(timeoutId));
  return {
    components: (result.libraryAssets || []).map(asset => ({
      key: asset.key,
      name: asset.name,
      description: asset.description,
      created_at: asset.created_at,
      modified_at: asset.modified_at,
      containing_frame: asset.containing_frame
        ? {
            x: asset.containing_frame.x,
            y: asset.containing_frame.y,
            width: asset.containing_frame.width,
            height: asset.containing_frame.height
          }
        : null
    })),
    pagination: {
      next_cursor: result.pagination ? result.pagination.after : undefined,
      has_next: result.pagination ? result.pagination.has_next : undefined
    }
  };
}

/**
 * Unified entry point to retrieve local, team, or remote components.
 * @async
 * @function getComponents
 * @param {{ source: "local"|"team"|"remote", team_id?: string, page_size?: number, after?: number }} params
 * @returns {Promise<any>}
 * @throws {Error} If source is invalid or required parameters are missing
 * @example
 * const locals = await getComponents({ source: "local" });
 * const team = await getComponents({ source: "team", team_id: "123456" });
 * const remote = await getComponents({ source: "remote" });
 */
export async function getComponents(params) {
  const { source, team_id, page_size, after } = params || {};
  if (source === "local") {
    return await getLocalComponents();
  } else if (source === "team") {
    return await getTeamComponents({ teamId: team_id, pageSize: page_size, after });
  } else if (source === "remote") {
    return await getRemoteComponents();
  } else {
    return {
      error: true,
      message: "Invalid source parameter. Must be 'local', 'team', or 'remote'."
    };
  }
}

/**
 * Converts one or more existing nodes into components.
 * @async
 * @function createComponentsFromNodes
 * @param {object} params - { entry, entries, skip_errors }
 * @returns {Promise<Array<{nodeId: string, componentId?: string, error?: string}>>}
 * @throws {Error} If no valid entry/entries are provided or a node is not found (unless skip_errors is true)
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
 * @async
 * @function createComponentInstance
 * @param {object} params - { instance, instances }
 * @returns {Promise<{instances: Array<{id: string, name: string, x: number, y: number, width: number, height: number, componentId: string}>}>}
 * @throws {Error} If componentKey is missing in any config
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
 * @async
 * @function exportNodeAsImage
 * @param {object} params - { nodeId, format, scale }
 * @returns {Promise<{nodeId: string, format: string, scale: number, mimeType: string, imageData: string}>}
 * @throws {Error} If nodeId is missing or node cannot be exported
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
 * Detach one or more component instances.
 * @async
 * @function detachInstances
 * @param {object} params - { instanceId, instanceIds, options }
 * @returns {Promise<Array<{id: string, name: string, instanceId: string, error?: string}>>}
 */
export async function detachInstances(params) {
  let instanceIds = [];
  const options = params && params.options ? params.options : {};
  if (Array.isArray(params.instanceIds) && params.instanceIds.length > 0) {
    instanceIds = params.instanceIds;
  } else if (typeof params.instanceId === "string") {
    instanceIds = [params.instanceId];
  } else {
    throw new Error("You must provide 'instanceId' or 'instanceIds'");
  }
  const maintainPosition = options.maintain_position;
  const skipErrors = options.skip_errors;
  const results = [];

  for (const instanceId of instanceIds) {
    try {
      const node = figma.getNodeById(instanceId);
      if (!node) {
        throw new Error(`No node found with ID: ${instanceId}`);
      }
      if (node.type !== 'INSTANCE') {
        throw new Error('Node is not a component instance');
      }
      // Store original position and parent if needed
      const originalX = node.x;
      const originalY = node.y;
      const originalParent = node.parent;

      // Detach instance
      const detached = node.detachInstance();

      // Maintain position if requested
      if (maintainPosition) {
        detached.x = originalX;
        detached.y = originalY;
        if (originalParent && 'appendChild' in originalParent) {
          try {
            originalParent.appendChild(detached);
          } catch (e) {
            // If already parented, ignore
          }
        }
      }

      results.push({ id: detached.id, name: detached.name, instanceId });
    } catch (error) {
      if (skipErrors) {
        results.push({
          error: error && error.message ? error.message : String(error),
          instanceId
        });
        continue;
      } else {
        // Stop on first error if not skipping errors
        throw error;
      }
    }
  }

  // Optionally, select and zoom to detached nodes if any
  const detachedNodes = results.filter(r => r.id).map(r => figma.getNodeById(r.id)).filter(Boolean);
  if (detachedNodes.length > 0) {
    figma.currentPage.selection = detachedNodes;
    figma.viewport.scrollAndZoomIntoView(detachedNodes);
  }

  return results;
}

export const componentOperations = {
  getComponents,
  getLocalComponents,
  getRemoteComponents,
  getTeamComponents,
  createComponentsFromNodes,
  createComponentInstance,
  exportNodeAsImage,
  detachInstances
};
