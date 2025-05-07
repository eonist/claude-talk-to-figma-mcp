/**
 * Utils operations module.
 * Consolidates plugin utility functions for state management, binary encoding, and general helpers.
 *
 * Exposed submodules:
 * - plugin: State/configuration and progress updates
 * - encoding: Base64 encoding for binary data
 * - helpers: Delay, ID generation, unique filtering, and text setting utilities
 *
 * @module modules/utils
 */

// Re-export all utilities for build compatibility
/**
 * @example
 * // Import all utility functions
 * import * as utils from './utils';
 * utils.delay(1000).then(() => console.log('Delayed'));
 */
export * from './plugin.js';
export * from './encoding.js';
export * from './helpers.js';
