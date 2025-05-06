/**
 * Parses command-line arguments for the Talk to Figma MCP server.
 */

const args = process.argv.slice(2);
const serverArg = args.find(arg => arg.startsWith('--server='));
const portArg = args.find(arg => arg.startsWith('--port='));
const reconnectArg = args.find(arg => arg.startsWith('--reconnect-interval='));

export const serverUrl: string = serverArg ? serverArg.split('=')[1] : 'localhost';
export const port: number = portArg ? parseInt(portArg.split('=')[1], 10) : 3055;
export const reconnectInterval: number = reconnectArg ? parseInt(reconnectArg.split('=')[1], 10) : 2000;
