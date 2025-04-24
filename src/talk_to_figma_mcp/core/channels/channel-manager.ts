/**
 * Gestor de canales para Claude Talk to Figma MCP
 * 
 * Gestiona la comunicación a través de canales específicos en Figma
 */

import { WebSocketClient } from '../websocket/websocket-client';
import { logger } from '../../utils/logger';
import { DEFAULT_CHANNEL } from '../../config/config';

/**
 * Clase para gestionar los canales de comunicación en Figma
 */
export class ChannelManager {
  private wsClient: WebSocketClient;
  
  /**
   * Constructor del gestor de canales
   */
  constructor(wsClient: WebSocketClient) {
    this.wsClient = wsClient;
  }

  /**
   * Obtiene el canal actual
   */
  getCurrentChannel(): string | null {
    return this.wsClient.getCurrentChannel();
  }
  
  /**
   * Une a un canal específico
   */
  async joinChannel(channelName: string = DEFAULT_CHANNEL): Promise<void> {
    try {
      await this.wsClient.joinChannel(channelName);
      logger.info(`Unido al canal: ${channelName || 'predeterminado'}`);
    } catch (error) {
      logger.error(`Error al unirse al canal ${channelName}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Verifica si un canal está activo
   */
  isChannelActive(channelName: string): boolean {
    return this.wsClient.getCurrentChannel() === channelName;
  }

  /**
   * Verifica si algún canal está activo
   */
  hasActiveChannel(): boolean {
    return this.wsClient.getCurrentChannel() !== null;
  }
}