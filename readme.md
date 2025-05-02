<img src="images/claude-talk-to-figma.png" alt="Claude Talk to Figma collage" />

# Claude Talk to Figma MCP

A Model Context Protocol (MCP) plugin that enables Claude Desktop to directly interact with Figma for AI-assisted design.

> **Note:** This project is based on [cursor-talk-to-figma-mcp](https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp) by Sonny Lazuardi, adapted for Claude Desktop.

---

## Features

- **Native Claude Integration**: Seamlessly connects Claude with Figma.
- **Powerful Commands**: Create, modify, or delete Figma elements.
- **Advanced Text & Font Control**: Customize typography with precision.
- **Bidirectional Communication**: Uses a real-time WebSocket channel.
- **Text Scanning**: Identify and edit text nodes.
- **Remote Components**: Access team library components.

---

## Prerequisites

- [Claude Desktop](https://claude.ai/download)
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
    git clone https://github.com/arinspunk/claude-talk-to-figma-mcp.git
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
4. Configure the MCP in Claude Desktop:
    ```bash
    bun run configure-claude
    ```
    *Restart Claude Desktop if it is already running.*

    > This script:
    > - Locates the configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS).
    > - Creates a backup.
    > - Updates or creates the file to include "ClaudeTalkToFigma" in the list of MCPs.
    > - Sets the command for starting the MCP.

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

3. **Using Claude Desktop:**
    - Open Claude Desktop and select "ClaudeTalkToFigma" from the MCP selector.

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
| Claude Desktop |<--->|  MCP  |<--->| WebSocket Srv |<--->| Figma Plugin  |
|   (AI Agent)   |     |       |     |  (Port 3055)  |     |  (UI Plugin)  |
|                |     |       |     |               |     |               |
+----------------+     +-------+     +---------------+     +---------------+
```

---

## Available Commands

**Basic Commands:**

- `clone_node` - Clone a Figma node.
- `create_component_instance` - Create an instance of a component.
- `create_ellipse`, `create_polygon`, `create_star`, `create_vector` - Create various shapes.
- `create_frame`, `create_line`, `create_rectangle` - Create basic Figma elements.
- `delete_node` - Remove a Figma node.
- `export_node_as_image` - Export a node as an image.
- `get_document_info` - Retrieve Figma document details.
- `get_local_components` - List local components.
- `get_node_info` / `get_nodes_info` - Get detailed node information.
- `get_selection` - Get the current selection.
- `get_styles` - Retrieve all styles.
- `join_channel` - Join a communication channel.
- `move_node` - Reposition a node.
- `resize_node` - Alter node dimensions.
- `scan_text_nodes` - Discover text nodes.
- `set_corner_radius` - Adjust node corner radii.
- `set_fill_color`, `set_stroke_color` - Modify node colors.
- `set_multiple_text_contents` - Update multiple text elements.
- `set_auto_layout` - Configure auto layout.
- `set_text_content` - Change text within a node.

**Text and Font Commands:**

- `set_font_name` - Set text font and style.
- `set_font_size` - Change text size.
- `set_font_weight` - Adjust font weight.
- `set_letter_spacing` - Modify spacing between letters.
- `set_line_height` - Adjust the text line height.
- `set_paragraph_spacing` - Set the spacing between paragraphs.
- `set_text_case` - Change text case (ORIGINAL, UPPER, LOWER, TITLE).
- `set_text_decoration` - Add text decorations (e.g., underline).
- `get_styled_text_segments` - Retrieve styled segments.
- `load_font_async` - Load a font asynchronously.
- `get_remote_components` - Access team library components.

---

## Changelog

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
- **Claude MCP Not Found:** Run `bun run configure-claude` and restart Claude Desktop.
- **Execution or Font Loading Errors:** Check Figma’s development console for details.
- **rename_layer Tool Not Found:** Ensure the tool is registered as "rename_layer" (all lower-case, underscores) in the MCP server and that the client references it exactly. Clear relevant caches and review server logs for registration confirmation.

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

---

## Acknowledgments

- Anthropic team for Claude and the Model Context Protocol.
- Figma community for their excellent plugin API.
- Sonny Lazuardi for the original implementation.
- Bun team for providing a fast JavaScript runtime.
