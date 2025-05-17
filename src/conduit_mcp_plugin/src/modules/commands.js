/**
 * Command registry and handler module for the Conduit MCP Figma plugin.
 * This file acts as a facade, delegating all command logic to the split modules in ./commands/.
 *
 * Exposed functions:
 * - registerCommand(name: string, fn: Function): void
 * - initializeCommands(): void
 * - handleCommand(commandName: string, params: any): Promise<any>
 * - commandOperations: { initializeCommands, handleCommand }
 *
 * @module modules/commands
 * @see {@link ./commands/commands-register.js}
 * @example
 * import { initializeCommands, handleCommand } from './modules/commands.js';
 * initializeCommands();
 * const info = await handleCommand('get_document_info', {});
 * console.log(info);
 */

import { registerCommand, initializeCommands, handleCommand, commandOperations } from './commands/commands-register.js';

globalThis.registerCommand = registerCommand;
globalThis.initializeCommands = initializeCommands;
globalThis.handleCommand = handleCommand;
globalThis.commandOperations = commandOperations;

export { registerCommand, initializeCommands, handleCommand, commandOperations };
