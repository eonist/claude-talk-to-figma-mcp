# Tests

This directory contains the test suite for the Conduit MCP/Figma integration project, which validates WebSocket-based Figma operations.

## Structure

```
tests/
├── test-runner.js          # Main test orchestration
├── test-runner-core.js     # Core test utilities
├── helper.js               # Random value generators
└── scene/                  # Test scenarios
    ├── shape-scene.js      # Basic shapes (rectangles, ellipses, stars, vectors)
    ├── text-scene.js       # Text elements
    ├── style-scene.js      # Gradients and styling
    ├── transform-scene.js  # Positioning, sizing, rotation
    ├── boolean-scene.js    # Boolean operations
    ├── flatten-scene.js    # Node flattening
    ├── effect-scene.js     # Drop shadows, blur effects
    ├── svg-scene.js        # SVG import and manipulation
    ├── image-scene.js      # Image handling
    ├── mask-scene.js       # Masking operations
    └── layout-scene.js     # Auto-layout functionality
```

## Running Tests

```bash
# Run with random channel
node test-runner.js run

# Run with specific channel
node test-runner.js run --channel mychannel

# Custom port
PORT=3000 node test-runner.js run
```

## Helper Functions

**helper.js** provides random test data generators:

```javascript
randomColor()      // Returns {r, g, b, a} with values 0-1
randomFontSize()   // Returns 8-40 pixels
randomFontWeight() // Returns standard weight (100-900)
```

## Test Architecture

- **WebSocket connection** to localhost:3055 (configurable via PORT)
- **Channel-based communication** for test isolation
- **Sequential scene execution** with pass/fail tracking
- **Visual indicators**: ✅ for pass, 🚫 for fail

Each scene creates test elements, applies operations, and validates responses through the MCP protocol.

## Configuration

Enable/disable scenes by commenting/uncommenting in `test-runner.js`:

```javascript
const sequence = [
    shapeScene,     // Basic shapes
    styleScene,     // Gradients
    // transformScene, // Disabled
];
```

Tests require a running MCP server that supports the Figma command set.

Citations:
[1] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60313916/1f309a83-8c83-4a40-bf6c-a7dbc7ac89bd/helper.js
[2] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60313916/62dbb121-64ae-4ff9-8836-6d84b7ce4197/test-runner.js
[3] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60313916/4da8cdce-4a4a-4d23-a1f1-c81ace9ff60b/flatten-scene.js
[4] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60313916/3bdf0474-7ed8-42f2-be90-2358c656fd47/mask-scene.js
[5] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60313916/e61babb9-9089-47f8-a6f5-ce81b4b322de/effect-scene.js
[6] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60313916/de5de93d-f110-4e80-ad8f-dd8675fa7861/svg-scene.js
[7] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60313916/5268f1ba-cf72-4b2e-ba45-574f60cc186a/transform-scene.js
[8] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60313916/c4cfe38a-440c-4694-820c-fb528d5fe9ff/style-scene.js
[9] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60313916/fa124e0f-8d4d-4f32-a335-1cfeb4604827/shape-scene.js
[10] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60313916/760de6a4-9213-4803-88b5-dff618c83a35/image-scene.js
[11] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60313916/2f5c28e6-6d54-4428-8f63-05e6b99477a6/layout-scene.js

---
Answer from Perplexity: pplx.ai/share