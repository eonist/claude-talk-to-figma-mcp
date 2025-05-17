# Conduit MCP Server

## Smithery Integration (`smithery.yaml`)

This repository includes a `smithery.yaml` file at the project root to enable integration with [Smithery](https://smithery.ai/). Smithery uses this configuration to determine how to start the MCP server for local development or agent integration.

### What is `smithery.yaml`?

- `smithery.yaml` defines the command Smithery will use to launch the MCP server.
- It specifies the CLI tool (e.g., `bunx`, `npx`) and the arguments (e.g., `conduit-design@latest`) to run the server, either from the published npm package or from local source.

### Example configuration

```yaml
startCommand:
  type: stdio
  configSchema: {}
  commandFunction: |-
    (config) => ({
      command: 'bunx',
      args: ['conduit-design@latest']
    })
```

- This example will run the latest published version of the Conduit MCP server from npm using Bun.

### Usage

- **To use the published npm package:**  
  Set `command: 'bunx'` and `args: ['conduit-design@latest']` in `smithery.yaml`.
- **To use your local development version:**  
  Set `command: 'bun'` and `args: ['socket']` to run the server from your local source code.

### When to update

- Update `smithery.yaml` if you change the way the server is started, or if you want to switch between using the npm package and your local codebase.
- Make sure the configuration matches your intended workflow and the instructions in the main project readme.

For more details, see the [Smithery documentation](https://smithery.ai/docs/config#smitheryyaml).
This project implements the Conduit MCP Server, which provides a Model Context Protocol (MCP) interface for interacting with Figma. The server uses WebSocket and stdio transports to relay commands between Figma and models (e.g., Claude), enabling capabilities such as document inspection, element modification, and real-time communication.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Build](#build)
- [Commands](#commands)
- [Development](#development)
- [License](#license)

## Overview

The Conduit MCP Server connects to a Figma document and listens for commands from tools and AI models. It handles WebSocket connections, error recovery, command processing, and dispatching responses via stdio. The server also manages settings such as the backend server port and supports auto-reconnection strategies.

## Features

- **Real-time Communication:** Uses WebSocket for persistent Figma connectivity.
- **Command Handling:** Processes a variety of commands to inspect, create, and modify Figma document elements.
- **Robust Error Handling:** Implements reconnection logic with exponential backoff.
- **Transport Options:** Connects via stdio for secure, local communication.
- **Modular Architecture:** Command registration and utility modules ease maintainability and extensibility.
- **CSS Extraction:** Extract and format CSS properties from Figma elements via `get_css_async`.
- **HTML Generation:** Generate HTML structure from Figma nodes with `generate_html`.
- **Comprehensive Styling:** Apply fills, strokes, gradients, and effects to Figma elements.
- **Advanced Layout:** Work with auto layout and positioning tools for precise design.

## Prerequisites

- [Bun](https://bun.sh) (latest version)
- A Figma account for testing
- Internet connectivity (for accessing Figma APIs and WebSocket services)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/eonist/conduit.git
    ```

2. Navigate to the project directory:
    ```bash
    cd conduit
    ```

3. Install dependencies:
    ```bash
    bun install
    ```

---

### Running the MCP Server with Docker

A `Dockerfile` is provided to run the Conduit MCP Server in a containerized environment.

- **Base Image:** Uses the official Bun image (`oven/bun:latest`)
- **Dependencies:** Installs all dependencies with `bun install`
- **Port:** Exposes port `3055` for the server
- **Startup:** Runs `bun src/conduit_mcp_server/server.ts` on container start

**To build and run the server with Docker:**
```bash
# Build the Docker image
docker build -t conduit-mcp-server .

# Run the container
docker run -p 3055:3055 conduit-mcp-server
```

This will start the MCP server inside a Docker container, listening on port 3055.

---

### Using Latest Commit vs. Tagged Version for Server Path

> **Note:**  
> Using `@latest` in your MCP server config will fetch the latest tagged version from npm, not the latest commit. To always use the latest commit, use a direct GitHub or git+https URL as shown below.

**Option 1: Direct GitHub Tarball (latest commit on main)**
```json
{
  "mcpServers": {
    "ConduitMCPServer": {
      "command": "bunx",
      "args": ["https://github.com/eonist/conduit/tarball/main"]
    }
  }
}
```

**Option 2: Git URL with Branch Reference**
```json
{
  "mcpServers": {
    "ConduitMCPServer": {
      "command": "bunx",
      "args": ["git+https://github.com/eonist/conduit.git#main"]
    }
  }
}
```

**Automation:**  
To keep your server always up-to-date with the latest commit, consider using a script or tool to periodically update your configuration.

> ⚠️ **Warning:**  
> Using the latest commit may introduce instability, as these commits may not be fully tested.

**References:**  
- [Perplexity: How to use npm with latest commit](https://www.perplexity.ai/search/pplx.ai/share)

---

## Configuration

The server can be configured via command line arguments:

- `--server=<server_url>`: Specify the Figma server URL (default: `localhost`)
- `--port=<port_number>`: Specify the port number for WebSocket connection (default: `3055`)
- `--reconnect-interval=<milliseconds>`: Set the base interval for reconnection attempts (default: `2000` ms)

Example:
```bash
node src/conduit_mcp_server/server.ts --server=localhost --port=3055 --reconnect-interval=2000
```

## Usage

Once your environment is set up and the dependencies are installed, you can start the server:

```bash
# Start the MCP server
bun start

# Or if you need to run just the socket server
bun socket
```

The server will attempt to connect to Figma and log messages to the console. Errors and connection statuses are handled automatically.

To use with an AI Agent:
1. Install the Conduit MCP Figma plugin in your Figma account
2. Connect An AI Agent to the MCP server
3. Start creating and modifying Figma elements through the AI agent

## Build

Build TypeScript files to JavaScript in the dist folder:

```bash
# Install dependencies
bun install

# Build the server
bun run build

# Build both server and plugin
bun run build:all

# Build just the plugin UI
bun run build:ui

# Build just the plugin code
bun run build:plugin
```

For development with automatic rebuilding:

```bash
# Watch and rebuild server on changes
bun run build:watch

# Watch and rebuild plugin on changes
bun run watch:plugin

# Watch both simultaneously
bun run dev:all
```

## Commands

The Conduit MCP Server supports a comprehensive set of commands for working with Figma. These are organized into several categories. For full parameter details and examples, see [Available_MCP_Commands.md](../../Available_MCP_Commands.md).

---

## Development

- **Structure:**  
  The project is modularized into several components:
  - `server.ts`: Main entry point for the MCP server.
  - `commands/`: Contains implementations of different Figma commands.
  - `utils/`: Shared utilities, logging, WebSocket connection handlers, and type definitions.
  - `clients/`: API clients for communicating with Figma.
  - `types/`: TypeScript type definitions.
  
- **Adding New Commands:**  
  1. Create a new command implementation in the appropriate module under `commands/`
  2. Register the command in `commands/index.ts`
  3. Add TypeScript types in `types/` if needed
  4. Update this documentation to include the new command

- **Logging:**  
  The server uses a custom logger that prints messages to stderr. Review `src/conduit_mcp_server/utils/logger.ts` for details.

## MCP Host config:

**Local MCP host config:**

Use bun for command (npm can work too)

```yaml
 "ConduitMCPServerLocalDep": {
    "command": "bun",
    "args": [
      "/Users/<user-name>/conduit/src/conduit_mcp_server/dist/server.js"
    ]
}
```

**Remote MCP host config:**

Use bunx or npx for command. 

```yaml
"ConduitMCPServerRemoteDep": {
  "command": "bunx",
  "args": [
    "conduit-design@latest"
  ]
}
```


## License

This project is licensed under the [MIT License](LICENSE).
