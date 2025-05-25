/**
 * Type declarations for FigmaClient methods mixed in at runtime.
 * This file augments the FigmaClient interface with method signatures
 * for commands implemented in separate modules and mixed into the class.
 * 
 * This helps TypeScript recognize these methods and avoid type errors.
 */

import type { MCP_COMMANDS } from "../../types/commands.js";

export interface FigmaClient {
  /**
   * Add or delete one or more guides on the current Figma page.
   * @param params Guide operation parameters
   */
  setGuide(params: any): Promise<any>;

  /**
   * Create, update, or delete one or more layout grids on Figma nodes.
   * @param params Grid operation parameters
   */
  setGrid(params: any): Promise<any>;
}
