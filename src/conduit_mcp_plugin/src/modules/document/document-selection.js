/**
 * Document selection operations for Figma.
 * Exports: getSelection
 */

/**
 * Retrieves information about the currently selected nodes on the active Figma page.
 * @async
 * @function getSelection
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
