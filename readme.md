# Claude Talk to Figma MCP

[![version](https://img.shields.io/badge/version-0.4.4-blue.svg)](https://github.com/eonist/claude-talk-to-figma-mcp/releases)  
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

## Available Commands

### Read commands

| Command                                | Description                              | Parameters           |
|----------------------------------------|------------------------------------------|----------------------|
| `get_document_info`                    | Retrieve Figma document details          | None                 |
| `get_local_components`                 | List local components                    | None                 |
| `get_node_info` / `get_nodes_info`     | Get detailed node information            | `nodeId` / `nodeIds` |
| `get_selection`                        | Get the current selection                | None                 |
| `get_styles`                           | Retrieve all styles                      | None                 |
| `scan_text_nodes`                      | Discover text nodes                      | `nodeId`             |

### Write commands

| Command                           | Description                              | Parameters                                                                                               |
|-----------------------------------|------------------------------------------|----------------------------------------------------------------------------------------------------------|
| `rename_layer`                    | Rename a single layer in Figma           | `nodeId`, `newName`, `setAutoRename`                                                                     |
| `rename_layers`                   | Rename multiple layers in Figma          | `layer_ids`, `new_name`, `match_pattern`, `replace_with`                                                 |
| `rename_multiple`                 | Rename multiple layers with distinct names | `layer_ids`, `new_names`                                                                               |
| `clone_node`                      | Clone a Figma node                       | `nodeId`, `x`, `y`                                                                                       |
| `create_component_instance`       | Create an instance of a component        | `componentKey`, `x`, `y`                                                                                 |
| `create_ellipse`                  | Create an ellipse shape                  | `x`, `y`, `width`, `height`, `name`, `parentId`, `fillColor`, `strokeColor`, `strokeWeight`             |
| `create_polygon`                  | Create a polygon shape                   | `x`, `y`, `width`, `height`, `sides`, `name`, `parentId`, `fillColor`, `strokeColor`, `strokeWeight`     |
| `create_star`                     | Create a star shape                      | `x`, `y`, `width`, `height`, `points`, `innerRadius`, `name`, `parentId`, `fillColor`, `strokeColor`, `strokeWeight` |
| `create_vector`                   | Create a vector shape                    | `x`, `y`, `width`, `height`, `name`, `parentId`, `vectorPaths`, `fillColor`, `strokeColor`, `strokeWeight` |
| `create_line`                     | Create a line shape                      | `x1`, `y1`, `x2`, `y2`, `name`, `parentId`, `strokeColor`, `strokeWeight`, `strokeCap`                   |
| `insert_svg_vector`               | Insert SVG content as vector             | `svg`, `svgPath`, `x`, `y`, `name`, `parentId`                                                           |
| `create_frame`                    | Create a frame                           | `x`, `y`, `width`, `height`, `name`, `parentId`, `fillColor`, `strokeColor`, `strokeWeight`             |
| `create_frames`                   | Create multiple frames                   | `frames`: array of objects `{ x, y, width, height, name?, parentId?, fillColor?, strokeColor?, strokeWeight? }` |
| `create_rectangle`                | Create a rectangle shape                 | `x`, `y`, `width`, `height`, `name`, `parentId`                                                          |
| `delete_node`                     | Remove a Figma node                      | `nodeId`                                                                                                 |
| `move_node`                       | Reposition a node                        | `nodeId`, `x`, `y`                                                                                       |
| `resize_node`                     | Alter node dimensions                    | `nodeId`, `width`, `height`                                                                              |
| `set_corner_radius`               | Adjust node corner radii                 | `nodeId`, `radius`, `corners`                                                                            |
| `set_fill_color`                  | Modify node fill color                   | `nodeId`, `color`                                                                                        |
| `set_stroke_color`                | Modify node stroke color and weight      | `nodeId`, `color`, `weight`                                                                              |
| `set_style`                       | Set both fill and stroke properties for a Figma node in a single command | `nodeId`, `fillProps`, `strokeProps`                                                                   |
| `set_multiple_text_contents`      | Update multiple text elements            | `nodeId`, `text`                                                                                         |
| `set_auto_layout`                 | Configure auto layout                    | `nodeId`, `layoutMode`, `paddingTop`, `paddingBottom`, `paddingLeft`, `paddingRight`, `itemSpacing`, `primaryAxisAlignItems`, `counterAxisAlignItems`, `layoutWrap`, `strokesIncludedInLayout` |
| `set_auto_layout_resizing`        | Set hug or fill sizing mode on an auto layout frame or child node | `nodeId`, `axis`, `mode` |
| `set_text_content`                | Change text within a node                | `nodeId`, `text`                                                                                         |

### Misc commands

| Command               | Description                              | Parameters        |
|-----------------------|------------------------------------------|-------------------|
| `export_node_as_image`| Export a node as an image                | `nodeId`, `scale` |
| `join_channel`        | Join a communication channel             | `channel`         |

**Text and Font Commands:**
Here's the table with the description column moved next to the command column:

**Text and Font Commands:**

| Command               | Description                                         | Parameters                   |
|-----------------------|-----------------------------------------------------|------------------------------|
| `set_font_name`       | Set text font and style                             | `nodeId`, `family`, `style` |
| `set_font_size`       | Change text size                                    | `nodeId`, `fontSize`         |
| `set_font_weight`     | Adjust font weight                                  | `nodeId`, `weight`           |
| `set_letter_spacing`  | Modify spacing between letters                      | `nodeId`, `letterSpacing`, `unit` |
| `set_line_height`     | Adjust the text line height                         | `nodeId`, `lineHeight`, `unit` |
| `set_bulk_font`       | Bulk apply font settings to multiple text nodes     | `targets`                    |
| `set_paragraph_spacing`| Set the spacing between paragraphs                 | `nodeId`, `paragraphSpacing` |
| `set_text_case`       | Change text case (ORIGINAL, UPPER, LOWER, TITLE)    | `nodeId`, `textCase`         |
| `set_text_decoration` | Add text decorations (e.g., underline)              | `nodeId`, `textDecoration`   |
| `get_styled_text_segments`| Retrieve styled segments                        | `nodeId`, `property`         |
| `load_font_async`     | Load a font asynchronously                          | `family`, `style`            |

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

### 0.4.4
- Bulk font application across text nodes (`set_bulk_font`)
- Insert SVG content as vector (`insert_svg_vector`)
- Rename a single layer (`rename_layer`)
- Rename multiple layers (`rename_layers`)
- Rename multiple layers with distinct names (`rename_multiple`)

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
