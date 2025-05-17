import { getDocumentInfo, getPages, setCurrentPage, createPage } from './document/document-info.js';
import { getSelection } from './document/document-selection.js';
import { getNodeInfo, getNodesInfo, ensureNodeIdIsString } from './document/document-node.js';
import { getCssAsync } from './document/document-css.js';

export const documentOperations = {
  getDocumentInfo,
  getSelection,
  getNodeInfo,
  getNodesInfo,
  ensureNodeIdIsString,
  getCssAsync,
  getPages,
  setCurrentPage,
  createPage
};
