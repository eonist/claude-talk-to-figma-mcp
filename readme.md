# Claude Talk to Figma MCP

[![version](https://img.shields.io/badge/version-0.4.8-blue.svg)](https://github.com/eonist/claude-talk-to-figma-mcp/releases)
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

## Available Commands

### Read commands

| Command                   | Description                                          | Parameters              |
|---------------------------|------------------------------------------------------|-------------------------|
| `get_document_info`       | Retrieve Figma document details                      | None                    |
| `get_selection`           | Retrieve current selection                           | None                    |
| `get_node_info`           | Retrieve detailed info for a specific node           | `nodeId`                |
| `get_nodes_info`          | Retrieve detailed info for multiple nodes            | `nodeIds`               |
| `get_styles`              | Retrieve all styles                                  | None                    |
| `get_local_components`    | Retrieve all local components                        | None                    |
| `get_remote_components`   | Retrieve team library components                     | None                    |
| `get_styled_text_segments`| Retrieve styled text segments based on a property     | `nodeId`, `property`    |
| `scan_text_nodes`         | Scan all text nodes under a node                     | `nodeId`                |

### Write commands

| Command                     | Description                                          | Parameters                                                                         |
|-----------------------------|------------------------------------------------------|------------------------------------------------------------------------------------|
| `rename_layer`              | Rename a single layer                                | `nodeId`, `newName`, `setAutoRename`                                               |
| `rename_layers`             | Rename multiple layers by pattern                    | `layer_ids`, `new_name`, `match_pattern`, `replace_with`                           |
| `rename_multiple`           | Rename multiple layers with distinct names           | `layer_ids`, `new_names`                                                           |
| `ai_rename_layers`          | AI-assisted rename of layers                         | `layer_ids`, `context_prompt`                                                      |
| `clone_node`                | Clone a node                                         | `nodeId`, `x`, `y`                                                                 |
| `clone_nodes`               | Clone multiple nodes                                 | `nodeIds`, `x`, `y`                                                                |
| `detach_instance`           | Detach a component instance from its master           | `instanceId`                                                                       |
| `create_component_instance` | Create a component instance                          | `componentKey`, `x`, `y`                                                           |
| `create_component_instances` | Create multiple component instances                 | `instances`: array of `{ componentKey, x, y, name?, parentId?, scaleX?, scaleY? }` |
| `create_component_from_node`  | Convert an existing node into a component           | `nodeId`                                                                          |
| `create_text`                 | Create a text element                                | `x`, `y`, `text`, `fontSize?`, `fontWeight?`, `fontColor?`, `name?`, `parentId?`  |
| `create_bounded_text`         | Create fixed-size text container with wrapping support | `x`, `y`, `text`, `width?`, `height?`, `fontSize?`, `fontWeight?`, `fontColor?`, `name?`, `parentId?`  |
| `create_rectangle`          | Create a rectangle                                   | `x`, `y`, `width`, `height`, `name`, `parentId`                                    |
| `create_rectangles`         | Create multiple rectangles                           | `rectangles`: array of `{ x, y, width, height, name?, parentId? }`                 |
| `create_frame`              | Create a frame                                       | `x`, `y`, `width`, `height`, `name`, `parentId`, `fillColor`, `strokeColor`, `strokeWeight` |
| `create_frames`             | Create multiple frames                               | `frames`: array of `{ x, y, width, height, name?, parentId?, fillColor?, strokeColor?, strokeWeight? }` |
| `create_ellipse`            | Create an ellipse                                    | `x`, `y`, `width`, `height`, `name`, `parentId`, `fillColor`, `strokeColor`, `strokeWeight` |
| `create_ellipses`           | Create multiple ellipses                             | `ellipses`: array of `{ x, y, width, height, name?, parentId?, fillColor?, strokeColor?, strokeWeight? }` |
| `create_ellipses`           | Create multiple ellipses                             | `ellipses`: array of `{ x, y, width, height, name?, parentId?, fillColor?, strokeColor?, strokeWeight? }` |
| `create_polygon`            | Create a polygon                                     | `x`, `y`, `width`, `height`, `sides`, `name`, `parentId`, `fillColor`, `strokeColor`, `strokeWeight` |
| `create_star`               | Create a star                                        | `x`, `y`, `width`, `height`, `points`, `innerRadius`, `name`, `parentId`, `fillColor`, `strokeColor`, `strokeWeight` |
| `create_vector`             | Create a vector                                      | `x`, `y`, `width`, `height`, `vectorPaths`, `name?`, `parentId?`, `fillColor?`, `strokeColor?`, `strokeWeight?` |
| `create_vectors`            | Create multiple vectors                              | `vectors`: array of `{ x, y, width, height, name?, parentId?, vectorPaths, fillColor?, strokeColor?, strokeWeight? }` |
| `insert_svg_vector`         | Insert SVG as vector                                 | `svg`, `svgPath`, `x`, `y`, `name?`, `parentId?`                                     |
| `create_line`               | Create a line                                        | `x1`, `y1`, `x2`, `y2`, `parentId?`, `strokeColor?`, `strokeWeight?`                 |
| `create_lines`              | Create multiple lines                                | `lines`: array of `{ x1, y1, x2, y2, parentId?, strokeColor?, strokeWeight? }`        |
| `create_line`               | Create a line                                        | `x`, `y`, `x2`, `y2`, `name?`, `parentId?`, `strokeColor?`, `strokeWeight?`, `strokeCap?` |
| `delete_node`               | Delete a node                                        | `nodeId`                                                                           |
| `delete_nodes`              | Delete multiple nodes                                | `nodeIds`                                                                          |
| `move_node`                 | Move a node                                          | `nodeId`, `x`, `y`                                                                 |
| `move_nodes`                | Move multiple nodes                                  | `nodeIds`, `x`, `y`                                                                |
| `resize_node`               | Resize a node                                        | `nodeId`, `width`, `height`                                                        |
| `resize_nodes`              | Resize multiple nodes                                | `nodeIds`, `dimensions?`, `targetSize?`, `scalePercent?`, `maintainAspectRatio?`, `resizeMode?` |
| `set_corner_radius`         | Adjust corner radius                                 | `nodeId`, `radius`, `corners?`                                                     |
| `set_fill_color`            | Set fill color                                       | `nodeId`, `r`, `g`, `b`, `a?`                                                      |
| `set_stroke_color`          | Set stroke color and weight                          | `nodeId`, `r`, `g`, `b`, `a?`, `weight?`                                           |
| `set_style`                 | Set fill & stroke in one command                     | `nodeId`, `fillProps`, `strokeProps`                                               |
| `set_styles`                | Set styles on multiple nodes                         | `entries`                                                                          |
| `set_text_content`          | Update text in a node                                | `nodeId`, `text`                                                                   |
| `set_multiple_text_contents`| Update multiple text nodes                           | `nodeId`, `text`: array of `{ nodeId, text }`                                      |
| `set_auto_layout`           | Configure auto layout                                | `nodeId`, `layoutMode`, `paddingTop`, `paddingBottom`, `paddingLeft`, `paddingRight`, `itemSpacing`, `primaryAxisAlignItems`, `counterAxisAlignItems`, `layoutWrap`, `strokesIncludedInLayout` |
| `set_auto_layout_resizing`  | Set auto layout sizing                               | `nodeId`, `axis`, `mode`                                                           |
| `set_bulk_font`             | Bulk apply font settings                             | `targets`                                                                          |
| `flatten_node`              | Flatten complex node into vector path                | `nodeId`                                                                           |
| `flatten_selection`         | Flatten a selection of nodes in Figma                | `nodeIds`                                                                          |
| `union_selection`           | Combine shapes, removing overlapping areas to create a single outline | `nodeIds`                                                                          |
| `subtract_selection`        | Remove top shape(s) from the bottom shape            | `nodeIds`                                                                          |
| `intersect_selection`       | Keep only the areas where all selected shapes overlap | `nodeIds`                                                                          |
| `exclude_selection`         | Keep only the areas where shapes don't overlap       | `nodeIds`                                                                          |

| `create_gradient_variables` | Batch create gradient variables in Figma            | `gradients`                                                                        |
| `apply_gradient_styles`     | Batch apply gradient styles to nodes in Figma       | `entries`                                                                          |

### Image Commands

| Command               | Description                                                                    | Parameters                                                                                           |
|-----------------------|--------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| `insert_local_image`  | Insert a local image via file path or Base64 data URI.                         | `imagePath` (optional), `imageData` (optional), `x`, `y`, `width`, `height`, `name`, `parentId`       |
| `insert_local_images` | Batch insert multiple local images via file paths or Base64 data URIs.         | `images`: array of `{ imagePath?, imageData?, x?, y?, width?, height?, name?, parentId? }`           |

#### Example JSON Request

```json
{
  "command": "insert_local_images",
  "params": {
    "images": [
      {
        "imagePath": "/absolute/path/to/image1.png",
        "x": 10,
        "y": 20
      },
      {
        "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",
        "x": 100,
        "y": 150
      }
    ]
  }
}
```

### Image Commands

| Command             | Description                                                                    | Parameters                                                         |
|---------------------|--------------------------------------------------------------------------------|--------------------------------------------------------------------|
| `insert_local_image`| Insert a local image via file path or Base64 data URI.                         | `imagePath` (optional), `imageData` (optional), `x`, `y`, `width`, `height`, `name`, `parentId` |

### Misc commands

| Command                 | Description                                 | Parameters                         |
|-------------------------|---------------------------------------------|------------------------------------|
| `export_node_as_image`  | Export a node as an image                   | `nodeId`, `format?`, `scale?`      |
| `join_channel`          | Join a WebSocket communication channel      | `channel`                          |
| `group_nodes`           | Group multiple nodes in Figma               | `nodeIds`, `name?`                 |
| `ungroup_nodes`         | Ungroup a node group                        | `nodeId`                           |
| `group_nodes`           | Group multiple nodes in Figma               | `nodeIds`, `name?`                 |
| `ungroup_nodes`         | Ungroup a node group                        | `nodeId`                           |
| `flatten_node`          | Flatten complex node into vector path       | `nodeId`                           |
| `flatten_selection`     | Flatten a selection of nodes in Figma       | `nodeIds`                          |
| `insert_child`          | Insert a child into a parent node           | `parentId`, `childId`, `index?`    |

### Effect commands

| Command                 | Description                                 | Parameters                       |
|-------------------------|---------------------------------------------|----------------------------------|
| `set_effects`           | Apply visual effects to a node              | `nodeId`, `effects`              |
| `set_effect_style_id`   | Apply an effect style by style ID           | `nodeId`, `effectStyleId`        |

### Text & Font commands

| Command                     | Description                                  | Parameters                                |
|-----------------------------|----------------------------------------------|-------------------------------------------|
| `set_font_name`             | Set the font family and style of text nodes  | `nodeId`, `family`, `style`              |
| `set_font_size`             | Set the font size of text nodes              | `nodeId`, `fontSize`                      |
| `set_font_weight`           | Set the font weight of text nodes            | `nodeId`, `weight`                        |
| `set_letter_spacing`        | Set letter spacing between characters        | `nodeId`, `letterSpacing`, `unit`         |
| `set_line_height`           | Set the line height of text nodes            | `nodeId`, `lineHeight`, `unit`            |
| `set_paragraph_spacing`     | Set spacing between paragraphs               | `nodeId`, `paragraphSpacing`              |
| `set_text_case`             | Change text casing (ORIGINAL, UPPER, LOWER, TITLE) | `nodeId`, `textCase`              |
| `set_text_decoration`       | Add text decoration (underline, strikethrough)| `nodeId`, `textDecoration`               |
| `get_styled_text_segments`  | Retrieve styled text segments based on property | `nodeId`, `property`                  |
| `load_font_async`           | Load a font asynchronously                   | `family`, `style`                         |
| `set_bulk_font`             | Bulk apply font settings to multiple nodes   | `targets`                                 |
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
