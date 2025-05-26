# MCP Commands for Conduit Integration

**Most commands support both single and batch operations via a unified API:**
- You can pass either a single object or an array of objects (using a pluralized parameter) for batch operations.
- The same command name is used for both single and batch; the input type determines the behavior.
- For commands that require a specific batch parameter (e.g., `nodeIds`), this is documented per command.
- For batch operations, pass an array to the singular command (e.g., `rectangles` for `create_rectangle`). Plural command names are deprecated.

# Available MCP Commands

### Communication
- [join](#join): Join a specific communication channel

### Document and Information
- [get_document_info](#get_document_info): Get detailed information about the current Figma document
- [get_selection](#get_selection): Get information about the current selection in Figma
- [set_selection](#set_selection): Set the current selection in Figma to one or more node IDs
- [get_node_info](#get_node_info): Get detailed information about one or more nodes (single or batch)

**Pages:**
- [get_doc_pages](#get_doc_pages): Get all pages in the current Figma document
- [set_page](#set_page): Set the current active page in Figma
- [create_page](#create_page): Create a new page
- [duplicate_page](#duplicate_page): Duplicate a Figma page and all its children as a new page

**Shapes:**
- [create_rectangle](#create_rectangle): Create one or more rectangles
- [create_frame](#create_frame): Create one or more frames
- [create_line](#create_line): Create one or more lines
- [create_ellipse](#create_ellipse): Create one or more ellipses
- [create_polygon](#create_polygon): Create one or more polygons
- [create_star](#create_star): Create one or more star shapes
- [create_vector](#create_vector): Create one or more vectors
- [get_vector](#get_vector): Retrieve a single vector node’s properties by ID
- [get_vectors](#get_vectors): Retrieve multiple vector nodes’ properties by IDs

**Text:**
- [set_text](#set_text): Set or create one or more text elements
- [set_text_content](#set_text_content): Set text content of an existing node
- [get_styled_text_segments](#get_styled_text_segments): Get text segments with specific styling
- [get_text_style](#get_text_style): Get text style properties for one or more nodes (single or batch)
- [scan_text_nodes](#scan_text_nodes): Scan all text nodes in the selected node
- [set_text_style](#set_text_style): Set one or more text style properties (font, size, weight, spacing, case, decoration, etc.) on one or more nodes (unified)
- [load_font_async](#load_font_async): Load a font asynchronously

**Components:**
- [get_components](#get_components): Get components from the current document, a team library, or remote team libraries (unified)
- [create_components_from_node](#create_components_from_node): Convert nodes to components
- [create_component_instance](#create_component_instance): Create component instances
- [detach_instances](#detach_instances): Detach one or more component instances from their masters (single or batch)

**Images and SVG:**
- [get_image](#get_image): Extract image fills or export nodes as images (single or batch)
- [set_image](#set_image): Set or insert images from URLs, local files, or base64 data (single or batch)
- [set_svg_vector](#set_svg_vector): Set or insert SVG vectors
- [get_svg_vector](#get_svg_vector): Get SVG markup for one or more vector nodes

**Styling:**
- [get_doc_style](#get_doc_style): Get all styles from the document
- [get_node_style](#get_node_style): Get all style properties for one or more nodes
- [set_fill_and_stroke](#set_fill_and_stroke): Set fill and/or stroke color(s) for one or more nodes
- [set_style](#set_style): Set style or styles
- [create_gradient_style](#create_gradient_style): Create one or more gradient styles
- [set_gradient](#set_gradient): Set gradient(s) directly or by style variable

**Effects and Layout:**
- [create_effect_style_variable](#create_effect_style_variable): Create one or more effect style variables
- [set_effect](#set_effect): Set effect(s) directly or by style variable
- [apply_effect_style](#apply_effect_style): Apply an effect style
- [set_auto_layout](#set_auto_layout): Configure auto layout (single or batch)
- [set_auto_layout_resizing](#set_auto_layout_resizing): Set hug or fill sizing mode
- [set_corner_radius](#set_corner_radius): Set corner radius

**Positioning & Sizing & Boolean Operations:**
- [move_node](#move_node): Move one or more nodes (single or batch)
- [reorder_node](#reorder_node): Reorder one or more nodes in their parents' children arrays (single or batch)
- [resize_node](#resize_node): Resize a node (single or batch)
- [rotate_node](#rotate_node): Rotate a node around a specified pivot (center, corner, or custom)
- [flatten_node](#flatten_node): Flatten a single node (or batch) or selection
- [set_matrix_transform](#set_matrix_transform): Set a transformation matrix on one or more nodes (single or batch)
- [boolean](#boolean): Perform union, subtract, intersect, or exclude on nodes or selection

**Node Management:**
- [group_node](#group_node): Group or ungroup nodes
- [convert_rectangle_to_frame](#convert_rectangle_to_frame): Convert a rectangle to a frame
- [delete_node](#delete_node): Delete one or more nodes
- [duplicate_node](#duplicate_node): Duplicate a node (single or batch)
- [set_node](#set_node): Set or insert a child node into a parent (single)
- [set_node_prop](#set_node_prop): Set node properties (locked, visible, etc.) for one or more nodes

### Grids, Guides, and Constraints
- [set_grid](#set_grid): Create, update, or delete one or more layout grids on nodes
- [get_grid](#get_grid): Get all layout grids for one or more nodes
- [set_guide](#set_guide): Add or delete one or more guides on the current page
- [get_guide](#get_guide): Get all guides on the current page
- [set_constraint](#set_constraint): Set constraints for one or more nodes
- [get_constraint](#get_constraint): Get constraints for one or more nodes

### Figma Variables (Design Tokens)
- [set_variable](#set_variable): Create, update, or delete one or more Figma Variables (design tokens)
- [get_variable](#get_variable): Query Figma Variables by type, collection, mode, or IDs
- [apply_variable_to_node](#apply_variable_to_node): Apply a Figma Variable to a node property
- [switch_variable_mode](#switch_variable_mode): Switch the mode for a Figma Variable collection

### Export 
- [export_node_as_image](#export_node_as_image): Export a node as an image
- [get_html](#get_html): Generate HTML structure from Figma nodes
- [get_css_async](#get_css_async): Get CSS properties from a node

### Misc
- [rename_layer](#rename_layer): Rename nodes (single or batch, each with its own name)
- [ai_rename_layer](#ai_rename_layer): AI-powered renaming 
- [set_variant](#set_variant): Create, add, rename, delete, organize, or batch create variants/properties in a component set
- [get_variant](#get_variant): Get info about variants/properties for one or more component sets
- [subscribe_event](#subscribe_event): Subscribe to or unsubscribe from a Figma event (e.g., selection_change, document_change)
- [get_annotation](#get_annotation): Get annotation(s) for one or more nodes
- [set_annotation](#set_annotation): Set, update, or delete annotation(s) for one or more nodes
- [create_button](#create_button): Create a complete button



# Examples:

### set_text
Creates one or more text elements in Figma. Accepts either a single text config (via the 'text' property) or an array of configs (via the 'texts' property). If 'width' and 'height' are provided, creates a bounded text box; otherwise, creates a regular text node.

**Parameters:**
- text (object, optional): A single text element configuration. Should include at least x, y, and text.
- texts (array, optional): An array of text element configurations for batch creation.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created text node ID(s).

**Example:**
```json
{
  "command": "set_text",
  "params": {
    "text": {
      "x": 100,
      "y": 200,
      "text": "Hello, Figma!",
      "fontSize": 24,
      "fontWeight": 700,
      "fontColor": { "r": 0, "g": 0, "b": 0, "a": 1 },
      "name": "Title"
    }
  }
}
```
```json
{
  "command": "set_text",
  "params": {
    "texts": [
      { "x": 10, "y": 20, "text": "First", "fontSize": 16 },
      { "x": 120, "y": 20, "text": "Second", "fontWeight": 400 }
    ]
  }
}
```

### get_doc_pages
Get information about all pages in the current Figma document.

**Parameters:**
- None

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the pages info as JSON.

**Example:**
```json
{ "command": "get_doc_pages", "params": {} }
```

### create_rectangle
Creates one or more rectangle shape nodes in the specified Figma document. Accepts either a single rectangle config (via the 'rectangle' property) or an array of configs (via the 'rectangles' property). Optionally, you can provide a name, a parent node ID to attach the rectangle(s) to, and a corner radius for rounded corners.

**Parameters:**
- rectangle (object, optional): A single rectangle configuration object. Each object should include coordinates, dimensions, and optional properties for a rectangle.
- rectangles (array, optional): An array of rectangle configuration objects. Each object should include coordinates, dimensions, and optional properties for a rectangle.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created rectangle node ID(s).

**Example:**
```json
{
  "command": "create_rectangle",
  "params": {
    "rectangle": {
      "x": 100,
      "y": 200,
      "width": 300,
      "height": 150,
      "name": "Button Background",
      "cornerRadius": 8
    }
  }
}
```
```json
{
  "command": "create_rectangle",
  "params": {
    "rectangles": [
      { "x": 10, "y": 20, "width": 100, "height": 50, "name": "Rect1" },
      { "x": 120, "y": 20, "width": 80, "height": 40 }
    ]
  }
}
```

### set_page
Create, delete, rename, or set current page (single or batch).

**Parameters:**
- page (object, optional): Single page operation
  - pageId (string, optional): Target page (for delete/rename/set current)
  - name (string, optional): Name for create/rename
  - delete (boolean, optional): If true, delete the page
  - setCurrent (boolean, optional): If true, set as current page
- pages (array, optional): Batch of page operations (same shape as above)

**Returns:**
- Array of result objects for each operation.

**Example:**
```json
{ "command": "set_page", "params": { "page": { "pageId": "123:456", "setCurrent": true } } }
```
```json
{ "command": "set_page", "params": { "pages": [
  { "pageId": "123:456", "delete": true },
  { "name": "New Page" }
] } }
```

### create_page
Create a new page.

**Parameters:**
- name (string, required): Name of the new page.

**Returns:**
- Object with success status and new page info.

**Example:**
```json
{ "command": "set_page", "params": { "page": { "name": "New Page" } } }
```

### duplicate_page
Duplicate a Figma page and all its children as a new page.

**Parameters:**
- pageId (string): The ID of the page to duplicate.
- newPageName (string, optional): Optional name for the new page.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the new page info as JSON.

**Example:**
```json
{ "command": "duplicate_page", "params": { "pageId": "123:456" } }
```
```json
{ "command": "duplicate_page", "params": { "pageId": "123:456", "newPageName": "My Duplicated Page" } }
```

### ai_rename_layer
AI-powered renaming of nodes in Figma.

**Parameters:**
- nodeId (string, optional): The unique Figma node ID to rename.
- nodeIds (array of string, optional): Array of node IDs to rename.
- prompt (string, optional): AI prompt to guide renaming.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the new names or errors.

**Example:**
```json
{ "nodeId": "123:456", "prompt": "Rename to descriptive names" }
```
```json
{ "nodeIds": ["123:456", "789:101"], "prompt": "Rename to descriptive names" }
```
### apply_effect_style
Applies an effect style to a node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to update.
- effectStyleId (string): The ID of the effect style to apply.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the updated node's ID.

**Example:**
```json
{
  "nodeId": "123:456",
  "effectStyleId": "S:effect123"
}
```
### apply_variable_to_node
Apply a Figma Variable to a node property.

**Parameters:**
- nodeId (string): The Figma node ID.
- variableId (string): The variable ID to apply.
- property (string): The property to apply the variable to (e.g., "fill", "stroke", "fontSize").

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the result.

**Example:**
```json
{
  "nodeId": "123:456",
  "variableId": "var123",
  "property": "fill"
}
```
### boolean
Perform boolean operations (union, subtract, intersect, exclude) on Figma nodes.

**Parameters:**
- operation (string, required): One of "union", "subtract", "intersect", "exclude".
- nodeIds (array of string, required): Array of node IDs to operate on (must contain at least 2).

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the result.

**Example:**
```json
{ "operation": "union", "nodeIds": ["123:456", "789:101"] }
```
```json
{ "operation": "subtract", "nodeIds": ["123:456", "789:101"] }
```
### convert_rectangle_to_frame
Convert a rectangle to a frame in Figma.

**Parameters:**
- nodeId (string): The unique Figma rectangle node ID to convert.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the converted frame node ID.

**Example:**
```json
{ "nodeId": "123:456" }
```
### create_button
Creates a complete button with background and text in Figma at the specified coordinates. You can customize size, text, colors, font, corner radius, name, and parent node.

**Parameters:**
- x (number, optional): X coordinate.
- y (number, optional): Y coordinate.
- width (number, optional): Width of the button.
- height (number, optional): Height of the button.
- text (string, optional): Button text.
- background (object, optional): RGBA background color.
- textColor (object, optional): RGBA text color.
- fontSize (number, optional): Font size.
- fontWeight (number, optional): Font weight.
- cornerRadius (number, optional): Corner radius.
- name (string, optional): Name of the button.
- parentId (string, optional): Parent node ID.
- buttons (array, optional): Array of button configs for batch creation.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created button's frame, background, and text node IDs.

**Example:**
```json
{
  "x": 100,
  "y": 200,
  "width": 120,
  "height": 40,
  "text": "Click Me",
  "background": { "r": 0.2, "g": 0.5, "b": 0.8, "a": 1 },
  "textColor": { "r": 1, "g": 1, "b": 1, "a": 1 },
  "fontSize": 16,
  "fontWeight": 600,
  "cornerRadius": 8,
  "name": "Primary Button"
}
```
### create_components_from_node
Converts one or more existing nodes into components in Figma.

**Parameters:**
- entry (object, optional): { nodeId: string, maintain_position?: boolean } (for single node)
- entries (array, optional): Array<{ nodeId: string, maintain_position?: boolean }> (for batch)
- skip_errors (boolean, optional): Whether to skip errors (default: false)

**Returns:**
- content: Array of objects. Each object contains:
    - type: "text"
    - text: JSON string with created component IDs and any errors.

**Example:**
```json
{ "entry": { "nodeId": "123:456" } }
```
```json
{ "entries": [{ "nodeId": "123:456" }, { "nodeId": "789:101", "maintain_position": true }], "skip_errors": true }
```
### create_effect_style_variable
Creates one or more effect style variables in Figma.

**Parameters:**
- effects (object or array): Either a single effect definition or an array of effect definitions.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created effect style(s) ID(s) or a summary.

**Example:**
```json
{
  "effects": {
    "type": "DROP_SHADOW",
    "color": "#000000",
    "offset": { "x": 0, "y": 2 },
    "radius": 4,
    "spread": 0,
    "visible": true,
    "blendMode": "NORMAL",
    "opacity": 0.5,
    "name": "Drop Shadow"
  }
}
```
```json
{
  "effects": [
    {
      "type": "DROP_SHADOW",
      "color": "#000000",
      "offset": { "x": 0, "y": 2 },
      "radius": 4,
      "spread": 0,
      "visible": true,
      "blendMode": "NORMAL",
      "opacity": 0.5,
      "name": "Drop Shadow"
    },
    {
      "type": "INNER_SHADOW",
      "color": "#333333",
      "offset": { "x": 0, "y": -2 },
      "radius": 3,
      "spread": 0,
      "visible": true,
      "blendMode": "NORMAL",
      "opacity": 0.3,
      "name": "Inner Shadow"
    }
  ]
}
```
### create_ellipse
Creates one or more ellipse nodes in the specified Figma document. Accepts either a single ellipse config (via the 'ellipse' property) or an array of configs (via the 'ellipses' property). Optionally, you can provide a name, a parent node ID, fill color, stroke color, and stroke weight.

**Parameters:**
- ellipse (object, optional): A single ellipse configuration object. Each object should include coordinates, dimensions, and optional properties for an ellipse.
- ellipses (array, optional): An array of ellipse configuration objects. Each object should include coordinates, dimensions, and optional properties for an ellipse.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created ellipse node ID(s).

**Example:**
```json
{
  "command": "create_ellipse",
  "params": {
    "ellipse": {
      "x": 60,
      "y": 80,
      "width": 120,
      "height": 90,
      "name": "Ellipse1"
    }
  }
}
```
```json
{
  "command": "create_ellipse",
  "params": {
    "ellipses": [
      { "x": 10, "y": 20, "width": 100, "height": 50, "name": "Ellipse1" },
      { "x": 120, "y": 20, "width": 80, "height": 40 }
    ]
  }
}
```
### create_frame
Creates one or more frame nodes in the specified Figma document. Accepts either a single frame config (via the 'frame' property) or an array of configs (via the 'frames' property). Optionally, you can provide a name, a parent node ID, fill color, stroke color, and stroke weight.

**Parameters:**
- frame (object, optional): A single frame configuration object. Each object should include coordinates, dimensions, and optional properties for a frame.
- frames (array, optional): An array of frame configuration objects. Each object should include coordinates, dimensions, and optional properties for a frame.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created frame node ID(s).

**Example:**
```json
{
  "command": "create_frame",
  "params": {
    "frame": {
      "x": 50,
      "y": 100,
      "width": 400,
      "height": 300,
      "name": "Main Frame"
    }
  }
}
```
```json
{
  "command": "create_frame",
  "params": {
    "frames": [
      { "x": 10, "y": 20, "width": 100, "height": 50, "name": "Frame1" },
      { "x": 120, "y": 20, "width": 80, "height": 40 }
    ]
  }
}
```
### create_gradient_style
Creates one or more gradient style variables in Figma.

**Parameters:**
- gradients (object or array): Either a single gradient definition or an array of gradient definitions.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created gradient(s) ID(s) or a summary.

**Example:**
```json
{
  "gradients": {
    "name": "Primary Gradient",
    "gradientType": "LINEAR",
    "stops": [
      { "position": 0, "color": [1, 0, 0, 1] },
      { "position": 1, "color": [0, 0, 1, 1] }
    ]
  }
}
```
```json
{
  "gradients": [
    {
      "name": "Primary Gradient",
      "gradientType": "LINEAR",
      "stops": [
        { "position": 0, "color": [1, 0, 0, 1] },
        { "position": 1, "color": [0, 0, 1, 1] }
      ]
    },
    {
      "name": "Secondary Gradient",
      "gradientType": "RADIAL",
      "stops": [
        { "position": 0, "color": [0, 1, 0, 1] },
        { "position": 1, "color": [0, 0, 0, 1] }
      ]
    }
  ]
}
```
### create_line
Creates one or more line nodes in the specified Figma document. Accepts either a single line config (via the 'line' property) or an array of configs (via the 'lines' property). Optionally, you can provide a parent node ID, stroke color, and stroke weight.

**Parameters:**
- line (object, optional): A single line configuration object. Each object should include coordinates, dimensions, and optional properties for a line.
- lines (array, optional): An array of line configuration objects. Each object should include coordinates, dimensions, and optional properties for a line.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created line node ID(s).

**Example:**
```json
{
  "command": "create_line",
  "params": {
    "line": {
      "x1": 10,
      "y1": 20,
      "x2": 110,
      "y2": 20
    }
  }
}
```
```json
{
  "command": "create_line",
  "params": {
    "lines": [
      { "x1": 10, "y1": 20, "x2": 110, "y2": 20 },
      { "x1": 20, "y1": 30, "x2": 120, "y2": 30 }
    ]
  }
}
```
### create_polygon
Creates one or more polygon nodes in the specified Figma document. Accepts either a single polygon config (via the 'polygon' property) or an array of configs (via the 'polygons' property). Optionally, you can provide a name, a parent node ID, fill color, stroke color, and stroke weight.

**Parameters:**
- polygon (object, optional): A single polygon configuration object. Each object should include coordinates, dimensions, and optional properties for a polygon.
- polygons (array, optional): An array of polygon configuration objects. Each object should include coordinates, dimensions, and optional properties for a polygon.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created polygon node ID(s).

**Example:**
```json
{
  "command": "create_polygon",
  "params": {
    "polygon": {
      "x": 10,
      "y": 20,
      "width": 100,
      "height": 100,
      "sides": 5
    }
  }
}
```
```json
{
  "command": "create_polygon",
  "params": {
    "polygons": [
      { "x": 10, "y": 20, "width": 100, "height": 100, "sides": 5 },
      { "x": 120, "y": 20, "width": 80, "height": 80, "sides": 6 }
    ]
  }
}
```
### create_rectangle
Creates one or more rectangle shape nodes in the specified Figma document. Accepts either a single rectangle config (via the 'rectangle' property) or an array of configs (via the 'rectangles' property). Optionally, you can provide a name, a parent node ID to attach the rectangle(s) to, and a corner radius for rounded corners.

**Parameters:**
- rectangle (object, optional): A single rectangle configuration object. Each object should include coordinates, dimensions, and optional properties for a rectangle.
- rectangles (array, optional): An array of rectangle configuration objects. Each object should include coordinates, dimensions, and optional properties for a rectangle.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created rectangle node ID(s).

**Example:**
```json
{
  "command": "create_rectangle",
  "params": {
    "rectangle": {
      "x": 100,
      "y": 200,
      "width": 300,
      "height": 150,
      "name": "Button Background",
      "cornerRadius": 8
    }
  }
}
```
```json
{
  "command": "create_rectangle",
  "params": {
    "rectangles": [
      { "x": 10, "y": 20, "width": 100, "height": 50, "name": "Rect1" },
      { "x": 120, "y": 20, "width": 80, "height": 40 }
    ]
  }
}
```
### delete_node
Delete one or more nodes in Figma.

**Parameters:**
- nodeId (string, optional): A single node ID to delete.
- nodeIds (array of string, optional): An array of node IDs to delete.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the deleted node's ID(s).

**Example:**
```json
{ "nodeId": "123:456" }
```
```json
{ "nodeIds": ["123:456", "789:101"] }
```
### detach_instances
Detaches one or more Figma component instances from their masters.

**Parameters:**
- instanceId (string, optional): A single instance ID to detach.
- instanceIds (array of string, optional): An array of instance IDs to detach.
- options (object, optional): { maintain_position?: boolean, skip_errors?: boolean }

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the detached instance's ID or error info.

**Example:**
```json
{ "instanceId": "123:456" }
```
```json
{ "instanceIds": ["123:456", "789:101"], "options": { "skip_errors": true } }
```
### duplicate_node
Duplicate a node (single or batch) in Figma.

**Parameters:**
- node (object, optional): Single node clone configuration object with properties:
  - nodeId (string): ID of the node to clone.
  - position (object, optional): { x: number, y: number } position for the clone.
  - offsetX (number, optional): X offset.
  - offsetY (number, optional): Y offset.
  - parentId (string, optional): Parent node ID.
- nodes (array, optional): Array of node clone configuration objects.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the new node ID(s).

**Example:**
```json
{ "node": { "nodeId": "123:456", "position": { "x": 100, "y": 200 } } }
```
```json
{ "nodes": [
  { "nodeId": "123:456", "offsetX": 10, "offsetY": 20 },
  { "nodeId": "789:101", "parentId": "456:789" }
] }
```
### export_node_as_image
Export a node as an image from Figma in the specified format and scale.

**Parameters:**
- nodeId (string): The unique Figma node ID to export.
- format (string, optional): The image format to export: "PNG", "JPG", "SVG", or "PDF". Defaults to "PNG".
- scale (number, optional): The export scale factor. Must be a positive number. Defaults to 1.

**Returns:**
- content: Array of objects. Each object contains type: "image", data (image data), and mimeType (image mime type).

**Example:**
```json
{ "nodeId": "123:456", "format": "PNG", "scale": 2 }
```
### flatten_node
Flatten a single node (or batch) or selection in Figma, merging all child vector layers and shapes into a single vector layer.

**Parameters:**
- nodeId (string, optional): A single node ID to flatten.
- nodeIds (array of string, optional): Array of node IDs to flatten.
- selection (boolean, optional): If true, flattens all currently selected nodes.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the results for each node.

**Example:**
```json
{ "nodeId": "123:456" }
```
```json
{ "nodeIds": ["123:456", "789:101"] }
```
```json
{ "selection": true }
```

### set_matrix_transform
Set a transformation matrix on one or more Figma nodes (single or batch). Supports translation, scale, rotation, skew, and rotation around a point.

**Parameters:**
- entry (object, optional): Single matrix transform config: { nodeId: string, matrix: number[6] }
- entries (array, optional): Batch of matrix transform configs: [{ nodeId: string, matrix: number[6] }]
- options (object, optional): { skipErrors?: boolean }

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the result for each node.

**Example (single):**
```json
{
  "command": "set_matrix_transform",
  "params": {
    "entry": {
      "nodeId": "123:456",
      "matrix": [0.7071, 0.7071, -0.7071, 0.7071, 170.71, -12.13]
    }
  }
}
```
**Example (batch):**
```json
{
  "command": "set_matrix_transform",
  "params": {
    "entries": [
      { "nodeId": "123:456", "matrix": [1, 0, 0, 1, 100, 0] },
      { "nodeId": "789:101", "matrix": [0.5, 0, 0, 0.5, 0, 0] },
      { "nodeId": "111:222", "matrix": [0.866, 0.5, -0.5, 0.866, 0, 0] }
    ],
    "options": { "skipErrors": true }
  }
}
```
**Matrix format:** `[a, b, c, d, e, f]` corresponds to the 2D affine transform:
```
| a c e |
| b d f |
| 0 0 1 |
```
- Translation: [1, 0, 0, 1, x, y]
- Scale: [sx, 0, 0, sy, 0, 0]
- Rotation θ: [cosθ, sinθ, -sinθ, cosθ, 0, 0]
- Skew X by θ: [1, 0, tanθ, 1, 0, 0]
- Skew Y by φ: [1, tanφ, 0, 1, 0, 0]
- Rotation around (cx, cy): [cosθ, sinθ, -sinθ, cosθ, cx - cx*cosθ + cy*sinθ, cy - cx*sinθ - cy*cosθ]

### get_annotation
Get annotation(s) for one or more Figma nodes.

**Parameters:**
- nodeId (string, optional): Node ID for single node.
- nodeIds (array of string, optional): Array of node IDs for batch.

**Returns:**
- content: For single: { nodeId, annotations }, for batch: Array<{ nodeId, annotations }>.

**Example:**
```json
{ "nodeId": "123:456" }
```
```json
{ "nodeIds": ["123:456", "789:101"] }
```
### get_components
Get components from the current document, a team library, or remote team libraries.

**Parameters:**
- source (string, required): "local" | "team" | "remote"
- team_id (string, optional): Figma team ID (required if source is "team")
- page_size (number, optional): Number of components per page (for team/remote)
- after (string|number, optional): Pagination cursor (for team/remote)

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the components info as JSON.

**Example:**
```json
{ "source": "local" }
```
```json
{ "source": "team", "team_id": "123456" }
```
```json
{ "source": "remote" }
```

**Note:** This command is currently not implemented. Legacy component queries have been removed. Please implement a unified component retrieval method.
### get_constraint
Get constraints for one or more Figma nodes (optionally including children).

**Parameters:**
- nodeId (string, optional): Single node ID (if omitted, use current selection).
- nodeIds (array of string, optional): Multiple node IDs.
- includeChildren (boolean, optional): If true, include constraints for all children.

**Returns:**
- content: Array of constraint info for each node, including children if requested.

**Example:**
```json
{ "nodeId": "123:456", "includeChildren": true }
```
```json
{ "nodeIds": ["123:456", "789:101"] }
```
### get_css_async
Get CSS properties from a node.

**Parameters:**
- nodeId (string, optional): The unique Figma node ID to get CSS from.
- format (string, optional): The format to return CSS in: "object", "string", or "inline".

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the CSS properties as JSON.

**Example:**
```json
{ "nodeId": "123:456", "format": "string" }
```
### get_grid
Get all layout grids for one or more Figma nodes (FRAME, COMPONENT, INSTANCE).

**Parameters:**
- nodeId (string, optional): Single node ID.
- nodeIds (array of string, optional): Multiple node IDs.

**Returns:**
- content: For single: { nodeId, grids: [...] }, for batch: Array<{ nodeId, grids: [...] }>.

**Example:**
```json
{ "nodeId": "123:456" }
```
```json
{ "nodeIds": ["123:456", "789:101"] }
```
### get_guide
Get all guides on the current Figma page.

**Parameters:**
- None

**Returns:**
- content: Array of guides, each with { axis, offset }.

**Example:**
```json
{}
```
### get_html
Generate HTML structure from Figma nodes.

**Parameters:**
- nodeId (string): The unique Figma node ID to generate HTML from.
- format (string, optional): The HTML output format: "semantic", "div-based", or "webcomponent". Defaults to "semantic".
- cssMode (string, optional): The CSS handling mode: "inline", "classes", or "external". Defaults to "classes".

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the generated HTML string.

**Example:**
```json
{ "nodeId": "123:456", "format": "semantic", "cssMode": "classes" }
```
### get_image
Extract image fills or export nodes as images (single or batch).

**Parameters:**
- nodeId (string, optional): The unique Figma node ID to export.
- nodeIds (array of string, optional): Array of node IDs to export.

**Returns:**
- content: Array of objects. Each object contains a type: "image", data (image data), and mimeType (image mime type).

**Example:**
```json
{ "nodeId": "123:456" }
```
```json
{ "nodeIds": ["123:456", "789:101"] }
```
### get_doc_style
Get all styles from the document.

### get_node_style
Get all style properties (fills, strokes, effects, text styles, style IDs, etc.) for one or more nodes.

**Parameters:**
- nodeId (string, optional): Single node to inspect.
- nodeIds (array of string, optional): Array of node IDs for batch.

At least one of nodeId or nodeIds is required.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the style info as JSON.

**Example:**
```json
{ "nodeId": "123:456" }
```
```json
{ "nodeIds": ["123:456", "789:101"] }
```

**Parameters:**
- None

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the styles info as JSON.

**Example:**
```json
{}
```
### get_styled_text_segments
Get text segments with specific styling in a text node.

**Parameters:**
- nodeId (string): The unique Figma text node ID to analyze.
- property (string): The style property to analyze segments by.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the styled text segments as JSON.

**Example:**
```json
{ "nodeId": "123:456", "property": "fontSize" }
```
### get_svg_vector
Get SVG markup for one or more vector nodes.

**Parameters:**
- nodeId (string, optional): The unique Figma vector node ID to get SVG for.
- nodeIds (array, optional): Array of vector node IDs.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the SVG markup as a string.

**Example:**
```json
{ "nodeId": "123:456" }
```
```json
{ "nodeIds": ["123:456", "789:101"] }
```

### get_text_style
Extracts text style properties from one or more nodes.

**Parameters:**
- nodeId (string, optional): Single node ID.
- nodeIds (array of string, optional): Multiple node IDs.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the text style info as JSON.

**Example:**
```json
{ "nodeId": "123:456" }
```
### get_variable
Query Figma Variables by type, collection, mode, or IDs.

**Parameters:**
- type (string, optional): Filter by variable type ("COLOR", "NUMBER", "STRING", "BOOLEAN").
- collection (string, optional): Filter by collection.
- mode (string, optional): Filter by mode.
- ids (array of string, optional): Filter by specific variable ids.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the variable(s) info as JSON.

**Example:**
```json
{ "type": "COLOR" }
```
```json
{ "collection": "Theme" }
```
```json
{ "ids": ["var123", "var456"] }
```
### get_variant
Get info about variants/properties for one or more component sets.

**Parameters:**
- componentSetId (string, optional): Single component set node.
- componentSetIds (array of string, optional): Multiple component set nodes.

**Returns:**
- content: For single: { componentSetId, variants: [...] }, for batch: Array<{ componentSetId, variants: [...] }>.

**Example:**
```json
{ "componentSetId": "123:456" }
```
```json
{ "componentSetIds": ["123:456", "789:101"] }
```
### group_node
Group or ungroup nodes in Figma.

**Parameters:**
- group (boolean): If true, group nodes; if false, ungroup a group node.
- nodeIds (array of string, optional): The nodes to group (required if grouping).
- name (string, optional): Name for the group (only if grouping).
- nodeId (string, optional): The group node to ungroup (required if ungrouping).

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the result.

**Example:**
```json
{ "group": true, "nodeIds": ["123:456", "789:101"], "name": "My Group" }
```
```json
{ "group": false, "nodeId": "123:456" }
```
### load_font_async
Load a font asynchronously in Figma.

**Parameters:**
- family (string): The font family to set.
- style (string, optional): The font style to set (e.g., 'Bold', 'Italic').

**Returns:**
- content: Array containing a text message with the loaded font.
  Example: { "content": [{ "type": "text", "text": "Font loaded: Roboto" }] }

**Example:**
```json
{ "family": "Roboto" }
```
```json
{ "family": "Roboto", "style": "Bold" }
```

### move_node
Move one or more nodes (single or batch) to new positions in Figma.

**Parameters:**
- move (object, optional): Single move configuration object with properties:
  - nodeId (string): The unique Figma node ID to move.
  - x (number): New X position.
  - y (number): New Y position.
- moves (array, optional): Array of move configuration objects.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the moved node ID(s) and new position(s).

**Example:**
```json
{ "move": { "nodeId": "123:456", "x": 100, "y": 200 } }
```
```json
{ "moves": [
  { "nodeId": "123:456", "x": 100, "y": 200 },
  { "nodeId": "789:101", "x": 300, "y": 400 }
] }
```
### rename_layer
Renames one or more nodes in Figma. Accepts either a single rename config (via 'rename') or an array of configs (via 'renames').

**Parameters:**
- rename (object, optional): A single rename configuration object ({ nodeId, newName, setAutoRename? }).
- renames (array, optional): An array of rename configuration objects.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the original and new name(s).

**Example:**
```json
{ "rename": { "nodeId": "123:456", "newName": "New Name", "setAutoRename": true } }
```
```json
{ "renames": [
  { "nodeId": "123:456", "newName": "Layer 1" },
  { "nodeId": "789:101", "newName": "Layer 2", "setAutoRename": false }
] }
```
### reorder_node
Reorder one or more nodes in their parents' children arrays (single or batch).

**Parameters:**
- reorder (object, optional): Single reorder configuration object with properties:
  - nodeId (string): The ID of the node to reorder.
  - direction (string, optional): "up", "down", "front", or "back".
  - index (number, optional): New index position.
- reorders (array, optional): Array of reorder configuration objects.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the results and any errors.

**Example:**
```json
{ "reorder": { "nodeId": "123:456", "direction": "up" } }
```
```json
{ "reorders": [
  { "nodeId": "123:456", "index": 2 },
  { "nodeId": "789:101", "direction": "front" }
] }
```
### resize_node
Resize a node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to resize.
- width (number): The new width for the node, in pixels.
- height (number): The new height for the node, in pixels.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the resized node's ID and new size.

**Example:**
```json
{
  "nodeId": "123:456",
  "width": 200,
  "height": 100
}
```

### rotate_node
Rotate a node in Figma around a specified pivot point.

**Parameters:**
- nodeId (string): The unique Figma node ID to rotate.
- angle (number): The rotation angle in degrees (positive is clockwise).
- pivot (string, optional): The pivot point for rotation. One of "center" (default), "top-left", "top-right", "bottom-left", "bottom-right", or "custom".
- pivotPoint (object, optional): Required if pivot is "custom". An object with x and y coordinates (absolute).

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the rotated node's ID, angle, and pivot info.

**Example:**
```json
{
  "nodeId": "123:456",
  "angle": 45
}
```
```json
{
  "nodeId": "123:456",
  "angle": 90,
  "pivot": "top-left"
}
```
```json
{
  "nodeId": "123:456",
  "angle": 180,
  "pivot": "bottom-right"
}
```
```json
{
  "nodeId": "123:456",
  "angle": 30,
  "pivot": "custom",
  "pivotPoint": { "x": 500, "y": 200 }
}
```
### scan_text_nodes
Scan all text nodes in the selected Figma node.

**Parameters:**
- nodeId (string): The unique Figma node ID to scan.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the scan status and results.

**Example:**
```json
{ "nodeId": "123:456" }
```
### set_auto_layout
Configure auto layout (single or batch) on a node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to update.
- properties (object): Auto layout properties to set.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the update result.

**Example:**
```json
{
  "nodeId": "123:456",
  "properties": {
    "layoutMode": "VERTICAL",
    "primaryAxisAlign": "MIN",
    "counterAxisAlign": "CENTER",
    "paddingTop": 10,
    "paddingBottom": 10,
    "paddingLeft": 10,
    "paddingRight": 10,
    "itemSpacing": 8
  }
}
```
### set_auto_layout_resizing
Set hug or fill sizing mode on an auto layout frame or child node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to update.
- axis (string): The axis to set sizing mode for: "horizontal" or "vertical".
- mode (string): The sizing mode to set: "FIXED", "HUG", or "FILL".

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the updated node's ID.

**Example:**
```json
{
  "nodeId": "123:456",
  "axis": "horizontal",
  "mode": "HUG"
}
```
### set_constraint
Set constraints (left/right/top/bottom/center/scale/stretch) for one or more Figma nodes.

**Parameters:**
- constraint (object, optional): Single constraint operation
  - nodeId (string): Target node
  - horizontal (string): "left", "right", "center", "scale", "stretch"
  - vertical (string): "top", "bottom", "center", "scale", "stretch"
- constraints (array, optional): Batch of constraint operations (same shape as above)
- applyToChildren (boolean, optional): If true, apply to all children
- maintainAspectRatio (boolean, optional): If true, use "scale" for both axes

**Returns:**
- content: Array of result objects for each operation.

**Example:**
```json
{
  "constraint": {
    "nodeId": "123:456",
    "horizontal": "left",
    "vertical": "top"
  }
}
```
### set_corner_radius
Set the corner radius of a node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to update.
- radius (number): The new corner radius to set, in pixels.
- corners (array of boolean, optional): An array of four booleans indicating which corners to apply the radius to, in the order: [top-left, top-right, bottom-right, bottom-left].

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the updated node's ID.

**Example:**
```json
{
  "nodeId": "123:456",
  "radius": 8,
  "corners": [true, true, false, false]
}
```
### set_effect
Set effect(s) directly or by style variable on one or more nodes in Figma.

**Parameters:**
- entries (object or array): Either a single application or an array of applications. Each entry includes:
  - nodeId (string): The unique Figma node ID to update.
  - effects (object or array, optional): Effect or array of effects to set directly.
  - effectStyleId (string, optional): The ID of the effect style variable to apply.

**Returns:**
- content: Array containing a text message with the updated node(s) ID(s) or a summary.

**Example:**
```json
{
  "entries": {
    "nodeId": "123:456",
    "effects": [
      {
        "type": "DROP_SHADOW",
        "color": "#000000",
        "offset": { "x": 0, "y": 2 },
        "radius": 4,
        "spread": 0,
        "visible": true,
        "blendMode": "NORMAL",
        "opacity": 0.5
      }
    ]
  }
}
```
```json
{
  "entries": [
    {
      "nodeId": "123:456",
      "effects": [
        {
          "type": "DROP_SHADOW",
          "color": "#000000",
          "offset": { "x": 0, "y": 2 },
          "radius": 4,
          "spread": 0,
          "visible": true,
          "blendMode": "NORMAL",
          "opacity": 0.5
        }
      ]
    },
    {
      "nodeId": "789:101",
      "effectStyleId": "S:effect123"
    }
  ]
}
```
### set_fill_and_stroke
Set fill and/or stroke color(s) for one or more nodes.

**Parameters:**
- nodeId (string, required): The unique Figma node ID to update.
- fillColor (object, optional): Fill color.
- strokeColor (object, optional): Stroke color.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the update result.

**Example:**
```json
{
  "nodeId": "123:456",
  "fillColor": { "r": 1, "g": 0, "b": 0, "a": 1 },
  "strokeColor": { "r": 0, "g": 0, "b": 0, "a": 1 }
}
```

### set_gradient
Set a gradient on one or more nodes in Figma, either directly or by style variable.

**Parameters:**
- entries (object or array): Either a single application or an array of applications. Each entry includes:
  - nodeId (string): The unique Figma node ID to update.
  - gradientType (string, optional): Type of gradient ("LINEAR", "RADIAL", "ANGULAR", "DIAMOND").
  - stops (array, optional): Array of color stops.
  - gradientStyleId (string, optional): The ID of the gradient style to apply.
  - applyTo (string, optional): Where to apply the gradient ("FILL", "STROKE", "BOTH").

**Returns:**
- content: Array containing a text message with the updated node(s) ID(s) or a summary.

**Example:**
```json
{
  "entries": {
    "nodeId": "123:456",
    "gradientType": "LINEAR",
    "stops": [
      { "position": 0, "color": [1, 0, 0, 1] },
      { "position": 1, "color": [0, 0, 1, 1] }
    ],
    "applyTo": "FILL"
  }
}
```
```json
{
  "entries": [
    {
      "nodeId": "123:456",
      "gradientType": "LINEAR",
      "stops": [
        { "position": 0, "color": [1, 0, 0, 1] },
        { "position": 1, "color": [0, 0, 1, 1] }
      ],
      "applyTo": "FILL"
    },
    {
      "nodeId": "789:101",
      "gradientStyleId": "S:gradient123",
      "applyTo": "STROKE"
    }
  ]
}
```
### set_grid
Create, update, or delete one or more layout grids on Figma nodes (FRAME, COMPONENT, INSTANCE).

**Parameters:**
- entry (object, optional): Single grid operation
  - nodeId (string): Node to modify
  - gridIndex (number, optional): Index of grid to update/delete (omit for create)
  - properties (object, optional): Grid properties (for create/update)
  - delete (boolean, optional): If true, delete the grid at gridIndex
- entries (array, optional): Batch of grid operations (same shape as above)

**Returns:**
- content: Array of result objects for each operation.

**Example:**
```json
{
  "entry": {
    "nodeId": "123:456",
    "properties": {
      "pattern": "COLUMNS",
      "sectionSize": 12,
      "gutterSize": 24,
      "count": 4
    }
  }
}
```
### set_guide
Add or delete one or more guides on the current Figma page.

**Parameters:**
- guide (object, optional): Single guide operation
  - axis (string): "X" or "Y"
  - offset (number): Position in canvas coordinates
  - delete (boolean, optional): If true, delete the guide at axis/offset
- guides (array, optional): Batch of guide operations (same shape as above)

**Returns:**
- content: Array of result objects for each operation.

**Example:**
```json
{ "guide": { "axis": "X", "offset": 100 } }
```
```json
{ "guides": [
  { "axis": "X", "offset": 100 },
  { "axis": "Y", "offset": 200, "delete": true }
] }
```

### set_image
Set or insert images from URLs, local files, or base64 data (single or batch).

**Parameters:**
- image (object, optional): A single image configuration object.
- images (array, optional): An array of image configuration objects.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the inserted image node ID(s).

**Example:**
```json
{ "image": { "url": "https://example.com/image.png" } }
```
```json
{ "images": [
  { "url": "https://example.com/image1.png" },
  { "url": "https://example.com/image2.png" }
] }
```
### set_node
Set or insert a child node into a parent node in Figma.

**Parameters:**
- parentId (string): ID of the parent node.
- childId (string): ID of the child node to insert.
- index (number, optional): Optional insertion index (0-based).

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the parentId, childId, index, success status, and any error message.

**Example:**
```json
{ "parentId": "123:456", "childId": "789:101", "index": 0 }
```

### set_node_prop
Set node properties (locked, visible, etc.) for one or more nodes in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to update.
- properties (object): Properties to set (e.g., locked, visible).

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the update result.

**Example:**
```json
{
  "nodeId": "123:456",
  "properties": {
    "locked": true,
    "visible": false
  }
}
```

### set_style
Set style or styles on one or more nodes.

**Parameters:**
- nodeId (string, optional): The unique Figma node ID to update.
- styles (object, optional): Style properties to set.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the update result.

**Example:**
```json
{
  "nodeId": "123:456",
  "styles": {
    "fillColor": { "r": 0, "g": 1, "b": 0, "a": 1 },
    "strokeWeight": 2
  }
}
```
### set_svg_vector
Set or insert SVG vectors in Figma.

**Parameters:**
- svg (object, optional): A single SVG configuration object.
- svgs (array, optional): An array of SVG configuration objects.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the inserted SVG vector node ID(s).

**Example:**
```json
{ "svg": { "svg": "<svg>...</svg>" } }
```
```json
{ "svgs": [
  { "svg": "<svg>...</svg>" },
  { "svg": "<svg>...</svg>" }
] }
```
### set_text_content
Sets the text content of one or more text nodes in Figma.

**Parameters:**
- nodeId (string, optional): The unique Figma text node ID to update (for single).
- text (string, optional): The new text content to set for the node (for single).
- texts (array, optional): Array of { nodeId, text } for batch updates.

At least one of (nodeId + text) or texts is required.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the update result.

**Example:**
```json
{ "nodeId": "123:456", "text": "Hello, world!" }
```
```json
{ "texts": [{ "nodeId": "123:457", "text": "Hello" }, { "nodeId": "123:458", "text": "World" }] }
```
### set_text_style
Sets one or more text style properties (font, size, weight, spacing, case, decoration, etc.) on one or more nodes in Figma.

**Parameters:**
- nodeId (string, optional): The unique Figma text node ID to update (for single).
- styles (object, optional): Object of style properties to set (for single).
- entries (array, optional): Array of { nodeId, styles } for batch updates.

At least one of (nodeId + styles) or entries is required.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the update result.

**Example:**
```json
{ "nodeId": "123:456", "styles": { "fontSize": 18, "fontWeight": 700 } }
```
```json
{ "entries": [
    { "nodeId": "123:456", "styles": { "fontSize": 18 } },
    { "nodeId": "789:101", "styles": { "fontWeight": 400, "letterSpacing": 2 } }
  ]
}
```
### set_variable
Create, update, or delete one or more Figma Variables (design tokens).

**Parameters:**
- variables (object or array, optional): For create/update. Either a single variable definition, a single update (with id), or an array of either.
- ids (string or array, optional): For delete. Either a single variable id or an array of ids.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the result or summary.

**Example:**
```json
{
  "variables": {
    "name": "Primary Color",
    "type": "COLOR",
    "value": "#ff0000",
    "collection": "Theme",
    "description": "Primary brand color"
  }
}
```
```json
{
  "ids": ["var123", "var456"]
}
```
### set_variant
Create, add, rename, delete, organize, or batch create variants/properties in a component set.

**Parameters:**
- variant (object, optional): Single variant operation
  - componentSetId (string): Target component set node
  - action (string): "create", "add", "rename", "delete", "organize", "batch_create"
  - properties (object, optional): Property name/value pairs for the variant
  - variantId (string, optional): For rename/delete
  - propertyName/newPropertyName (string, optional): For renaming properties
  - propertyValue/newPropertyValue (string, optional): For renaming property values
  - templateComponentId (string, optional): For batch create
  - propertiesList (array, optional): For batch create
  - organizeBy (array, optional): For organizing variants in a grid
- variants (array, optional): Batch of variant operations (same shape as above)

**Returns:**
- content: Array of result objects for each operation.

**Example:**
```json
{
  "variant": {
    "componentSetId": "123:456",
    "action": "create",
    "properties": { "state": "active" }
  }
}
```
### subscribe_event
Subscribe to or unsubscribe from a Figma event (e.g., selection_change, document_change).

**Parameters:**
- eventType (string): Event type to subscribe to (e.g., "selection_change", "document_change").
- filter (object, optional): Optional filter for event payloads.
- subscribe (boolean): true to subscribe, false to unsubscribe.
- subscriptionId (string, optional): The subscription ID to remove (required for unsubscribe).

**Returns:**
- content: For subscribe: { subscriptionId }, for unsubscribe: { success: true }.

**Example:**
```json
{ "eventType": "selection_change", "subscribe": true }
```
```json
{ "eventType": "selection_change", "subscribe": false, "subscriptionId": "sub123" }
```
### switch_variable_mode
Switch the mode for a Figma Variable collection (e.g., light/dark theme).

**Parameters:**
- collection (string): The variable collection name.
- mode (string): The mode to switch to.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the result.

**Example:**
```json
{
  "collection": "Theme",
  "mode": "dark"
}
```
