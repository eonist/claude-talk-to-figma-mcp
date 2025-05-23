import { filterFigmaNode } from "./../../utils/filter-node.js";
import { logger } from "../../utils/logger.js";
import { ensureNodeIdIsString } from "../../utils/node-utils.js";
import { sendCommandToFigma, getCurrentChannel, isConnectedToFigma } from "../../server/websocket.js";
import type { FigmaCommand } from "./../../types/commands.js";

/**
 * Core FigmaClient class with basic connectivity and command dispatch.
 */

export class FigmaClient {
  // Methods are mixed in at runtime via Object.assign; explicit type declarations omitted for flexibility.

  // Methods are mixed in at runtime via Object.assign; explicit type declarations omitted for flexibility.

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
// NOTE: There's a potential issue with method conflicts between the main FigmaClient class
// and the methods defined in command modules. In particular, methods like setFillColor
// and setStrokeColor are defined in both the main class and in writeCommands.
// This can lead to the "figmaClient.setFillColor is not a function" error.
// The recommended solution is to rely only on methods from command modules and avoid
// duplicating them in the main class to maintain consistent architecture.
import { textCommands } from "./text-commands.js";
import { effectCommands } from "./effect-commands.js";
import { gradientCommands } from "./gradient-commands.js";
import { miscCommands } from "./misc-commands.js";
import { layoutCommands } from "./layout-commands.js";
import { variableCommands } from "./variable-commands.js";
import { shapeCommands } from "./shape-commands.js";
import { styleCommands } from "./style-commands.js";
import { nodeCommands } from "./node-commands.js";

Object.assign(
  FigmaClient.prototype,
  textCommands,
  effectCommands,
  gradientCommands,
  miscCommands,
  layoutCommands,
  variableCommands,
  shapeCommands,
  styleCommands,
  nodeCommands
);
