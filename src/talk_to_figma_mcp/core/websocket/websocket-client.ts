/**
 * Cliente WebSocket para comunicación con Figma
 * 
 * Gestiona la conexión, reconexión y envío/recepción de mensajes con el plugin de Figma
 */

import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';
import { 
  WS_DEFAULT_PORT, 
  WS_RECONNECT_INTERVAL,
  WS_CONNECTION_TIMEOUT,
  WS_REQUEST_TIMEOUT
} from '../../config/config';
import { FigmaCommand, FigmaResponse, PendingRequest } from '../../types';

/**
 * Cliente WebSocket que gestiona la comunicación con Figma
 */
export class WebSocketClient extends EventEmitter {
  // Connection properties
  private ws: WebSocket | null = null;
  private serverUrl: string;
  private port: number;
  private reconnectInterval: number;
  
  // Request tracking
  private pendingRequests = new Map<string, PendingRequest>();
  
  // Channel tracking
  private currentChannel: string | null = null;

  /**
   * Constructor del cliente WebSocket
   */
  constructor(
    serverUrl: string = 'localhost',
    port: number = WS_DEFAULT_PORT,
    reconnectInterval: number = WS_RECONNECT_INTERVAL
  ) {
    super();
    this.serverUrl = serverUrl;
    this.port = port;
    this.reconnectInterval = reconnectInterval;
  }

  /**
   * Conecta al servidor WebSocket
   */
  connect(): void {
    // Si ya está conectado, no hacer nada
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      logger.info('Ya conectado a Figma');
      return;
    }

