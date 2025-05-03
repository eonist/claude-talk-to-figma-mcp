/**
 * @module utils
 * Utility functions for the Claude MCP Figma plugin
 * 
 * This module consolidates all utility functions used throughout the plugin:
 * - Plugin state management and configuration (plugin.js)
 * - Binary data encoding utilities (encoding.js)
 * - General helper functions (helpers.js)
 */

// Re-export all utilities for build compatibility
export * from './plugin.js';
export * from './encoding.js';
export * from './helpers.js';
