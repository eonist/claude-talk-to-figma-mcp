/**
 * Document operations module.
 * Provides functions to retrieve document info, selection, node info, CSS, and manage pages in Figma via MCP.
 *
 * @module modules/document
 * @see {@link ./document/document-info.js}
 * @see {@link ./document/document-selection.js}
 * @see {@link ./document/document-node.js}
 * @see {@link ./document/document-css.js}
 */

/**
 * Collection of document operation functions for Figma.
 * @namespace documentOperations
 * @property {function} getDocumentInfo - Get document metadata.
 * @property {function} getSelection - Get current selection.
 * @property {function} getNodeInfo - Get info for a single node.
 * @property {function} getNodesInfo - Get info for multiple nodes.
 * @property {function} ensureNodeIdIsString - Ensure node ID is a string.
 * @property {function} getCssAsync - Get CSS for a node.
 * @property {function} getPages - Get all pages in the document.
 * @property {function} setCurrentPage - Set the current active page.
 * @property {function} createPage - Create a new page.
 */
import { getDocumentInfo, getPages, setCurrentPage, createPage } from './document/document-info.js';
import { getSelection, setSelection } from './document/document-selection.js';
import { getNodeInfo, getNodesInfo, ensureNodeIdIsString } from './document/document-node.js';
import { getCssAsync } from './document/document-css.js';

export const documentOperations = {
  getDocumentInfo,
  getSelection,
  setSelection,
  getNodeInfo,
  getNodesInfo,
  ensureNodeIdIsString,
  getCssAsync,
  getPages,
  setCurrentPage,
  createPage
};
