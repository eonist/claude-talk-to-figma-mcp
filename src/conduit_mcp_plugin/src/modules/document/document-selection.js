/**
 * Document selection operations for Figma.
 * Exports: getSelection
 */

/**
 * Retrieves information about the currently selected nodes on the active Figma page.
 *
 * @async
 * @function
 * @returns {Promise<{selectionCount: number, selection: Array<{id: string, name: string, type: string, visible: boolean}>}>}
 *   An object with the count of selected nodes and an array of selection details.
 */
export async function getSelection() {
  const selection = figma.currentPage.selection || [];
  return {
    selectionCount: selection.length,
    selection: selection.map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type || "UNKNOWN",
      visible: node.visible,
    })),
  };
}
