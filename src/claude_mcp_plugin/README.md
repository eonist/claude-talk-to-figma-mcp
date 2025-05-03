# Claude MCP Figma Plugin

A Figma plugin that integrates with the Model Context Protocol (MCP) to enable Claude AI to control Figma.

## Modular Architecture

This plugin uses a modular architecture during development, while still complying with Figma's requirement for a single JavaScript file. The approach allows for easier maintenance, code organization, and extensibility.

### Project Structure

```
src/claude_mcp_plugin/
├── code.js             # Final bundled file for Figma (generated)
├── build.js            # Build script to bundle the source files
├── manifest.json       # Figma plugin manifest
├── ui.html             # Plugin UI
└── src/                # Source code (modular)
    ├── code.ts         # Main entry point
    └── modules/        # Modular components
        ├── api.js      # Command routing
        ├── components.js # Component operations
        ├── document.js # Document operations
        ├── shapes.js   # Shape operations
        ├── style.js    # Style operations
        ├── text.js     # Text operations
        └── utils.js    # Utility functions
```

### Development Workflow

1. Edit files in the `src/` directory
2. Run `bun run build:plugin` to bundle the files into `code.js`
3. Or run `bun run watch:plugin` to automatically rebuild on changes
4. Reload the plugin in Figma to see changes

### Extending the Plugin

When adding new functionality:

1. Add your new functions to the appropriate module (or create a new module)
2. Export your functions from the module
3. Add them to the module's exported operations object
4. Register them in the `api.js` file to make them available via the command interface

### Building

The bundling uses esbuild to combine all the modular files into a single JS file that Figma can load. The build configuration is in `build.js`.

## Commands

The plugin supports various commands organized into categories:

- **Document**: Get document info, selection, node info
- **Shapes**: Create and manipulate shapes (rectangle, ellipse, etc.)
- **Text**: Create and modify text elements
- **Style**: Apply styles, fills, strokes, effects
- **Components**: Work with components, groups, and assets

## MCP Integration

This plugin works with Claude's Model Context Protocol to provide a bridge between Claude AI and Figma, allowing Claude to create and manipulate design elements programmatically.

## Troubleshooting

If the plugin isn't working as expected:

1. Check the browser console for errors
2. Ensure the plugin has been bundled correctly with `bun run build:plugin`
3. Verify that Figma has access to the compiled `code.js` file

## Dependencies

- esbuild: For bundling the modular code into a single file
- nodemon: For watching and rebuilding on changes during development
