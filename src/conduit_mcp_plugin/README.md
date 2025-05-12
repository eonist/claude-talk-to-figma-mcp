# Conduit MCP Figma Plugin

A Figma plugin that integrates with the Model Context Protocol (MCP) to enable AI Agient to control Figma.

## Modular Architecture

This plugin uses a modular architecture during development, while still complying with Figma's requirement for a single JavaScript file. The approach allows for easier maintenance, code organization, and extensibility.

### Project Structure

```
src/conduit_mcp_plugin/
├── ui-template.html      # Source template for the UI
├── styles.css            # Base styling for the UI
├── connection.css        # Styling for connection panel
├── tabs.css              # Styling for tabs
├── progress.css          # Styling for progress container
├── build.js            # Node.js script to bundle plugin core (code.js)
├── direct-build.js       # Node.js script to build UI (ui.html) using esbuild
├── build-ts.js           # Alternative Node.js script for UI build using tsc
├── manifest.json       # Figma plugin manifest
├── dist/                 # Output directory
│   ├── ui.html           # Final generated plugin UI
│   └── code.js           # Final bundled plugin logic
├── components/           # HTML components for UI
│   ├── header.html
│   ├── tabs.html
│   ├── connection-panel.html
│   ├── progress-container.html
│   └── about-panel.html
├── js/                   # JavaScript modules for UI logic
│   ├── state.js
│   ├── connection.js
│   ├── ui-controller.js
│   ├── tab-manager.js
│   ├── message-handler.js
│   └── main.js
└── src/                  # Source code for plugin core (TypeScript/JavaScript)
    ├── client.ts         # TypeScript for client communication
    ├── ui.ts             # TypeScript for UI functionality
    ├── index.js          # Main entry point for plugin core
    └── modules/          # Modular components for plugin core logic
        ├── commands.js
        ├── components.js
        ├── document.js
        ├── shapes.js
        ├── styles.js
        ├── text.js
        ├── layout.js
        ├── rename.js
        ├── svg.js
        ├── html-generator.js
        ├── ui.js
        └── utils/
            ├── plugin.js
            ├── encoding.js
            ├── helpers.js
            └── index.js
```

### Core File Relationships

Here's a visual representation of the core files and their relationships in the plugin build process:

```
src/conduit_mcp_plugin/
├── ui-template.html      # Source template for the UI
├── styles.css            # Base styling for the UI
├── connection.css        # Styling for connection panel
├── tabs.css              # Styling for tabs
├── progress.css          # Styling for progress container
├── build.js            # Node.js script to bundle plugin core (code.js)
├── direct-build.js       # Node.js script to build UI (ui.html) using esbuild
├── build-ts.js           # Alternative Node.js script for UI build using tsc
├── manifest.json       # Figma plugin manifest
├── dist/                 # Output directory
│   ├── ui.html           # Final generated plugin UI
│   └── code.js           # Final bundled plugin logic
├── components/           # HTML components for UI
│   ├── header.html
│   ├── tabs.html
│   ├── connection-panel.html
│   ├── progress-container.html
│   └── about-panel.html
├── js/                   # JavaScript modules for UI logic
│   ├── state.js
│   ├── connection.js
│   ├── ui-controller.js
│   ├── tab-manager.js
│   ├── message-handler.js
│   └── main.js
└── src/                  # Source code for plugin core (TypeScript/JavaScript)
    ├── client.ts         # TypeScript for client communication
    ├── ui.ts             # TypeScript for UI functionality
    ├── index.js          # Main entry point for plugin core
    └── modules/          # Modular components for plugin core logic
        ├── commands.js
        ├── components.js
        ├── document.js
        ├── shapes.js
        ├── styles.js
        ├── text.js
        ├── layout.js
        ├── rename.js
        ├── svg.js
        ├── html-generator.js
        ├── ui.js
        └── utils/
            ├── plugin.js
            ├── encoding.js
            ├── helpers.js
            └── index.js
```

### Detailed Build Pipeline Implementation

The plugin build process involves two main parts: the plugin core (`code.js`) and the UI (`ui.html`).

**1. Plugin Core Bundling (`code.js`)**

The `build.js` Node.js script is used to bundle the core plugin logic. It manually concatenates JavaScript files from `src/` and `src/modules/`, stripping import/export syntax to create a single `code.js` file.

The primary command for this is:
```bash
bun run build:plugin
```
This script reads files in a specific order, starting with utilities, then feature modules, and finally the main `index.js`.

**2. Plugin UI Generation (`ui.html`)**

The recommended script for building the UI is `direct-build.js`. This Node.js script uses `esbuild` to handle TypeScript compilation and then manually inlines all necessary assets into `ui.html`.

The command for this is:
```bash
bun run build:ui
```

