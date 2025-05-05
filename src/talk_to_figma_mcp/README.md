# Talk to Figma MCP Server

This project implements the Talk to Figma MCP Server, which provides a Model Context Protocol (MCP) interface for interacting with Figma. The server uses WebSocket and stdio transports to relay commands between Figma and models (e.g., Claude), enabling capabilities such as document inspection, element modification, and real-time communication.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Commands](#commands)
- [Development](#development)
- [License](#license)

## Overview

The Talk to Figma MCP Server connects to a Figma document and listens for commands from tools and AI models. It handles WebSocket connections, error recovery, command processing, and dispatching responses via stdio. The server also manages settings such as the backend server port and supports auto-reconnection strategies.

## Features

- **Real-time Communication:** Uses WebSocket for persistent Figma connectivity.
- **Command Handling:** Processes a variety of commands to inspect, create, and modify Figma document elements.
- **Robust Error Handling:** Implements reconnection logic with exponential backoff.
- **Transport Options:** Connects via stdio for secure, local communication.
- **Modular Architecture:** Command registration and utility modules ease maintainability and extensibility.

## Prerequisites

- [Bun](https://bun.sh) (latest version)
- A Figma account for testing
- Internet connectivity (for accessing Figma APIs and WebSocket services)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/anthropics/claude-talk-to-figma-mcp.git
    ```

2. Navigate to the project directory:
    ```bash
    cd claude-talk-to-figma-mcp
    ```

3. Install dependencies:
    ```bash
    bun install
    ```

## Configuration

The server can be configured via command line arguments:

- `--server=<server_url>`: Specify the Figma server URL (default: `localhost`)
- `--port=<port_number>`: Specify the port number for WebSocket connection (default: `3055`)
- `--reconnect-interval=<milliseconds>`: Set the base interval for reconnection attempts (default: `2000` ms)

Example:
```bash
node src/talk_to_figma_mcp/server.ts --server=localhost --port=3055 --reconnect-interval=2000
```

## Usage

Once your environment is set up and the dependencies are installed, you can start the server:

```bash
bun socket
```

The server will attempt to connect to Figma and log messages to the console. Errors and connection statuses are handled automatically.

## Build

Build TypeScript files to JavaScript in the dist folder:

```bash
bun install
bun run build
bun socket
```

If you want to continuously rebuild as you make changes to the TypeScript files, you can use:

```bash
bun run build:watch
```

And if you need to build both the TypeScript server and the Figma plugin:

```bash
bun run build:all
```


## Commands

The server supports multiple commands which are registered on startup. These include, but are not limited to:

- **Document Inspection:** Retrieve detailed document structure and node information.
- **Element Creation:** Create and modify elements within a Figma document.
- **Settings Update:** Persist and update settings such as server port.
- **Bulk Styling:** Apply fill and/or stroke styles to multiple nodes (`set_styles(entries)`).
- **Bulk Resize:** Resize multiple nodes with various options (`resize_nodes(nodeIds, dimensions?, targetSize?, scalePercent?, maintainAspectRatio?, resizeMode?)`).
- **Move Nodes:** Reposition multiple nodes simultaneously (`move_nodes(nodeIds, x, y)`).

For detailed command information, check the `src/talk_to_figma_mcp/commands/` directory.

## Development

- **Structure:**  
  The project is modularized into several components:
  - `server.ts`: Main entry point for the MCP server.
  - `commands/`: Contains implementations of different Figma commands.
  - `utils/`: Shared utilities, logging, WebSocket connection handlers, and type definitions.
  
- **Testing:**  
  Unit tests are encouraged for individual modules. You can add tests using your preferred testing framework (e.g., Jest).

- **Logging:**  
  The server uses a custom logger that prints messages to stderr. Review `src/talk_to_figma_mcp/utils/logger.js` for details.

## License

This project is licensed under the [MIT License](LICENSE).
