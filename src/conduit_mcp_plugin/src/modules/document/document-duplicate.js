/**
 * Duplicate a Figma page and all its children as a new page.
 * @param {Object} params
 * @param {string} params.pageId - The ID of the page to duplicate.
 * @param {string} [params.newPageName] - Optional name for the new page.
 * @returns {Promise<{ newPageId: string, newPageName: string, clonedIds: string[] }>}
 */
export async function duplicatePage({ pageId, newPageName }) {
  if (!pageId) throw new Error('Missing pageId parameter');
  const originalPage = await figma.getNodeByIdAsync(pageId);
  if (!originalPage || originalPage.type !== 'PAGE') throw new Error('Invalid page ID');
  // Create new page
  const { createPage } = await import('./document-info.js');
  const newPageInfo = await createPage(newPageName || (originalPage.name + ' (Copy)'));
  const newPageNode = await figma.getNodeByIdAsync(newPageInfo.id);
  if (!newPageNode) throw new Error('Failed to create new page');
  // Clone all children into new page
  const { clone_node } = await import('../layout/layout-clone.js');
  const clonedIds = [];
  for (const child of originalPage.children) {
    const { newNodeIds } = await clone_node({
      nodeId: child.id,
      parentId: newPageNode.id
    });
    clonedIds.push(...newNodeIds);
  }
  return { newPageId: newPageNode.id, newPageName: newPageNode.name, clonedIds };
}
