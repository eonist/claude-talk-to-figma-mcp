/**
 * Gestor de solicitudes para Claude Talk to Figma MCP
 * 
 * Maneja las solicitudes y respuestas entre la API de Claude y Figma
 */

import { WebSocketClient } from '../websocket/websocket-client';
import { logger } from '../../utils/logger';
import { FigmaCommand } from '../../types';
import { ChannelManager } from '../channels/channel-manager';

/**
 * Clase para gestionar las solicitudes a Figma
 */
export class RequestManager {
  private wsClient: WebSocketClient;
  private channelManager: ChannelManager;
  
  /**
   * Constructor del gestor de solicitudes
   */
  constructor(wsClient: WebSocketClient, channelManager: ChannelManager) {
    this.wsClient = wsClient;
    this.channelManager = channelManager;
    
    // Escuchar eventos de progreso en comandos
    this.wsClient.on('command_progress', (progressData) => {
      logger.debug(`Progreso de comando ${progressData.commandType}: ${progressData.progress}%`);
    });
  }

  /**
   * Envía un comando a Figma y devuelve la respuesta
   */
  async sendCommand(command: FigmaCommand, params: any = {}, timeoutMs?: number): Promise<any> {
    try {
      // Verificar que estamos en un canal
      if (!this.channelManager.hasActiveChannel() && command !== 'join') {
        logger.warn('No hay un canal activo, intentando unir al canal predeterminado');
        await this.channelManager.joinChannel();
      }
      
      // Enviar el comando y esperar respuesta
      const result = await this.wsClient.sendCommand(command, params, timeoutMs);
      return result;
    } catch (error) {
      logger.error(`Error al enviar comando ${command}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Procesa un nodo de Figma para filtrar información irrelevante
   */
  filterFigmaNode(node: any): any {
    if (!node) return null;
    
    // Omitir nodos de tipo VECTOR que pueden ser muy grandes
    if (node.type === "VECTOR") {
      return null;
    }

    // Crear un objeto filtrado con propiedades esenciales
    const filtered: any = {
      id: node.id,
      name: node.name,
      type: node.type,
    };

    // Procesar propiedades específicas que queremos incluir
    if (node.fills && node.fills.length > 0) {
      filtered.fills = node.fills.map(this.processColorProperty);
    }

    if (node.strokes && node.strokes.length > 0) {
      filtered.strokes = node.strokes.map(this.processColorProperty);
    }

    if (node.cornerRadius !== undefined) {
      filtered.cornerRadius = node.cornerRadius;
    }

    if (node.absoluteBoundingBox) {
      filtered.absoluteBoundingBox = node.absoluteBoundingBox;
    }

    if (node.characters) {
      filtered.characters = node.characters;
    }

    if (node.style) {
      filtered.style = {
        fontFamily: node.style.fontFamily,
        fontStyle: node.style.fontStyle,
        fontWeight: node.style.fontWeight,
        fontSize: node.style.fontSize,
        textAlignHorizontal: node.style.textAlignHorizontal,
        letterSpacing: node.style.letterSpacing,
        lineHeightPx: node.style.lineHeightPx
      };
    }

    // Procesar nodos hijos de forma recursiva
    if (node.children) {
      filtered.children = node.children
        .map((child: any) => this.filterFigmaNode(child))
        .filter((child: any) => child !== null);
    }

    return filtered;
  }

  /**
   * Procesa una propiedad de color para formato legible
   */
  private processColorProperty(prop: any): any {
    if (prop.type === 'SOLID' && prop.color) {
      return {
        ...prop,
        hexColor: RequestManager.rgbaToHex(prop.color)
      };
    }
    return prop;
  }

  /**
   * Convierte un color RGBA a formato hexadecimal
   */
  static rgbaToHex(color: any): string {
    if (!color || typeof color !== 'object') return '';
    
    const r = Math.round((color.r || 0) * 255);
    const g = Math.round((color.g || 0) * 255);
    const b = Math.round((color.b || 0) * 255);
    const a = Math.round((color.a || 1) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${a === 255 ? '' : a.toString(16).padStart(2, '0')}`;
  }
}