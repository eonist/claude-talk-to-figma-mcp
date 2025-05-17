/**
 * Document info operations for Figma.
 * Exports: getDocumentInfo, getPages, setCurrentPage, createPage
 */

/**
 * Retrieves detailed information about the current Figma page and its contents.
 */
export async function getDocumentInfo() {
  const page = figma.currentPage;
  return {
    name: page.name,
    id: page.id,
    type: "PAGE",
    children: page.children.map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type || "UNKNOWN",
    })),
    currentPage: {
      id: page.id,
      name: page.name,
      childCount: page.children.length,
    },
    pages: [
      {
        id: page.id,
        name: page.name,
        childCount: page.children.length,
      },
    ],
  };
}

/**
 * Gets information about all pages in the document.
 * @returns {Array} An array of page information objects.
 */
export async function getPages() {
  const pages = figma.root.children;
  return pages.map(page => ({
    id: page.id,
    name: page.name,
    childCount: (page.children ? page.children.length : 0)
  }));
}

/**
 * Sets the current active page in the document.
 * @param {string} pageId - The ID of the page to make active.
 * @returns {Object} Information about the newly active page.
 * @throws {Error} If the page with the given ID is not found or is not a page.
 */
export async function setCurrentPage(pageId) {
  const id = String(pageId);
  const page = await figma.getNodeByIdAsync(id);

  if (!page || page.type !== 'PAGE') {
    throw new Error(`Node with ID ${id} is not a page`);
  }

  figma.currentPage = page;

  return {
    id: page.id,
    name: page.name,
    childCount: (page.children ? page.children.length : 0)
  };
}

/**
 * Creates a new page in the document.
 * @param {string} [name="New Page"] - The name for the new page.
 * @returns {Object} Information about the newly created page.
 */
export async function createPage(name = "New Page") {
  const page = figma.createPage();
  page.name = name;

  return {
    id: page.id,
    name: page.name,
    childCount: 0
  };
}