This script performs the following steps:
- Uses `esbuild` to bundle `src/ui.ts` into a temporary JavaScript file.
- Reads `ui-template.html`.
- Reads and combines all CSS files (`styles.css`, `connection.css`, `tabs.css`, `progress.css`) and inlines them into the template.
- Reads and inlines all HTML component files from `components/` into their respective placeholders in the template.
- Reads and combines all JavaScript files from `js/` and inlines them into the template.
- Inlines the bundled JavaScript from `src/ui.ts` (generated by esbuild) into the template.
- Writes the final combined content to `dist/ui.html`.
- Cleans up temporary files.

### File Interaction Matrix

This matrix illustrates how source files are processed to create the final output files consumed by Figma:

| Source File(s)                               | Build Script    | Output File   | Figma Consumption |
|----------------------------------------------|-----------------|---------------|-------------------|
| `src/index.js`, `src/modules/**/*.js`        | `build.js`      | `code.js`     | Plugin execution  |
| `ui-template.html`, `*.css`, `components/*.html`, `js/*.js`, `src/ui.ts` | `direct-build.js` | `ui.html`     | Direct render     |
| `manifest.json`                              | (Build process) | `manifest.json` | Plugin config     |

### Available Build Scripts (from `package.json`)

-   `build:plugin`: Generate the main plugin code (`code.js`) using `build.js`.
-   `build:ui`: Build the UI (`ui.html`) using `direct-build.js` (recommended).
-   `watch:plugin`: Watch for changes in `src/conduit_mcp_plugin/src` and rebuild `code.js` automatically using `nodemon` and `build.js`.
-   `build:all`: Run `tsup` (for the server), then `build:plugin`, then `build:ui`.
-   `dev:all`: Run `tsup --watch` and `watch:plugin` concurrently.

### Critical Build Dependencies and Features

-   **Bun**: Used to run the build scripts defined in `package.json`.
-   **Node.js**: The custom build scripts (`build.js`, `direct-build.js`, `build-ts.js`) are Node.js scripts.
-   **esbuild**: Used by `direct-build.js` for efficient TypeScript/JavaScript bundling.
-   **nodemon**: Used in `watch:plugin` script for automatic rebuilding on file changes.
-   **typescript**: For type checking and compilation.
-   **concurrently**: Used in `dev:all` script to run multiple commands simultaneously.
-   **tsup**: Used for building the main MCP server code (separate from the plugin build).

### Development Workflow

1.  Edit files in the `src/`, `js/`, or `components/` directories within `src/conduit_mcp_plugin/`.
2.  Run `bun run build:all` to build both the plugin core and UI.
3.  Alternatively, run `bun run dev:all` to automatically rebuild on changes (watches both server and plugin core).
4.  Reload the plugin in Figma to see changes.

### Extending the Plugin

When adding new functionality:

1. Add your new functions to the appropriate module (or create a new module) in `src/conduit_mcp_plugin/src/modules/`.
2. Export your functions from the module.
3. Add them to the module's exported operations object (if applicable).
4. Register them in the `commands.js` file to make them available via the command interface.

For UI changes:
1. Modify the appropriate component in the `src/conduit_mcp_plugin/components/` directory.
2. Add any new JavaScript to the `src/conduit_mcp_plugin/js/` directory.
3. For TypeScript functionality, update files in the `src/conduit_mcp_plugin/src/` directory (specifically `ui.ts` or related files).
4. Run `bun run build:ui` to rebuild the UI.

## UI Implementation

The plugin's user interface is built using standard web technologies (HTML, CSS, JavaScript) and runs within Figma's webview. It's designed to provide a clear interface for connecting to the MCP server and viewing command interactions.

### Core UI Components

The UI is composed of several key elements:

1.  **Manifest Configuration (`manifest.json`)**:
    The `manifest.json` file defines the entry point for the UI:

    ```json
    {
      // ... other manifest fields
      "ui": {
        "html": "ui.html"
        // Note: CSS is inlined in ui.html by the build process
      }
      // ... other manifest fields
    }
    ```
    This tells Figma to load `dist/ui.html` (as configured by the build process) when the plugin UI is opened.

2.  **HTML Structure (`ui.html`)**:
    The `ui.html` file (generated from `ui-template.html` and components) provides the visual layout. Key parts include:

    ```html
    <div class="container">
      <div id="status-bar" class="status-connected">
        <span class="channel-id">Channel: {{channelId}}</span>
        <button id="copy-button">Copy ID</button>
      </div>
      <div class="message-log" id="message-container"></div>
    </div>
    ```
    This structure includes elements for displaying the connection status, the channel ID for connecting the MCP server, and a log area for messages and command feedback.

