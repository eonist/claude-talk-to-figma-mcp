#!/usr/bin/env node
/**
 * Claude Talk to Figma MCP - Main Server
 * 
 * Entry point that initializes and connects all system components
 */

import { WebSocketClient } from './core/websocket/websocket-client';
import { ChannelManager } from './core/channels/channel-manager';
import { RequestManager } from './core/handlers/request-manager';
import { FigmaMcpServer } from './core/server/mcp-server';
import { logger } from './utils/logger';
import { parseCommandLineArgs } from './utils/helpers';
import { registerAllTools } from './tools';
import { registerAllPrompts } from './prompts';
import { LogLevel } from './config/config';

// Process command line arguments
const args = parseCommandLineArgs(process.argv.slice(2));
const serverUrl = typeof args.server === 'string' ? args.server : 'localhost';
const port = typeof args.port === 'number' ? args.port : 3055;
const reconnectInterval = typeof args['reconnect-interval'] === 'number' ? args['reconnect-interval'] : 2000;
const debugMode = args.debug === true;

/**
 * Main function that initializes all components and starts the server
 */
async function main() {
  try {
    // Configure log level based on debug mode
    if (debugMode) {
      logger.setLevel(LogLevel.DEBUG);
      logger.debug('Debug mode activated');
    }

    logger.info('Starting Claude Talk to Figma MCP...');
    
    // Initialize WebSocket client
    const wsClient = new WebSocketClient(serverUrl, port, reconnectInterval);
    
    // Initialize channel manager
    const channelManager = new ChannelManager(wsClient);
    
    // Initialize request manager
    const requestManager = new RequestManager(wsClient, channelManager);
    
    // Initialize MCP server
    const server = new FigmaMcpServer();
    
    // Register all tools using our modular structure
    logger.info('Registering tools...');
    registerAllTools(server, requestManager, channelManager);
    
    // Register all prompts using our modular structure
    logger.info('Registering prompts...');
    registerAllPrompts(server);
    
    // Connect to WebSocket server
    logger.info('Connecting to WebSocket server...');
    wsClient.connect();
    
    // Start MCP server
    logger.info('Starting MCP server...');
    await server.start();
    
    logger.info('Claude Talk to Figma MCP server initialized successfully');
    
  } catch (error) {
    logger.error(`Error starting Claude Talk to Figma MCP: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Execute main function
main().catch(error => {
  logger.error(`Unhandled error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

