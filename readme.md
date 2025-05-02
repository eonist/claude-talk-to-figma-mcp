# Claude Talk to Figma MCP

[![version](https://img.shields.io/badge/version-0.4.2-blue.svg)](https://github.com/eonist/claude-talk-to-figma-mcp/releases)

A Model Context Protocol (MCP) plugin that enables Cline via VSCode to directly interact with Figma for AI-assisted design.

<img width="640" alt="img" src="https://s4.gifyu.com/images/bLldl.gif">

> [!TIP]  
> [Prompt overview](https://gist.github.com/eonist/1d18de2ecd2e18bacf36ddc669d3bddf) and [AI figma instructions and guidlines](https://gist.github.com/eonist/166bf55c1c61b99d5712e826c6df0d15)
 
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
**Important:** Point the client MCP to the local build at `"/Users/<your_user_name>/claude-talk-to-figma-mcp/src/talk_to_figma_mcp/server.ts"`. This is a temporary solution until the package is published to npm.
4. Configure the MCP in Cline in vscode:
    > Add this cript to cline mcp config file:
    ```
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
    - Open Figma.
    - Navigate to **Menu > Plugins > Development > New Plugin**.
    - Select "Import plugin from manifest" and choose the manifest at:
      ```
      src/claude_mcp_plugin/src/claude_mcp_plugin/manifest.json
      ```

---

## Usage

### Starting Up

1. **Start the WebSocket server:**
    ```bash
    bun socket
    ```
    Verify it is running at [http://localhost:3055/status](http://localhost:3055/status).  
    *Press `Ctrl+C` in the terminal to stop the server.*
    
2. **Connect the Plugin:**
    - Open the Claude MCP Plugin in Figma.
    - Copy and supply the generated channel ID to Claude.

3. **Using Cline in VS-code:**
    - Open Cline in vs-code and make sure mcp "ClaudeTalkToFigma" is toggled to on.

Now you're ready to send commands to Figma from Claude!

### Prompting Example

Before designing, ensure Claude is an expert in UX/UI by running one of the available prompts, then instruct:
```
Talk to Figma, channel {channel-ID}
```

---

## Architecture

```
+----------------+     +-------+     +---------------+     +---------------+
|                |     |       |     |               |     |               |
| VS-Code Cline  |<--->|  MCP  |<--->| WebSocket Srv |<--->| Figma Plugin  |
|   (AI Agent)   |     |       |     |  (Port 3055)  |     |  (UI Plugin)  |
|                |     |       |     |               |     |               |
+----------------+     +-------+     +---------------+     +---------------+
```

---

## Available Commands

| Command                  | Description                              | Parameters                          |
|--------------------------|------------------------------------------|-----------------------------------|
| `rename_layer`           | Rename a single layer in Figma           | `nodeId`, `newName`, `setAutoRename` |
| `rename_layers`          | Rename multiple layers in Figma          | `layer_ids`, `new_name`, `match_pattern`, `replace_with` |
| `get_tools`              | Read available tools in the MCP          | None                              |
| `clone_node`             | Clone a Figma node                       | `nodeId`, `x`, `y`                |
| `create_component_instance` | Create an instance of a component        | `componentKey`, `x`, `y`         |
| `create_ellipse`         | Create an ellipse shape                   | `x`, `y`, `width`, `height`, `name`, `parentId`, `fillColor`, `strokeColor`, `strokeWeight` |
| `create_polygon`         | Create a polygon shape                    | `x`, `y`, `width`, `height`, `sides`, `name`, `parentId`, `fillColor`, `strokeColor`, `strokeWeight` |
| `create_star`            | Create a star shape                       | `x`, `y`, `width`, `height`, `points`, `innerRadius`, `name`, `parentId`, `fillColor`, `strokeColor`, `strokeWeight` |
| `create_vector`          | Create a vector shape                     | `x`, `y`, `width`, `height`, `name`, `parentId`, `vectorPaths`, `fillColor`, `strokeColor`, `strokeWeight` |
| `create_line`            | Create a line shape                       | `x1`, `y1`, `x2`, `y2`, `name`, `parentId`, `strokeColor`, `strokeWeight`, `strokeCap` |
| `create_frame`           | Create a frame                           | `x`, `y`, `width`, `height`, `name`, `parentId`, `fillColor`, `strokeColor`, `strokeWeight` |
| `create_rectangle`       | Create a rectangle shape                  | `x`, `y`, `width`, `height`, `name`, `parentId` |
| `delete_node`            | Remove a Figma node                      | `nodeId`                         |
| `export_node_as_image`   | Export a node as an image                | `nodeId`, `scale`                |
| `get_document_info`      | Retrieve Figma document details          | None                            |
| `get_local_components`   | List local components                    | None                            |
| `get_node_info` / `get_nodes_info` | Get detailed node information            | `nodeId` / `nodeIds`           |
| `get_selection`          | Get the current selection                | None                            |
| `get_styles`             | Retrieve all styles                      | None                            |
| `join_channel`           | Join a communication channel             | `channel`                       |
| `move_node`              | Reposition a node                       | `nodeId`, `x`, `y`              |
| `resize_node`            | Alter node dimensions                    | `nodeId`, `width`, `height`     |
| `scan_text_nodes`        | Discover text nodes                      | `nodeId`                       |
| `set_corner_radius`      | Adjust node corner radii                 | `nodeId`, `radius`, `corners`   |
| `set_fill_color`         | Modify node fill color                   | `nodeId`, `color`                |
| `set_stroke_color`       | Modify node stroke color and weight      | `nodeId`, `color`, `weight`     |
| `set_multiple_text_contents` | Update multiple text elements            | `nodeId`, `text`               |
| `set_auto_layout`        | Configure auto layout                    | `nodeId`, `layoutMode`, `paddingTop`, `paddingBottom`, `paddingLeft`, `paddingRight`, `itemSpacing`, `primaryAxisAlignItems`, `counterAxisAlignItems`, `layoutWrap`, `strokesIncludedInLayout` |
| `set_text_content`       | Change text within a node                | `nodeId`, `text`                |

**Text and Font Commands:**

| Command                  | Parameters                          | Description                              |
|--------------------------|-----------------------------------|------------------------------------------|
| `set_font_name`          | `nodeId`, `family`, `style`       | Set text font and style                  |
| `set_font_size`          | `nodeId`, `fontSize`               | Change text size                        |
| `set_font_weight`        | `nodeId`, `weight`                 | Adjust font weight                      |
| `set_letter_spacing`     | `nodeId`, `letterSpacing`, `unit` | Modify spacing between letters          |
| `set_line_height`        | `nodeId`, `lineHeight`, `unit`     | Adjust the text line height              |
| `set_paragraph_spacing`  | `nodeId`, `paragraphSpacing`       | Set the spacing between paragraphs      |
| `set_text_case`          | `nodeId`, `textCase`               | Change text case (ORIGINAL, UPPER, LOWER, TITLE) |
| `set_text_decoration`    | `nodeId`, `textDecoration`         | Add text decorations (e.g., underline)  |
| `get_styled_text_segments` | `nodeId`, `property`              | Retrieve styled segments                 |
| `load_font_async`        | `family`, `style`                  | Load a font asynchronously               |
| `get_remote_components`  | None                              | Access team library components           |

---

## Changelog

### 0.4.3
- Autolayout "hug content" and "fill container" feature

### 0.4.2
- Ability to rename layers
- Ability to read available tools

### 0.4.0
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
