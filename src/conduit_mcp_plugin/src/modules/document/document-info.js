/**
 * Document info operations for Figma.
 * Exports: getDocumentInfo, getPages, setCurrentPage, createPage
 */

/**
 * Retrieves detailed information about the current Figma page and its contents.
 *
 * @async
 * @function
 * @returns {Promise<Object>} An object containing information about the current page, its children, and summary info.
 * @property {string} name - Name of the current page.
 * @property {string} id - ID of the current page.
 * @property {string} type - Always "PAGE".
 * @property {Array<Object>} children - Array of child node info ({id, name, type}).
 * @property {Object} currentPage - Info about the current page ({id, name, childCount}).
 * @property {Array<Object>} pages - Array with info about the current page ({id, name, childCount}).
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
 *
 * @async
 * @function
 * @returns {Promise<Array<{id: string, name: string, childCount: number}>>} An array of page information objects.
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
 *
 * @async
 * @function
 * @param {string} pageId - The ID of the page to make active.
 * @returns {Promise<{id: string, name: string, childCount: number}>} Information about the newly active page.
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
 *
 * @async
 * @function
 * @param {string} [name="New Page"] - The name for the new page.
 * @returns {Promise<{id: string, name: string, childCount: number}>} Information about the newly created page.
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
