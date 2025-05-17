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

### Document and Information

- `get_document_info` – Get detailed information about the current Figma document
- `get_selection` – Get information about the current selection in Figma
- `get_node_info` – Get detailed information about a specific node
- `get_nodes_info` – Get detailed information about multiple nodes
- `get_styles` – Get all styles from the document
- `get_local_components` – Get all local components
- `get_team_components` – Get components from a Figma team library
- `get_remote_components` – Get available components from team libraries
- `get_styled_text_segments` – Get text segments with specific styling
- `scan_text_nodes` – Scan all text nodes in the selected node
- `get_css_async` – Get CSS properties from a node
- `get_pages` – Get all pages in the current Figma document
- `set_current_page` – Set the current active page in Figma

### Creation

- **Shapes:**
  - `create_rectangle` / `create_rectangles` – Create one or more rectangles
  - `create_frame` / `create_frames` – Create one or more frames
  - `create_line` / `create_lines` – Create one or more lines
  - `create_ellipse` / `create_ellipses` – Create one or more ellipses
  - `create_polygon` / `create_polygons` – Create one or more polygons
  - `create_vector` / `create_vectors` – Create one or more vectors
  - `create_star` / `create_stars` – Create one or more stars

- **Text:**
  - `create_text` / `create_texts` – Create one or more text elements
  - `create_bounded_text` / `create_bounded_texts` – Create one or more bounded text boxes
  - `set_text_content` – Set text content of an existing node
  - `set_multiple_text_contents` – Set multiple text contents

- **Components:**
  - `create_component_from_node` / `create_components_from_nodes` – Convert one or more nodes to components
  - `create_component_instance` / `create_component_instances` – Create one or more component instances
  - `create_button` – Create a complete button

- **Images and SVG:**
  - `insert_image` / `insert_images` – Insert one or more images from URLs
  - `insert_local_image` / `insert_local_images` – Insert one or more local images
  - `insert_svg_vector` / `insert_svg_vectors` – Insert one or more SVG vectors

- **Pages:**
  - `create_page` – Create a new page

### Styling and Modification

- **Basic Styling:**
  - `set_fill_color` – Set fill color
  - `set_stroke_color` – Set stroke color
  - `set_style` – Set both fill and stroke (single or batch)

- **Gradients:**
  - `create_gradient_variable` – Create one or more gradient styles
  - `apply_gradient_style` / `apply_gradient_styles` – Apply one or more gradient styles
  - `apply_direct_gradient` – Apply gradient directly

- **Text Styling:**
  - `set_font_name` – Set font name and style
  - `set_font_size` – Set font size
  - `set_font_weight` – Set font weight
  - `set_letter_spacing` – Set letter spacing
  - `set_line_height` – Set line height
  - `set_paragraph_spacing` – Set paragraph spacing
  - `set_text_case` – Set text case
  - `set_text_decoration` – Set text decoration
  - `load_font_async` – Load a font asynchronously

- **Effects and Layout:**
  - `set_effects` – Set visual effects
  - `set_effect_style_id` – Apply an effect style
  - `set_auto_layout` – Configure auto layout
  - `set_auto_layout_resizing` – Set hug or fill sizing mode
  - `set_corner_radius` – Set corner radius

### Transformations and Management

- **Positioning and Sizing:**
  - `move_node` / `move_nodes` – Move one or more nodes
  - `resize_node` / `resize_nodes` – Resize one or more nodes
  - `flatten_node` / `flatten_nodes` – Flatten one or more nodes
  - `flatten_selection` – Flatten a selection of nodes

- **Boolean Operations:**
  - `union_selection` – Union selected shapes
  - `subtract_selection` – Subtract shapes
  - `intersect_selection` – Intersect shapes
  - `exclude_selection` – Exclude overlapping areas

- **Node Management:**
  - `group_nodes` – Group nodes
  - `ungroup_nodes` – Ungroup a node
  - `delete_node` / `delete_nodes` – Delete one or more nodes
  - `clone_node` / `clone_nodes` – Clone one or more nodes
  - `insert_child` / `insert_children` – Insert one or more child nodes into parents
  - `detach_instance` / `detach_instances` – Detach one or more component instances

- **Naming:**
  - `rename_layer` / `rename_layers` / `rename_multiple` – Rename nodes (single, batch, or with distinct names)
  - `ai_rename_layers` – AI-powered renaming

### Export and Conversion

- `export_node_as_image` – Export a node as an image
- `generate_html` – Generate HTML structure from Figma nodes

### Communication

- `join_channel` – Join a specific communication channel

---

**For full parameter details, examples, and the most up-to-date list, see [Available_MCP_Commands.md](../../Available_MCP_Commands.md).**
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
