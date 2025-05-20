/**
 * Client for interacting with Figma via WebSocket.
 *
 * Provides a structured API for:
 * - Reading document and node information
 * - Creation, modification, and deletion of Figma elements
 * - Style and text operations
 * - Layout and transform operations
 *
 * @module clients/figma-client
 * @example
 * import { FigmaClient } from './figma-client';
 * const client = new FigmaClient();
 * await client.connectToFigma('localhost', 3055, 2000);
 * const info = await client.getDocumentInfo();
 * console.log(info);
 */
import { filterFigmaNode } from "../utils/figma/filter-node.js";
import { logger } from "../utils/logger.js";
import { ensureNodeIdIsString } from "../utils/node-utils.js";
import { FigmaCommand, MCP_COMMANDS } from "../types/commands.js";
import { sendCommandToFigma, getCurrentChannel, isConnectedToFigma } from "../server/websocket.js";
import { BaseFigmaNode, DocumentInfo, RGBAColor, SelectionInfo } from "../types/figma.js";

/**
 * Client for interacting with Figma via WebSocket
 * 
 * Provides a structured API for:
 * - Reading document and node information
 * - Creating and modifying Figma elements
 * - Managing styles and components
 * - Text operations
 * - Layout operations
 */
export class FigmaClient {
  
  /**
   * Executes a command on Figma
   * 
   * @param {FigmaCommand} command - The command to execute
   * @param {any} params - The command parameters
   * @returns {Promise<any>} - The command result
   */
  async executeCommand(command: string, params: any = {}): Promise<any> {
    try {
      logger.debug(`Executing Figma command: ${command}`);
      const result = await sendCommandToFigma(command, params);
      return result;
    } catch (error) {
      logger.error(`Error executing Figma command ${command}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
