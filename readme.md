# Claude Talk to Figma MCP

[![version](https://img.shields.io/badge/version-0.4.9-blue.svg)](https://github.com/eonist/claude-talk-to-figma-mcp/releases)
![License](https://img.shields.io/badge/license-MIT-green)

A Figma plugin enabling seamless communication between Anthropic's Claude AI and Figma using the Model Context Protocol (MCP). This tool allows you to design and modify Figma elements through natural language commands processed by Claude.

<img width="640" alt="img" src="https://s4.gifyu.com/images/bLldl.gif">

> [!TIP]  
> [Prompt overview](https://gist.github.com/eonist/1d18de2ecd2e18bacf36ddc669d3bddf) and [AI figma instructions and guidelines](https://gist.github.com/eonist/166bf55c1c61b99d5712e826c6df0d15)
  
## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [Available Commands](#available-commands)
- [Changelog](#changelog)
- [Troubleshooting](#troubleshooting)
- [Testing](#testing)
- [Contributions](#contributions)
- [License](#license)
- [Authors](#authors)
- [Acknowledgments](#acknowledgments)

## Features

- **Powerful Commands**: Create, modify, or delete Figma elements.  
- **Advanced Text & Font Control**: Customize typography with precision.  
- **Bidirectional Communication**: Uses a real-time WebSocket channel.  
- **Text Scanning**: Identify and edit text nodes.  
- **Remote Components**: Access team library components.  
- **Batch Rectangle Creation**: Create multiple rectangles in one call via `create_rectangles`.  
- **Batch SVG Insertion**: Insert multiple SVGs as vectors in one operation via `insert_svg_vectors`.  
- **Batch Polygon Creation**: Create multiple polygons in one call via `create_polygons`.
- **Batch Ellipse Creation**: Create multiple ellipses in one call via `create_ellipses`.
- **Gradient Support**: Create and apply gradient paint styles via `create_gradient_variable` and `apply_gradient_style`.
- **Local Image Support**: Insert local images via MCP agent with `insert_local_image` (single) and `insert_local_images` (batch) commands, using file paths or Base64 data URIs.

---

## Prerequisites

- [Cline for VS code](https://cline.bot/)  
- [Figma Desktop](https://www.figma.com/downloads/)  
- A [Figma](https://figma.com) account  
- [Bun](https://bun.sh) v1.0.0 or higher  

  - macOS/Linux:  
    ```bash
    curl -fsSL https://bun.sh/install | bash
    ```
  - Windows:  
    ```powershell
    irm bun.sh/install.ps1 | iex
    ```

---

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/eonist/claude-talk-to-figma-mcp.git
    cd claude-talk-to-figma-mcp
    ```
2. Install dependencies:
    ```bash
    bun install
    ```
3. Build the project:
    ```bash
    bun run build
    ```
4. Configure the CLI to point at the local build:
    ```json
    {
      "mcpServers": {
        "ClaudeTalkToFigma": {
          "autoApprove": [],
          "disabled": false,
          "timeout": 30,
          "command": "node",
          "args": [
            "/Users/<your-user-name>/claude-talk-to-figma-mcp/src/talk_to_figma_mcp/server.ts"
          ],
          "transportType": "stdio"
        }
      }
    }
    ```
5. Install the Figma plugin:
    - In Figma: **Menu > Plugins > Development > New Plugin**  
    - Select “Import plugin from manifest” and choose:
      ```
      src/claude_mcp_plugin/manifest.json
      ```

---

## Usage

### Starting Up

1. **Start the WebSocket server:**
    ```bash
    bun socket
    ```
    Verify at [http://localhost:3055/status](http://localhost:3055/status).  
    Press `Ctrl+C` to stop.

2. **Connect the Plugin:**
   - Open the “Claude MCP Plugin” in Figma.  
   - Supply the generated channel ID to Claude.

3. **Using Cline in VS Code:**
   - Ensure MCP “ClaudeTalkToFigma” is enabled.

Ready to send commands to Figma from Claude.

### Prompting Example

After loading a UX/UI prompt, run:
```
Talk to Figma, channel {channel-ID}
```

#### Agent Invocation Example

To invoke batch local-image insertion directly from an MCP agent (no plugin UI required), send JSON over stdio to the MCP server. For example:
```bash
echo '{
  "command": "insert_local_images",
  "params": {
    "images": [
      { "imagePath": "/absolute/path/to/image1.png", "x": 10, "y": 20 },
      { "imageData": "data:image/png;base64,iVBORw0KGgoAAAANS...", "x": 100, "y": 150 }
    ]
  }
}' | node src/talk_to_figma_mcp/server.ts
```

---

## Architecture

```
+----------------+     +-------+     +---------------+     +---------------+
|                |     |       |     |               |     |               |
| VS Code Cline  |<--->|  MCP  |<--->| WebSocket Srv |<--->| Figma Plugin  |
|   (AI Agent)   |     |       |     |  (Port 3055)  |     |  (UI Plugin)  |
+----------------+     +-------+     +---------------+     +---------------+
```

---

## Example prompts: 

```markdown
Talk to Figma, channel {channel-ID}
Please resize all selected elements to fit within a 200x200px frame while maintaining their aspect ratios.
```

```markdown
Talk to Figma, channel {channel-ID}
Please resize all selected elements so their longest side is 20px.
```

## Changelog

### 0.5.0 (2025-10-05)
- Export Figma HTML: Enables exporting Figma designs as HTML code.
- Export Figma CSS: Allows exporting design styles into CSS files.
- Plugin Auto Reconnect: Plugin checkbox for automatic server reconnection.
- Reliable Server Link: Keeps client-server auto-connected via heartbeat checks.
- Flexible SVG Input: Supports inserting SVGs via raw code or URL.

### 0.4.9 (2025-05-08)
- Implement robust WebSocket reconnection logic via `ReconnectingWebSocket` 
- Add batch local-image insertion support via `insert_local_images`
- Implement rectangle-to-frame conversion via `convert_rectangle_to_frame`
- Separate UI and protocol logic and remove local image upload button

### 0.4.8 (2025-05-07)
- Batch apply gradient styles to nodes in Figma via `apply_gradient_styles`
- Apply a gradient style to a node in Figma via `apply_gradient_style`
- Batch create gradient variables in Figma via `create_gradient_variables`
- Create a gradient variable in Figma via `create_gradient_variable`
- Batch insert multiple images via URLs into Figma via `insert_images`
- Insert a remote image from a URL into Figma via `insert_image`
- Insert a local image from path or Base64 via `insert_local_image`

### 0.4.7 (2025-05-06)
- Batch polygon creation via `create_polygons`
- Batch ellipse creation via `create_ellipses`
- Add gradient support via `create_gradient_variable` and `apply_gradient_style`
- Detach component instances via `detach_instance`
- Flatten nodes via `flatten_node` and `flatten_selection`
- Create component from node via `create_component_from_node`
- Create bounded text via `create_bounded_text`
- Group and ungroup nodes via `group_nodes` and `ungroup_nodes`
- Boolean operation commands via `union_selection`, `subtract_selection`, `intersect_selection`, `exclude_selection`

### 0.4.6 (2025-05-06)
- Batch SVG insertion via `insert_svg_vectors`
- Batch line creation via `create_lines`
- Bulk clone nodes via `clone_nodes`
- Create component instances via `create_component_instances`

### 0.4.5 (2025-05-05)
- Batch rectangle creation via `create_rectangles`
- Single line creation via `create_line`
- Batch line creation via `create_lines`
- Batch frames creation via `create_frames`
- Bulk font and text updates via `set_bulk_font` and `set_multiple_text_contents`
- Delete multiple nodes via `delete_nodes`
- Resize multiple nodes via `resize_nodes`
- Move multiple nodes via `move_nodes`
- Set single node style via `set_style`
- Set multiple node styles via `set_styles`

### 0.4.4 (2025-05-05)
- Bulk font application across text nodes (`set_bulk_font`)
- Insert SVG content as vector (`insert_svg_vector`)
- Rename a single layer (`rename_layer`)
- Rename multiple layers (`rename_layers`)
- Rename multiple layers with distinct names (`rename_multiple`)

### 0.4.3
- Autolayout "hug content" and "fill container" feature

### 0.4.2 (2025-05-02)
- Ability to rename layers
- Ability to read available tools

### 0.4.0 (2025-04-11)
- New tools for advanced shape creation.
- Enhanced text and font manipulation.
- Improved error handling and timeout management.
- Added support for accessing team library components.

### 0.3.0
- Introduced `set_auto_layout` command with layout options.

### 0.2.0
- Initial public release with Claude Desktop support.

---

## Troubleshooting

- **Connection Error:** Ensure the WebSocket server is running (`bun socket`).  
- **Plugin Not Appearing:** Verify the plugin import in Figma Development settings.  
- **Execution or Font Loading Errors:** Check Figma’s development console for details.  

---

## Testing

To run integration tests:
```bash
bun run test
```
See [TESTING.md](TESTING.md) for more details.

---

## Contributions

1. Fork the repository.  
2. Create a branch (e.g., `feature/amazing-feature`).  
3. Commit your changes.  
4. Push to your branch.  
5. Open a Pull Request.  

See MCP protocol design best pratice: https://gist.github.com/eonist/eb8d5628aad07fc57ce339e518158c20

---

## License

MIT License – see the [LICENSE](LICENSE) file for details.

---

## Authors

- **Xúlio Zé** – Adaptation for Claude | [GitHub](https://github.com/arinspunk)  
- **Sonny Lazuardi** – Original implementation | [GitHub](https://github.com/sonnylazuardi)  
- **André J** – Adoption for Cline with new features | [GitHub](https://github.com/eonist)  

---

## Acknowledgments

- Anthropic team for Claude and the Model Context Protocol.  
- Figma community for their excellent plugin API.  
- Sonny Lazuardi for the original implementation.  
- Bun team for providing a fast JavaScript runtime.
