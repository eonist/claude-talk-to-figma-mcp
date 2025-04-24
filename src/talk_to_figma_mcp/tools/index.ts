/**
 * Registro centralizado de herramientas MCP para Claude Talk to Figma
 * 
 * Este archivo importa y registra todas las herramientas disponibles
 * en el servidor MCP, organizadas por categorías.
 */

import { FigmaMcpServer } from "../core/server/mcp-server";
import { RequestManager } from "../core/handlers/request-manager";
import { ChannelManager } from "../core/channels/channel-manager";
import { logger } from "../utils/logger";

// Importación de herramientas por categoría
import { registerDocumentTools } from "./document";
import { registerSelectionTools } from "./selection";
import { registerNodeTools } from "./node";
import { registerShapeTools } from "./shape";
import { registerTextTools } from "./text";
import { registerComponentTools } from "./component";
import { registerLayoutTools } from "./layout";
import { registerEffectTools } from "./effect";
import { registerStyleTools } from "./style";

/**
 * Registra todas las herramientas disponibles en el servidor MCP
 * 
 * @param server Instancia del servidor MCP
 * @param requestManager Gestor de solicitudes Figma
 * @param channelManager Gestor de canales
 */
export function registerAllTools(
  server: FigmaMcpServer,
  requestManager: RequestManager,
  channelManager: ChannelManager
): void {
  try {
    logger.info("Comenzando registro de herramientas MCP...");
    
    // Registrar herramientas por categoría
    registerDocumentTools(server, requestManager, channelManager);
    registerSelectionTools(server, requestManager, channelManager);
    registerNodeTools(server, requestManager, channelManager);
    registerShapeTools(server, requestManager, channelManager);
    registerTextTools(server, requestManager, channelManager);
    registerComponentTools(server, requestManager, channelManager);
    registerLayoutTools(server, requestManager, channelManager);
    registerEffectTools(server, requestManager, channelManager);
    registerStyleTools(server, requestManager, channelManager);
    
    logger.info("Todas las herramientas MCP registradas con éxito");
  } catch (error) {
    logger.error(`Error al registrar herramientas: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}