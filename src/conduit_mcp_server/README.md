# Conduit MCP Server

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

The server supports an extensive set of commands for working with Figma. These are organized into several categories:

### Document and Information

- `get_document_info()` - Get detailed information about the current Figma document
- `get_selection()` - Get information about the current selection in Figma
- `get_node_info(nodeId)` - Get detailed information about a specific node
- `get_nodes_info(nodeIds)` - Get detailed information about multiple nodes
- `get_styles()` - Get all styles from the document
- `get_local_components()` - Get all local components
- `get_remote_components()` - Get available components from team libraries
- `get_styled_text_segments(nodeId, property)` - Get text segments with specific styling
- `scan_text_nodes(nodeId)` - Scan all text nodes in the selected node
- `get_css_async(nodeId, format)` - Get CSS properties from a node

### Creation

- **Shapes:**
  - `create_rectangle(x, y, width, height, ...)` - Create a rectangle
  - `create_rectangles(rectangles)` - Create multiple rectangles
  - `create_frame(x, y, width, height, ...)` - Create a frame
  - `create_line(x1, y1, x2, y2, ...)` - Create a line
  - `create_lines(lines)` - Create multiple lines
  - `create_ellipse(x, y, width, height, ...)` - Create an ellipse
  - `create_ellipses(ellipses)` - Create multiple ellipses
  - `create_polygons(polygons)` - Create multiple polygons

- **Text:**
  - `create_text(x, y, text, ...)` - Create a text element
  - `create_bounded_text(x, y, width, height, text, ...)` - Create a bounded text box
  - `set_text_content(nodeId, text)` - Set text content of an existing node
  - `set_multiple_text_contents(nodeIds, texts)` - Set multiple text contents

- **Components and Vectors:**
  - `create_component_instance(componentKey, x, y)` - Create an instance of a component
  - `create_component_instances(instances)` - Create multiple component instances
  - `create_component_from_node(nodeId)` - Convert a node to a component
  - `create_button(x, y, width, height, text, ...)` - Create a complete button
  - `create_vector(x, y, width, height, vectorPaths, ...)` - Create a vector
  - `create_vectors(vectors)` - Create multiple vectors

- **Images and SVG:**
  - `insert_image(url, x, y, ...)` - Insert an image from a URL
  - `insert_images(images)` - Insert multiple images from URLs
  - `insert_local_image(imagePath/imageData, x, y, ...)` - Insert a local image
  - `insert_local_images(images)` - Insert multiple local images
  - `insert_svg_vector(svg, x, y, ...)` - Insert an SVG as vector
  - `insert_svg_vectors(svgs)` - Insert multiple SVG vectors

### Styling and Modification

- **Basic Styling:**
  - `set_fill_color(nodeId, r, g, b, a)` - Set fill color
  - `set_stroke_color(nodeId, r, g, b, a, weight)` - Set stroke color
  - `set_style(nodeId, fillProps, strokeProps)` - Set both fill and stroke
  - `set_styles(entries)` - Apply styles to multiple nodes

- **Gradients:**
  - `create_gradient_variable(name, gradientType, stops)` - Create a gradient style
  - `apply_gradient_style(nodeId, gradientStyleId, applyTo)` - Apply a gradient style
  - `apply_direct_gradient(nodeId, gradientType, stops, applyTo)` - Apply gradient directly
  - `create_gradient_variables(gradients)` - Batch create gradient variables
  - `apply_gradient_styles(entries)` - Batch apply gradient styles

- **Text Styling:**
  - `set_font_name(nodeId, family, style)` - Set font name and style
  - `set_font_size(nodeId, fontSize)` - Set font size
  - `set_font_weight(nodeId, weight)` - Set font weight
  - `set_letter_spacing(nodeId, letterSpacing, unit)` - Set letter spacing
  - `set_line_height(nodeId, lineHeight, unit)` - Set line height
  - `set_paragraph_spacing(nodeId, paragraphSpacing)` - Set paragraph spacing
  - `set_text_case(nodeId, textCase)` - Set text case
  - `set_text_decoration(nodeId, textDecoration)` - Set text decoration
  - `load_font_async(family, style)` - Load a font asynchronously

- **Effects and Layout:**
  - `set_effects(nodeId, effects)` - Set visual effects
  - `set_effect_style_id(nodeId, effectStyleId)` - Apply an effect style
  - `set_auto_layout(nodeId, layoutMode)` - Configure auto layout
  - `set_auto_layout_resizing(nodeId, axis, mode)` - Set hug or fill sizing mode
  - `set_corner_radius(nodeId, radius, corners)` - Set corner radius

### Transformations and Management

- **Positioning and Sizing:**
  - `move_node(nodeId, x, y)` - Move a node
  - `move_nodes(nodeIds, x, y)` - Move multiple nodes
  - `resize_node(nodeId, width, height)` - Resize a node
  - `resize_nodes(nodeIds, targetSize)` - Resize multiple nodes

- **Boolean Operations:**
  - `flatten_selection(nodeIds)` - Flatten selected nodes
  - `union_selection(nodeIds)` - Union selected shapes
  - `subtract_selection(nodeIds)` - Subtract shapes
  - `intersect_selection(nodeIds)` - Intersect shapes
  - `exclude_selection(nodeIds)` - Exclude overlapping areas

- **Node Management:**
  - `group_nodes(nodeIds, name)` - Group nodes
  - `ungroup_nodes(nodeId)` - Ungroup a node
  - `delete_node(nodeId)` - Delete a node
  - `detach_instance(instanceId)` - Detach a component instance

- **Naming:**
  - `rename_layer(nodeId, newName, setAutoRename)` - Rename a single layer
  - `rename_layers(layer_ids, new_name, match_pattern, replace_with)` - Rename multiple layers
  - `rename_multiple(layer_ids, new_names)` - Rename with distinct names
  - `ai_rename_layers(layer_ids, context_prompt)` - AI-powered renaming

### Export and Conversion

- `export_node_as_image(nodeId, format, scale)` - Export a node as an image
- `generate_html(nodeId, format, cssMode)` - Generate HTML structure from Figma nodes

### Communication

- `join_channel(channel)` - Join a specific communication channel

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

## License

This project is licensed under the [MIT License](LICENSE).
