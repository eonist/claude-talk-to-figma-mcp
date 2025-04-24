/**
 * Servidor MCP (Model Context Protocol)
 * 
 * Inicializa y gestiona el servidor MCP para Claude Talk to Figma
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from '../../utils/logger';
import { SERVER_NAME, SERVER_VERSION } from '../../config/config';

/**
 * Clase que encapsula la funcionalidad del servidor MCP
 */
export class FigmaMcpServer {
  private server: McpServer;
  private started: boolean = false;

  /**
   * Constructor del servidor MCP
   */
  constructor() {
    this.server = new McpServer({
      name: SERVER_NAME,
      version: SERVER_VERSION,
    });
  }

  /**
   * Obtiene la instancia del servidor MCP
   */
  getServer(): McpServer {
    return this.server;
  }

  /**
   * Registra una nueva herramienta en el servidor MCP
   */
  registerTool(
    name: string, 
    description: string, 
    schema: any, 
    handler: any
  ): void {
    this.server.tool(name, description, schema, handler);
    logger.info(`Herramienta registrada: ${name}`);
  }

  /**
   * Registra un nuevo prompt en el servidor MCP
   */
  registerPrompt(
    name: string,
    description: string,
    handler: any
  ): void {
    this.server.prompt(name, description, handler);
    logger.info(`Prompt registrado: ${name}`);
  }

  /**
   * Inicia el servidor MCP con transporte stdio
   */
  async start(): Promise<void> {
    if (this.started) {
      logger.warn('El servidor MCP ya está iniciado');
      return;
    }

    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      this.started = true;
      logger.info('Servidor FigmaMCP iniciado en stdio');
    } catch (error) {
      logger.error(`Error al iniciar servidor FigmaMCP: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}