    // Si la conexión está en progreso, esperar
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      logger.info('Conexión a Figma ya está en progreso');
      return;
    }

    // Limpiar socket existente si está en estado de cierre
    if (this.ws && (this.ws.readyState === WebSocket.CLOSING || this.ws.readyState === WebSocket.CLOSED)) {
      this.ws.removeAllListeners();
      this.ws = null;
    }

    const wsUrl = this.serverUrl === 'localhost' 
      ? `ws://${this.serverUrl}:${this.port}`
      : `wss://${this.serverUrl}`;
    
    logger.info(`Conectando a servidor socket Figma en ${wsUrl}...`);
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      // Agregar timeout de conexión
      const connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          logger.error('Timeout de conexión alcanzado');
          this.ws.terminate();
          // Intentar reconectar después de un retraso
          setTimeout(() => this.connect(), this.reconnectInterval);
        }
      }, WS_CONNECTION_TIMEOUT);
      
      this.ws.on('open', () => {
        clearTimeout(connectionTimeout);
        logger.info('Conectado a servidor socket Figma');
        this.emit('connected');
        
        // Reconectar al canal anterior si existía
        if (this.currentChannel) {
          this.joinChannel(this.currentChannel).catch(error => {
            logger.error(`Error al reconectar al canal: ${error instanceof Error ? error.message : String(error)}`);
          });
        }
      });

      this.ws.on('message', (data: any) => {
        let message;
        try {
          const textData = data.toString();
          message = JSON.parse(textData);
          logger.debug(`Mensaje recibido: ${textData}`);
          
          // Procesar respuesta
          if (message.id && this.pendingRequests.has(message.id)) {
            const request = this.pendingRequests.get(message.id)!;
            
            // Actualizar timestamp de actividad
            request.lastActivity = Date.now();
            
            // Si es una respuesta final (no una actualización de progreso)
            if (!message.type || message.type !== 'command_progress') {
              clearTimeout(request.timeout);
              this.pendingRequests.delete(message.id);
              
              if (message.error) {
                request.reject(message.error);
              } else {
                request.resolve(message.result);
              }
            } 
            // Si es una actualización de progreso
            else if (message.type === 'command_progress') {
              this.emit('command_progress', message);
            }
          }
          
          // Emitir evento para otros oyentes
          this.emit('message', message);
        } catch (error) {
          logger.error(`Error al procesar mensaje: ${error instanceof Error ? error.message : String(error)}`);
        }
      });

      this.ws.on('error', (error) => {
        clearTimeout(connectionTimeout);
        logger.error(`Error en WebSocket: ${error.message}`);
        this.emit('error', error);
      });

      this.ws.on('close', (code, reason) => {
        logger.warn(`Conexión WebSocket cerrada: ${code} ${reason}`);
        this.emit('disconnected', { code, reason });
        
        // Rechazar todas las peticiones pendientes
        for (const [id, request] of this.pendingRequests.entries()) {
          clearTimeout(request.timeout);
          request.reject(new Error('Conexión cerrada'));
          this.pendingRequests.delete(id);
        }
        
        // Intentar reconectar después de un retraso
        setTimeout(() => this.connect(), this.reconnectInterval);
      });
      
    } catch (error) {
      logger.error(`Error al crear conexión WebSocket: ${error instanceof Error ? error.message : String(error)}`);
      // Intentar reconectar después de un retraso
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  /**
   * Desconecta del servidor WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Une a un canal específico
   */
  async joinChannel(channelName: string): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("No conectado a Figma");
    }

    try {
      // No usar sendCommand para el comando join, enviar directamente en el formato
      // que espera el servidor socket.ts
      return new Promise<void>((resolve, reject) => {
        const message = {
          type: "join",
          channel: channelName.trim()
        };
        
        if (this.ws) {
          this.ws.send(JSON.stringify(message));
          logger.info(`Solicitud de unión al canal enviada: ${channelName}`);
          
          // Establecer timeout para la respuesta
          const timeout = setTimeout(() => {
            reject(new Error(`Timeout al unirse al canal ${channelName}`));
          }, WS_REQUEST_TIMEOUT);

          // Configurar un listener de una sola vez para esperar la confirmación
          const joinListener = (data: any) => {
            try {
              const message = JSON.parse(data.toString());
              
              if (message.type === "system" && 
                  message.message && 
                  message.message.result && 
                  message.channel === channelName) {
                // Éxito al unirse al canal
                clearTimeout(timeout);
                this.currentChannel = channelName;
                logger.info(`Unido al canal: ${channelName}`);
                this.emit('channel_joined', channelName);
                this.ws?.removeListener('message', joinListener);
                resolve();
              }
              // Si es un error, también lo manejamos
              else if (message.type === "error") {
                clearTimeout(timeout);
                this.ws?.removeListener('message', joinListener);
                reject(new Error(message.message || "Error al unirse al canal"));
              }
            } catch (error) {
              // No hacemos nada aquí - otros listeners manejarán esto
            }
          };

          this.ws.on('message', joinListener);
        } else {
          reject(new Error("No conectado a Figma"));
        }
      });
    } catch (error) {
      logger.error(`Error al unirse al canal: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Obtiene el canal actual
   */
  getCurrentChannel(): string | null {
    return this.currentChannel;
  }

  /**
   * Envía un comando a Figma
   */
  sendCommand(
    command: FigmaCommand,
    params: unknown = {},
    timeoutMs: number = WS_REQUEST_TIMEOUT
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      // Si no está conectado, intentar conectar primero
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.connect();
        reject(new Error("No conectado a Figma, intentando reconectar"));
        return;
      }

      // Verificar si necesitamos un canal para este comando
      const requiresChannel = command !== "join";
      if (requiresChannel && !this.currentChannel) {
        reject(new Error("No se ha unido a ningún canal"));
        return;
      }

      const id = uuidv4();
      const message = {
        id,
        command,
        params,
      };

      // Establecer un timeout para la solicitud
      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Timeout al esperar respuesta para el comando ${command}`));
        }
      }, timeoutMs);

      // Almacenar la solicitud pendiente
      this.pendingRequests.set(id, {
        resolve,
        reject,
        timeout,
        lastActivity: Date.now(),
      });

      // Enviar el mensaje
      try {
        this.ws.send(JSON.stringify(message));
        logger.debug(`Comando enviado: ${JSON.stringify(message)}`);
      } catch (error) {
        clearTimeout(timeout);
        this.pendingRequests.delete(id);
        reject(error);
      }
    });
  }
}