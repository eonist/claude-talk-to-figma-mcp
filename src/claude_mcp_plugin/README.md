# Claude MCP Figma Plugin

A Figma plugin that integrates with the Model Context Protocol (MCP) to enable Claude AI to control Figma.

## Modular Architecture

This plugin uses a modular architecture during development, while still complying with Figma's requirement for a single JavaScript file. The approach allows for easier maintenance, code organization, and extensibility.

### Project Structure

```
src/claude_mcp_plugin/
├── code.js             # Final bundled file for Figma (generated)
├── build.js            # Build script to bundle the source code into code.js
├── direct-build.js     # Enhanced build script for UI generation
├── build-ts.js         # TypeScript build script (alternative approach)
├── manifest.json       # Figma plugin manifest
├── ui-template.html    # Template for plugin UI
├── ui.html             # Generated plugin UI with inlined scripts and styles
├── dist/               # Organized output directory
│   ├── code.js         # Copy of bundled file for organization
│   └── ui.html         # Copy of generated UI
├── components/         # HTML components for UI
│   ├── header.html
│   ├── tabs.html
│   ├── connection-panel.html
│   ├── progress-container.html
│   └── about-panel.html
├── js/                 # JavaScript modules for UI
│   ├── state.js
│   ├── connection.js
│   ├── ui-controller.js
│   ├── tab-manager.js
│   ├── message-handler.js
│   └── main.js
└── src/                # Source code (modular)
    ├── client.ts       # TypeScript for client communication
    ├── ui.ts           # TypeScript for UI functionality
    ├── index.js        # Main entry point
    └── modules/        # Modular components
        ├── commands.js        # Command routing
        ├── components.js      # Component operations
        ├── document.js        # Document operations
        ├── shapes.js          # Shape operations
        ├── styles.js          # Style operations
        ├── text.js            # Text operations
        ├── layout.js          # Layout operations
        ├── rename.js          # Rename operations
        ├── svg.js             # SVG operations
        ├── html-generator.js  # HTML generation
        ├── ui.js              # UI operations
        └── utils/             # Utility functions
            ├── plugin.js
            ├── encoding.js
            ├── helpers.js
            └── index.js
```

### Build System

The plugin uses a dual-output strategy with files generated in both the root directory and the `dist/` directory:

- **Root Directory Files** (`code.js`, `ui.html`): Required by Figma for plugin loading
- **Dist Directory Files** (`dist/code.js`, `dist/ui.html`): Duplicate copies for better code organization

The build scripts handle this dual-output automatically to maintain both compatibility and organization.

The plugin also uses a dual build system:

1. **Plugin Core (`code.js`)**: 
   - Built using `build.js`
   - Combines all the JavaScript modules from `src/` into a single file that Figma loads
   - Command: `bun run build:plugin`

2. **Plugin UI (`ui.html`)**: 
   - Built using `direct-build.js` (recommended)
   - Performs the following:
     - Compiles TypeScript files (ui.ts, client.ts) using esbuild
     - Processes all CSS files and inlines them
     - Includes all HTML components from components/
     - Includes all JavaScript modules from js/
     - Combines everything into a single ui.html file with no external dependencies
   - Command: `bun run build:ui`

### Available Build Scripts

- `build:plugin`: Generate the main plugin code (`code.js`)
- `build:ui`: Build the UI with all components, styles, and scripts inlined (recommended)
- `build:ui-ts`: Alternative UI build using TypeScript compilation
- `build:ui-old`: Legacy UI build that generates external JS files
- `build:ui-legacy`: Legacy UI build using the original build.js approach
- `watch:plugin`: Watch for changes and rebuild automatically
- `build:all`: Build everything in one command (core + UI)

### Cleanup

A cleanup script is provided to remove temporary directories and backup files after building:

```
cd src/claude_mcp_plugin
./cleanup.sh
```

This removes:
- The `temp-dist` directory used for TypeScript compilation
- The `temp` directory used by the direct-build script
- Any `.bak` backup files created during the build process

### Development Workflow

1. Edit files in the `src/`, `js/`, or `components/` directories
2. Run `bun run build:all` to build both the plugin core and UI
3. Or run `bun run watch:plugin` to automatically rebuild on changes
4. Reload the plugin in Figma to see changes

### Extending the Plugin

When adding new functionality:

1. Add your new functions to the appropriate module (or create a new module)
2. Export your functions from the module
3. Add them to the module's exported operations object
4. Register them in the `commands.js` file to make them available via the command interface

For UI changes:
1. Modify the appropriate component in the `components/` directory
2. Add any new JavaScript to the `js/` directory
3. For TypeScript functionality, update files in the `src/` directory
4. Run `bun run build:ui` to rebuild the UI

## Commands

The plugin supports various commands organized into categories:

- **Document**: `get_document_info`, `get_selection`, `get_node_info`, `get_nodes_info`
- **Styles**: `get_styles`, `get_local_components`, `get_remote_components`
- **Images**: 
  - Single from URL: `insert_image`
  - Batch from URLs: `insert_images`
  - Single local data: `insert_local_image`
  - Batch local data/files: `insert_local_images`
- **Shapes**: Create and manipulate shapes (`create_rectangle`, `create_ellipse`, etc.)
- **Text**: Create and modify text elements (`create_text`, `set_text_content`, etc.)
- **Style**: Apply styles, fills, strokes, effects (`set_fill_color`, `set_styles`, etc.)
- **Components**: Work with components, groups, and assets (`create_component_from_node`, etc.)
- **Layout**: Manipulate layout properties (`set_auto_layout`, etc.)
- **Vectors**: Create and manipulate vectors (`create_vector`, `insert_svg_vector`, etc.)
- **HTML Generation**: Generate HTML from Figma nodes (`generate_html`)

## MCP Integration

This plugin works with Claude's Model Context Protocol to provide a bridge between Claude AI and Figma, allowing Claude to create and manipulate design elements programmatically.

## Troubleshooting

If the plugin isn't working as expected:

1. Check the browser console for errors
2. Ensure the plugin has been bundled correctly:
   - For code issues: `bun run build:plugin`
   - For UI issues: `bun run build:ui`
3. Try the all-in-one build: `bun run build:all`
4. Verify that Figma has access to the compiled code files
5. If UI elements are missing, ensure all component files and CSS are present

## Dependencies

- esbuild: For bundling TypeScript and JavaScript
- nodemon: For watching and rebuilding on changes during development
- typescript: For type checking and compilation
