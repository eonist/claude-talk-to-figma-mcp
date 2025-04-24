/**
 * Herramientas MCP relacionadas con estilos en Figma
 * 
 * Estas herramientas permiten trabajar con estilos de colores,
 * textos y efectos en el documento de Figma.
 */

import { z } from "zod";
import { FigmaMcpServer } from "../../core/server/mcp-server";
import { RequestManager } from "../../core/handlers/request-manager";
import { ChannelManager } from "../../core/channels/channel-manager";
import { logger } from "../../utils/logger";

/**
 * Registra herramientas relacionadas con estilos en el servidor MCP
 * 
 * @param server Instancia del servidor MCP
 * @param requestManager Gestor de solicitudes Figma
 * @param channelManager Gestor de canales
 */
export function registerStyleTools(
  server: FigmaMcpServer,
  requestManager: RequestManager,
  channelManager: ChannelManager
): void {
  logger.info("Registrando herramientas de estilos...");

  // Por el momento, no hay herramientas específicas de estilos más allá de
  // get_styles que ya está registrada en document/index.ts
  
  // Este módulo está preparado para futuras implementaciones de herramientas
  // relacionadas con la gestión de estilos, como:
  // - create_style
  // - update_style
  // - delete_style
  // - apply_style
}