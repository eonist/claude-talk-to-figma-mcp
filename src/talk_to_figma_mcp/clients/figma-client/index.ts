import { filterFigmaNode } from "../../utils/node-filter.js";
import { logger } from "../../utils/logger.js";
import { ensureNodeIdIsString } from "../../utils/node-utils.js";
import { sendCommandToFigma, getCurrentChannel, isConnectedToFigma } from "../../server/websocket.js";
import type { FigmaCommand } from "./types.ts";

/**
 * Core FigmaClient class with basic connectivity and command dispatch.
 */
export class FigmaClient {
  isConnected(): boolean {
    return isConnectedToFigma();
  }

  getCurrentChannel(): string | null {
    return getCurrentChannel();
  }

  async executeCommand(command: FigmaCommand, params: any = {}): Promise<any> {
    try {
      logger.debug(`Executing Figma command: ${command}`);
      return await sendCommandToFigma(command, params);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error(`Error executing Figma command ${command}: ${msg}`);
      throw error;
    }
  }
}

// Mixin command groups onto the prototype
import { readCommands } from "./read-commands.ts";
import { writeCommands } from "./write-commands.ts";
import { textCommands } from "./text-commands.ts";
import { effectCommands } from "./effect-commands.ts";
import { miscCommands } from "./misc-commands.ts";

Object.assign(
  FigmaClient.prototype,
  readCommands,
  writeCommands,
  textCommands,
  effectCommands,
  miscCommands
);