3.  **CSS Styling**:
    Styling is handled by CSS files (`styles.css`, `connection.css`, `tabs.css`, `progress.css`) which are combined and inlined into `ui.html` during the build process. The styling aims to provide a look and feel consistent with the native Figma interface.

    ```css
    .container {
      padding: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
      /* ... other styles */
    }

    .status-connected {
      background: #18A0FB; /* Example color */
      color: white;
      padding: 8px;
      border-radius: 4px;
      /* ... other styles */
    }

    .message-log {
      max-height: 300px; /* Example height */
      overflow-y: auto;
      margin-top: 12px;
      /* ... other styles */
    }
    ```

4.  **JavaScript Logic**:
    The UI's interactivity and communication are managed by JavaScript files located in the `js/` directory and the bundled TypeScript from `src/ui.ts`. This code handles events, updates the DOM, and communicates with the plugin's core logic (`code.js`) and the MCP server (via WebSocket).

    ```javascript
    // Snippet illustrating communication flow (Simplified)
    // In code.js (plugin core):
    figma.ui.onmessage = async (message) => {
      switch (message.type) {
        case 'CONNECT_WS':
          // Logic to connect to WebSocket server
          break;
        case 'EXECUTE_COMMAND':
          // Logic to handle commands from UI
          break;
        // ... other message types
      }
    };

    // In UI JavaScript (e.g., main.js or bundled ui.ts):
    // Example of sending a message to the plugin core
    parent.postMessage({ pluginMessage: { type: 'CONNECT_WS', channelId: '...' } }, '*');

    // Example of receiving messages from the plugin core
    window.onmessage = (event) => {
      const pluginMessage = event.data.pluginMessage;
      if (pluginMessage) {
        switch (pluginMessage.type) {
          case 'WS_RESPONSE':
            // Update UI with response data
            break;
          // ... other message types
        }
      }
    };
    ```
    This includes managing the WebSocket connection state and handling bidirectional message passing between the UI and the plugin's core `code.js`.

### UI Interaction Flow

The user interface follows a specific flow:

1.  **Initialization Sequence**:
    When the user opens the plugin, Figma loads the `manifest.json`, which points to `dist/ui.html` and `dist/code.js`. The browser loads `ui.html` (with inlined styles and UI scripts). The `code.js` script initializes and establishes communication with the UI. The UI then typically attempts to establish a WebSocket connection to the MCP server, and its status updates accordingly.

2.  **Command Execution Flow**:
    User interactions within the UI (e.g., clicking a button, typing text) trigger UI events. These events are handled by the UI's JavaScript, which sends a message to the plugin's core (`code.js`) using `parent.postMessage`. The `code.js` receives this message via `figma.ui.onmessage`, processes the request (e.g., sends a command to the WebSocket server), and handles the response.

3.  **Real-time Feedback System**:
    The UI provides real-time feedback through:
    -   Connection status indicators (e.g., connected, disconnected, connecting).
    -   A message log displaying commands sent and responses received from the MCP server.
    -   Display of the unique channel ID for connecting the external MCP server.

### Advanced UI Considerations

The UI aims to provide a good user experience through:

-   **Context-Aware Controls**: UI elements may dynamically adjust based on the current state (e.g., connection status).
-   **Performance Optimization**: The implementation considers performance to maintain responsiveness, especially with message exchanges.
-   **Accessibility Features**: Standard accessibility practices like keyboard navigation and screen reader compatibility are considered.

### Cross-Platform Considerations

Development accounts for potential differences between Figma Desktop and Web environments:

-   **Figma Desktop vs Web**: Variations in file system access, security policies, and performance are considered during development.
-   **Multi-Instance Handling**: The plugin architecture supports multiple instances running concurrently, using unique channel IDs for WebSocket pairing and managing resource cleanup.

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

This plugin works with Claude's Model Context Protocol to provide a bridge between an AI Agent and Figma, allowing the AI Agent to create and manipulate design elements programmatically.

## Troubleshooting

If the plugin isn't working as expected:

1. Check the browser console for errors within Figma.
2. Ensure the plugin has been bundled correctly by running the appropriate build commands:
   - For core code issues: `bun run build:plugin`
   - For UI issues: `bun run build:ui`
3. Try the all-in-one build: `bun run build:all`
4. Verify that Figma has access to the compiled code files in the `dist/` directory.
5. If UI elements are missing or styles are incorrect, ensure all component files, CSS files, and JavaScript files in `js/` were processed correctly by `direct-build.js`.

## Dependencies

-   **Bun**: JavaScript runtime and package manager.
-   **Node.js**: Environment for running build scripts.
-   **esbuild**: Used by `direct-build.js` for efficient TypeScript/JavaScript bundling.
-   **nodemon**: Used in `watch:plugin` script for automatic rebuilding on file changes.
-   **typescript**: For type checking and compilation.
-   **concurrently**: Used in `dev:all` script to run multiple commands simultaneously.
-   **tsup**: Used for building the main MCP server code (separate from the plugin build).
