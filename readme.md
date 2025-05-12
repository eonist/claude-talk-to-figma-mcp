[![version](https://img.shields.io/badge/version-0.5.1-blue.svg)](https://github.com/eonist/claude-talk-to-figma-mcp/releases)
![License](https://img.shields.io/badge/license-MIT-green)

<img width="100" alt="img" src="logo.svg">

### Conduit

> Design at the speed of thought

https://github.com/user-attachments/assets/27fb8080-a4f6-46d4-a016-60ba3f0208e8

### What is MCP?
Model Context Protocol (MCP) is the framework that allows an AI agent to communicate with external applications. This implementation enables any AI agent to send commands to and receive information from Figma in real-time.

## How it works

```
+------------+     +-----+     +------------------------+     +--------------+
| AI Agent   | <-> | MCP | <-> | Local WebSocket Server | <-> | Figma Plugin |
+------------+     +-----+     +------------------------+     +--------------+

```

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [Changelog](#changelog)
- [Troubleshooting](#troubleshooting)
- [Testing](#testing)
- [Contributions](#contributions)
- [License](#license)
- [Authors](#authors)
- [Acknowledgments](#acknowledgments)

### Features: 

- **Text manipulation** - Enables AI-powered control to add, edit, and style text elements within your Figma designs.
- **Gradient support** - Allows the AI to create and apply vibrant gradient fills to various design elements.
- **Font support** - Provides the capability for the AI to access and apply a diverse range of fonts and typographic styles.
- **AutoLayout** - Facilitates the automatic creation of responsive and adaptive layouts by leveraging Figma's AutoLayout feature.
- **Batch operations** - Allows the AI to perform actions on multiple Figma elements simultaneously, enhancing workflow efficiency.
- **Geometric shapes** - Enables the AI to generate common geometric shapes like rectangles, circles, and polygons as needed.
- **SVG / Image support** - Supports the import and management of Scalable Vector Graphics (SVG) and raster images within Figma designs.
- **Frame, Group, Component** - Allows the AI to structure designs effectively through the creation and management of frames, groups, and reusable components.
- **Rename layers** - Provides the ability for the AI to programmatically rename layers, aiding in the organization of Figma files.

### Compatibility

- VSCode w/ GitHub Copilot agent (Sonnet 3.7) (50 free Sonnet 3.5 requests per month)
- VSCode w/ Cline (Multiple LLM's available)
- Claude Desktop Application (Sonnet 3.7)
- Cursor agent (Sonnet 3.7)

## Prerequisites

- macOS/Linux:  
```bash
curl -fsSL https://bun.sh/install | bash
```
- Windows:  
```powershell
irm bun.sh/install.ps1 | iex
```

## Installation
 
### Step 1: Install the Figma Plugin

1. Clone this repository:
   ```
   git clone https://github.com/eonist/conduit.git
   ```
2. Open Figma Desktop App
3. Go to `Plugins > Development > Import plugin from manifest...`
4. Navigate to conduit folder and select `conduit/src/plugin/manifest.json`
 
### Step 2: Configure Agent

1. Open Agent App (GitHub Copilot Agent, Cline, Cursor, Claude desktop)
2. Find MCP settings in your agent app of choice
4. Add a new MCP connection with the details you find in the about section of the plugin. 

### Step 3: Start the server

- Terminal: `cd path-to-conduit`
- Terminal: `bun install` -> Installs dependencies
- Terminal: `bun run build:all` -> Builds the Server and Plugin
- Terminal: `bun socket` -> Starts the Server 
- Start Figma plugin: Plugin -> Development -> Conduit 
- AI Agent app: Ensure MCP “Conduit” is enabled.
- AI Agent app: "Talk to Figma on channel: (unique channel id)"

### Quick Example

```
User: "Create a responsive navigation bar with our brand color #3366FF and add 5 menu items"
Claude: [executes commands in Figma and displays the results]
```

### Docs:
- [Available_MCP_Commands.md](https://github.com/eonist/claude-talk-to-figma-mcp/blob/main/Available_MCP_Commands.md) 
- [Server doc](https://github.com/eonist/claude-talk-to-figma-mcp/blob/main/src/conduit_mcp_server/README.md)
- [Plugin doc](https://github.com/eonist/claude-talk-to-figma-mcp/blob/main/src/conduit_mcp_plugin/README.md)

## Troubleshooting

- **Connection Error:** Ensure the WebSocket server is running (`bun socket`).  
- **Plugin Not Appearing:** Verify the plugin import in Figma Development settings.  
- **Execution or Font Loading Errors:** Check Figma’s development console for details.  

## Testing

To run integration tests:
```bash
bun run test
```
See [TESTING.md](TESTING.md) for more details.

## Contributions

1. Fork the repository.  
2. Create a branch (e.g., `feature/amazing-feature`).  
3. Commit your changes.  
4. Push to your branch.  
5. Open a Pull Request.  

See MCP protocol design best pratice: https://gist.github.com/eonist/eb8d5628aad07fc57ce339e518158c20

## Changelog

### 0.5.2 (2025-05-12)
- Improved WebSocket reconnection for better connection stability
- Redesigned UI with modern styling and improved layout
- Added clipboard copy confirmation notifications
- Added SVG logo to the plugin header

### 0.5.1 (2025-05-11)
- Figma theme support & dark/light toggle
- Countdown timer for persistent-retry mode
- Optimized CLI heartbeat to stop CPU overheating
- Fixed checkbox alignment
- Resolved client-server communication issues

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

## License

MIT License – see the [LICENSE](LICENSE) file for details.
 
## Authors

- **Sonny Lazuardi** – Original implementation | [GitHub](https://github.com/sonnylazuardi)  
- **Xúlio Zé** – Adaptation for Claude | [GitHub](https://github.com/arinspunk)  
- **André J** – Adoption for any agent with new features | [GitHub](https://github.com/eonist)

## Acknowledgments

- Anthropic team for Claude and the Model Context Protocol.  
- Figma community for their excellent plugin API.  
- Sonny Lazuardi for the original implementation.  
- Bun team for providing a fast JavaScript runtime.
