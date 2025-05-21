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

**Text:**
- [set_text](#set_text): Set or create one or more text elements
- [set_text_content](#set_text_content): Set text content of an existing node
- [get_styled_text_segments](#get_styled_text_segments): Get text segments with specific styling
- [get_text_style](#get_text_style): Get text style properties for one or more nodes (single or batch)
- [scan_text_nodes](#scan_text_nodes): Scan all text nodes in the selected node
- [set_text_style](#set_text_style): Set one or more text style properties (font, size, weight, spacing, case, decoration, etc.) on one or more nodes (unified)
- [set_paragraph_spacing](#set_paragraph_spacing): Set the paragraph spacing of one or more text nodes (single or batch)
- [set_line_height](#set_line_height): Set the line height of one or more text nodes (single or batch, range-based)
- [set_letter_spacing](#set_letter_spacing): Set the letter spacing of one or more text nodes (single or batch, range-based)
- [set_text_case](#set_text_case): Set the text case of one or more text nodes (single or batch, range-based)
- [set_text_decoration](#set_text_decoration): Set the text decoration of one or more text nodes (single or batch, range-based)
- [load_font_async](#load_font_async): Load a font asynchronously

**Components:**
- [get_components](#get_components): Get components from the current document, a team library, or remote team libraries (unified)
- [create_components_from_node](#create_components_from_node): Convert nodes to components
- [create_component_instance](#create_component_instance): Create component instances
- [create_button](#create_button): Create a complete button
- [detach_instances](#detach_instances): Detach one or more component instances from their masters (single or batch)

**Images and SVG:**
- [get_image](#get_image): Extract image fills or export nodes as images (single or batch)
- [set_image](#set_image): Set or insert images from URLs, local files, or base64 data (single or batch)
- [set_svg_vector](#set_svg_vector): Set or insert SVG vectors
- [get_svg_vector](#get_svg_vector): Get SVG markup for one or more vector nodes

**Styling:**
- [get_style](#get_style): Get all styles from the document
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
- [flatten_node](#flatten_node): Flatten a single node (or batch) or selection
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

# Examples: 

### get_doc_pages
Get all pages in the current Figma document.

**Parameters:** none

**Example:**
```json
{ "command": "get_doc_pages", "params": {} }
```

---

### set_page
Set the current active page in Figma.

**Parameters:**
- pageId (string)

**Example:**
```json
{ "command": "set_page", "params": { "pageId": "123:456" } }
```

---

### create_page
Create a new page.

**Parameters:**
- name (string, optional)

**Example:**
```json
{ "command": "create_page", "params": { "name": "New Page" } }
```

---

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

**Notes:**
- Duplicates all children of the original page.
- The new page will have a unique name and independent children.
- Use this command to duplicate an entire page and its contents.

### create_rectangle
Create one or more rectangles.

**Parameters:**
- x (number)
- y (number)
- width (number)
- height (number)
- name (string, optional)
- parentId (string, optional)
- cornerRadius (number, optional)

**Example:**
```json
{ "command": "create_rectangle", "params": { "x": 100, "y": 100, "width": 200, "height": 100, "name": "Button Background" } }
```

### create_frame
Create one or more frame nodes in the specified Figma document.

**Parameters:**
- frame (object, optional): A single frame configuration object with properties:
  - x (number): X coordinate for the top-left corner.
  - y (number): Y coordinate for the top-left corner.
  - width (number): Width in pixels.
  - height (number): Height in pixels.
  - name (string, optional): Name for the frame node.
  - parentId (string, optional): Figma node ID of the parent.
  - fillColor (object, optional): Fill color.
  - strokeColor (object, optional): Stroke color.
  - strokeWeight (number, optional): Stroke weight.
- frames (array, optional): An array of frame configuration objects (same shape as above).

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created frame node ID(s).

**Example:**
```json
{ "command": "create_frame", "params": {
  "frame": {
    "x": 50,
    "y": 100,
    "width": 400,
    "height": 300,
    "name": "Main Frame"
  }
} }
```
```json
{ "command": "create_frame", "params": {
  "frames": [
    { "x": 10, "y": 20, "width": 100, "height": 50, "name": "Frame1" },
    { "x": 120, "y": 20, "width": 80, "height": 40 }
  ]
} }
```

**Notes:**
- Width and height must be greater than zero.
- If parentId is invalid, the frame will be added to the root.
- Fill and stroke colors must be valid color objects.
- Useful for generating UI containers, artboards, or design primitives programmatically.
- Batch creation is efficient for generating multiple frames at once.

### create_line
Create one or more line nodes in the specified Figma document.

**Parameters:**
- line (object, optional): A single line configuration object with properties:
  - x1 (number): X coordinate for the start point.
  - y1 (number): Y coordinate for the start point.
  - x2 (number): X coordinate for the end point.
  - y2 (number): Y coordinate for the end point.
  - parentId (string, optional): Figma node ID of the parent.
  - strokeColor (object, optional): Stroke color.
  - strokeWeight (number, optional): Stroke weight.
- lines (array, optional): An array of line configuration objects (same shape as above).

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created line node ID(s).

**Example:**
```json
{ "command": "create_line", "params": {
  "line": {
    "x1": 10,
    "y1": 20,
    "x2": 110,
    "y2": 20
  }
} }
```
```json
{ "command": "create_line", "params": {
  "lines": [
    { "x1": 10, "y1": 20, "x2": 110, "y2": 20 },
    { "x1": 20, "y1": 30, "x2": 120, "y2": 30 }
  ]
} }
```

**Notes:**
- Start and end points must not be identical.
- If parentId is invalid, the line will be added to the root.
- Stroke color must be a valid color object.
- Useful for generating connectors, dividers, or design primitives programmatically.
- Batch creation is efficient for generating multiple lines or connectors at once.

### create_ellipse
Create one or more ellipses.

**Parameters:**
- x (number)
- y (number)
- width (number)
- height (number)
- name (string, optional)
- parentId (string, optional)
- fillColor (object, optional)
- strokeColor (object, optional)
- strokeWeight (number, optional)

**Example:**
```json
{ "command": "create_ellipse", "params": { "x": 100, "y": 100, "width": 50, "height": 30, "name": "Profile Avatar" } }
```

### create_polygon
Create one or more polygons.

**Parameters:**
- x (number)
- y (number)
- width (number)
- height (number)
- sides (number)
- name (string, optional)
- parentId (string, optional)
- fillColor (object, optional)
- strokeColor (object, optional)
- strokeWeight (number, optional)

**Example:**
```json
{ "command": "create_polygon", "params": { "x": 100, "y": 100, "width": 50, "height": 50, "sides": 6, "name": "Hexagon" } }
```

### create_star
Create one or more star shapes.

**Parameters:**
- x (number)
- y (number)
- width (number)
- height (number)
- points (number, optional)
- name (string, optional)
- parentId (string, optional)
- fillColor (object, optional)
- strokeColor (object, optional)
- strokeWeight (number, optional)

**Example:**
```json
{ "command": "create_star", "params": { "x": 100, "y": 100, "width": 50, "height": 50, "points": 5, "name": "Star" } }
```

### create_vector
Create one or more vectors.

**Parameters:**
- x (number)
- y (number)
- width (number)
- height (number)
- vectorPaths (array)
- name (string, optional)
- parentId (string, optional)
- fillColor (object, optional)
- strokeColor (object, optional)
- strokeWeight (number, optional)

**Example:**
```json
{ "command": "create_vector", "params": {
  "x": 100, "y": 100, "width": 50, "height": 50,
  "vectorPaths": [{ "data": "M10 10 H 90 V 90 H 10 Z" }]
} }
```

### set_text
Set or create one or more text elements.

**Parameters:**
- x (number)
- y (number)
- text (string)
- fontSize (number, optional)
- fontWeight (number, optional)
- fontColor (object, optional)
- name (string, optional)
- parentId (string, optional)

**Example:**
```json
{ "command": "set_text", "params": { "x": 100, "y": 100, "text": "Hello, Figma!", "fontSize": 24, "name": "Heading" } }
```

### set_text_content
Set text content of an existing node.

**Parameters:**
- nodeId (string)
- text (string)

**Example:**
```json
{ "command": "set_text_content", "params": { "nodeId": "123:456", "text": "Updated text content" } }
```

### get_styled_text_segments
Get text segments with specific styling in a text node.

**Parameters:**
- nodeId (string)
- property (string)

**Example:**
```json
{ "command": "get_styled_text_segments", "params": { "nodeId": "123:456", "property": "fontWeight" } }
```

### get_text_style
Get text style properties for one or more nodes.

**Parameters:**
- nodeId (string)

**Example:**
```json
{ "command": "get_text_style", "params": { "nodeId": "123:456" } }
```

### scan_text_nodes
Scan all text nodes in the selected node.

**Parameters:**
- nodeId (string)

**Example:**
```json
{ "command": "scan_text_nodes", "params": { "nodeId": "123:456" } }
```

### set_text_style
Set one or more text style properties.

**Parameters:**
- nodeId (string)
- styles (object)

**Example:**
```json
{ "command": "set_text_style", "params": { "nodeId": "123:456", "styles": { "fontSize": 18, "fontWeight": 700 } } }
```

### set_paragraph_spacing
Set paragraph spacing of one or more text nodes.

**Parameters:**
- nodeId (string)
- paragraphSpacing (number)

**Example:**
```json
{ "command": "set_paragraph_spacing", "params": { "nodeId": "123:456", "paragraphSpacing": 12 } }
```

### set_line_height
Set line height of one or more text nodes.

**Parameters:**
- nodeId (string)
- ranges (array)

**Example:**
```json
{ "command": "set_line_height", "params": { "nodeId": "123:456", "ranges": [ { "start": 0, "end": 5, "value": 150, "unit": "PERCENT" } ] } }
```

### set_letter_spacing
Set letter spacing of one or more text nodes.

**Parameters:**
- nodeId (string)
- spacings (array)

**Example:**
```json
{ "command": "set_letter_spacing", "params": { "nodeId": "123:456", "spacings": [ { "start": 0, "end": 5, "value": 2, "unit": "PIXELS" } ] } }
```

### set_text_case
Set text case of one or more text nodes.

**Parameters:**
- nodeId (string)
- ranges (array)

**Example:**
```json
{ "command": "set_text_case", "params": { "nodeId": "123:456", "ranges": [ { "start": 0, "end": 5, "value": "UPPER" } ] } }
```

### set_text_decoration
Set text decoration of one or more text nodes.

**Parameters:**
- nodeId (string)
- ranges (array)

**Example:**
```json
{ "command": "set_text_decoration", "params": { "nodeId": "123:456", "ranges": [ { "start": 0, "end": 5, "type": "UNDERLINE" } ] } }
```

### load_font_async
Load a font asynchronously.

**Parameters:**
- family (string)
- style (string, optional)

**Example:**
```json
{ "command": "load_font_async", "params": { "family": "Inter", "style": "Bold" } }
```

### get_components
Get components from the current document or team libraries.

**Parameters:**
- source (string)

**Example:**
```json
{ "command": "get_components", "params": { "source": "local" } }
```

### create_components_from_node
Convert nodes to components.

**Parameters:**
- entry (object)

**Example:**
```json
{ "command": "create_components_from_node", "params": { "entry": { "nodeId": "123:456" } } }
```

### create_component_instance
Create component instances.

**Parameters:**
- entry (object)

**Example:**
```json
{ "command": "create_component_instance", "params": { "entry": { "componentKey": "123:456", "x": 100, "y": 100 } } }
```

### create_button
Create a complete button.

**Parameters:**
- x (number)
- y (number)
- text (string)

**Example:**
```json
{ "command": "create_button", "params": { "x": 100, "y": 100, "text": "Click Me" } }
```

### detach_instances
Detach component instances.

**Parameters:**
- instanceId (string)

**Example:**
```json
{ "command": "detach_instances", "params": { "instanceId": "123:456" } }
```

### get_image
Extract image fills or export nodes as images.

**Parameters:**
- nodeId (string)

**Example:**
```json
{ "command": "get_image", "params": { "nodeId": "123:456" } }
```

### set_image
Set or insert images.

**Parameters:**
- image (object)

**Example:**
```json
{ "command": "set_image", "params": { "image": { "url": "https://example.com/image.jpg", "x": 100, "y": 100 } } }
```

### set_svg_vector
Set or insert SVG vectors.

**Parameters:**
- svg (string)

**Example:**
```json
{ "command": "set_svg_vector", "params": { "svg": "<svg .../>", "x": 100, "y": 100 } }
```

### get_svg_vector
Get SVG markup for vector nodes.

**Parameters:**
- nodeId (string)

**Example:**
```json
{ "command": "get_svg_vector", "params": { "nodeId": "123:456" } }
```

### get_style
Get all styles.

**Example:**
```json
{ "command": "get_style", "params": {} }
```

### set_fill_and_stroke
Set fill and/or stroke colors.

**Parameters:**
- entries (array)

**Example:**
```json
{ "command": "set_fill_and_stroke", "params": { "entries": [ { "nodeId": "123:456", "fillColor": { "r": 1, "g": 0, "b": 0 }, "strokeColor": { "r": 0, "g": 0, "b": 0 } } ] } }
```

### set_style
Set styles.

**Parameters:**
- entries (array)

**Example:**
```json
{ "command": "set_style", "params": { "entries": [ { "styleType": "PAINT", "properties": { "name": "Accent", "paints": [ { "type": "SOLID", "color": { "r": 1, "g": 0, "b": 0, "a": 1 } } ] } } ] } }
```

### create_gradient_style
Create gradient styles.

**Parameters:**
- gradients (array)

**Example:**
```json
{ "command": "create_gradient_style", "params": { "gradients": [ { "name": "Primary Linear", "gradientType": "LINEAR", "stops": [ { "position": 0, "color": [ 1, 0, 0, 1 ] }, { "position": 1, "color": [ 0, 0, 1, 1 ] } ] } ] } }
```

### set_gradient
Set gradients.

**Parameters:**
- entries (array)

**Example:**
```json
{ "command": "set_gradient", "params": { "entries": [ { "nodeId": "123:456", "gradientType": "LINEAR", "stops": [ { "position": 0, "color": [ 1, 0, 0, 1 ] }, { "position": 1, "color": [ 0, 0, 1, 1 ] } ], "applyTo": "FILL" } ] } }
```

### create_effect_style_variable
Create effect style variables.

**Parameters:**
- effects (array)

**Example:**
```json
{ "command": "create_effect_style_variable", "params": { "effects": [ { "name": "Soft Shadow", "type": "DROP_SHADOW", "color": "#000", "radius": 8, "opacity": 0.2 } ] } }
```

### set_effect
Set effects.

**Parameters:**
- entries (array)

**Example:**
```json
{ "command": "set_effect", "params": { "entries": [ { "nodeId": "123:456", "effects": [ { "type": "DROP_SHADOW", "color": "#000", "radius": 4 } ] } ] } }
```

### apply_effect_style
Apply effect style.

**Parameters:**
- nodeId (string)
- effectStyleId (string)

**Example:**
```json
{ "command": "apply_effect_style", "params": { "nodeId": "123:456", "effectStyleId": "effect123" } }
```

### set_auto_layout
Set auto layout.

**Parameters:**
- layouts (array)

**Example:**
```json
{ "command": "set_auto_layout", "params": { "layouts": [ { "nodeId": "1:23", "mode": "VERTICAL", "itemSpacing": 20 } ] } }
```

### set_auto_layout_resizing
Set auto layout resizing.

**Parameters:**
- nodeId (string)
- axis (string)
- mode (string)

**Example:**
```json
{ "command": "set_auto_layout_resizing", "params": { "nodeId": "123:456", "axis": "horizontal", "mode": "HUG" } }
```

### set_corner_radius
Set corner radius.

**Parameters:**
- nodeId (string)
- radius (number)

**Example:**
```json
{ "command": "set_corner_radius", "params": { "nodeId": "123:456", "radius": 8 } }
```

### move_node
Move node.

**Parameters:**
- move (object)

**Example:**
```json
{ "command": "move_node", "params": { "move": { "nodeId": "123:456", "x": 100, "y": 200 } } }
```

### reorder_node
Reorder node.

**Parameters:**
- reorders (array)

**Example:**
```json
{ "command": "reorder_node", "params": { "reorders": [ { "nodeId": "123:456", "direction": "up" } ] } }
```

### resize_node
Resize node.

**Parameters:**
- nodeId (string)
- width (number)
- height (number)

**Example:**
```json
{ "command": "resize_node", "params": { "nodeId": "123:456", "width": 200, "height": 100 } }
```

### flatten_node
Flatten node.

**Parameters:**
- nodeId (string)

**Example:**
```json
{ "command": "flatten_node", "params": { "nodeId": "123:456" } }
```

### boolean
Boolean operation.

**Parameters:**
- operation (string)
- selection (boolean, optional)
- nodeId (string, optional)
- nodeIds (array, optional)

**Example:**
```json
{ "command": "boolean", "params": { "operation": "union", "selection": true } }
```

### group_node
Group nodes.

**Parameters:**
- group (boolean)
- nodeIds (array)

**Example:**
```json
{ "command": "group_node", "params": { "group": true, "nodeIds": ["123:456", "789:101"] } }
```

### convert_rectangle_to_frame
Convert rectangle to frame.

**Parameters:**
- nodeId (string)

**Example:**
```json
{ "command": "convert_rectangle_to_frame", "params": { "nodeId": "123:456" } }
```

### delete_node
Delete node.

**Parameters:**
- nodeId (string)

**Example:**
```json
{ "command": "delete_node", "params": { "nodeId": "123:456" } }
```

### duplicate_node
Duplicate node.

**Parameters:**
- nodeId (string)

**Example:**
```json
{ "command": "duplicate_node", "params": { "nodeId": "123:456" } }
```

### set_node
Set or insert child node.

**Parameters:**
- parentId (string)
- childId (string)
- index (number, optional)

**Example:**
```json
{ "command": "set_node", "params": { "parentId": "123:456", "childId": "789:101", "index": 2 } }
```

### set_node_prop
Set node properties.

**Parameters:**
- nodeIds (array)
- properties (object)

**Example:**
```json
{ "command": "set_node_prop", "params": { "nodeIds": ["123:456", "789:101"], "properties": { "locked": true } } }
```

### set_grid
Set grid.

**Parameters:**
- entries (array)

**Example:**
```json
{ "command": "set_grid", "params": { "entries": [ { "nodeId": "123:456", "properties": { "pattern": "COLUMNS", "count": 12 } } ] } }
```

### get_grid
Get grid.

**Parameters:**
- nodeIds (array)

**Example:**
```json
{ "command": "get_grid", "params": { "nodeIds": ["123:456"] } }
```

### set_guide
Set guide.

**Parameters:**
- guides (array)

**Example:**
```json
{ "command": "set_guide", "params": { "guides": [ { "axis": "X", "offset": 100 } ] } }
```

### get_guide
Get guide.

**Parameters:** none

**Example:**
```json
{ "command": "get_guide", "params": {} }
```

### set_constraint
Set constraint.

**Parameters:**
- constraints (array)

**Example:**
```json
{ "command": "set_constraint", "params": { "constraints": [ { "nodeId": "123:456", "horizontal": "left", "vertical": "top" } ] } }
```

### get_constraint
Get constraint.

**Parameters:**
- nodeIds (array)

**Example:**
```json
{ "command": "get_constraint", "params": { "nodeIds": ["123:456"] } }
```

### set_variable
Set variable.

**Parameters:**
- variables (array)

**Example:**
```json
{ "command": "set_variable", "params": { "variables": [ { "name": "Primary Color", "type": "COLOR", "value": "#3366FF" } ] } }
```

### get_variable
Get variable.

**Parameters:**
- type (string, optional)
- collection (string, optional)
- mode (string, optional)
- ids (array, optional)

**Example:**
```json
{ "command": "get_variable", "params": { "type": "COLOR", "collection": "Theme" } }
```

### apply_variable_to_node
Apply variable to node.

**Parameters:**
- nodeId (string)
- variableId (string)
- property (string)

**Example:**
```json
{ "command": "apply_variable_to_node", "params": { "nodeId": "123:456", "variableId": "var123", "property": "fill" } }
```

### switch_variable_mode
Switch variable mode.

**Parameters:**
- collection (string)
- mode (string)

**Example:**
```json
{ "command": "switch_variable_mode", "params": { "collection": "Theme", "mode": "Dark" } }
```

### export_node_as_image
Export node as image.

**Parameters:**
- nodeId (string)
- format (string, optional)
- scale (number, optional)

**Example:**
```json
{ "command": "export_node_as_image", "params": { "nodeId": "123:456", "format": "PNG", "scale": 2 } }
```

### get_html
Get HTML.

**Parameters:**
- nodeId (string)
- format (string, optional)
- cssMode (string, optional)

**Example:**
```json
{ "command": "get_html", "params": { "nodeId": "123:456", "format": "semantic", "cssMode": "classes" } }
```

### get_css_async
Get CSS asynchronously.

**Parameters:**
- nodeId (string)
- format (string, optional)

**Example:**
```json
{ "command": "get_css_async", "params": { "nodeId": "123:456", "format": "string" } }
```

### rename_layer
Rename layer.

**Parameters:**
- rename (object) or renames (array of objects)

**Example:**
```json
{ "command": "rename_layer", "params": { "rename": { "nodeId": "123:456", "newName": "Header Section" } } }
```

### ai_rename_layer
AI rename layer.

**Parameters:**
- layer_ids (array of string)
- context_prompt (string, optional)

**Example:**
```json
{ "command": "ai_rename_layer", "params": { "layer_ids": ["123:456"], "context_prompt": "Rename for clarity" } }
```

### set_variant
Set variant.

**Parameters:**
- variant (object, optional)
- variants (array, optional)

**Example:**
```json
{ "command": "set_variant", "params": { "variant": { "componentSetId": "123:456", "action": "add", "properties": { "state": "hover" } } } }
```

### get_variant
Get variant.

**Parameters:**
- componentSetId (string, optional)
- componentSetIds (array, optional)

**Example:**
```json
{ "command": "get_variant", "params": { "componentSetId": "123:456" } }
```

### subscribe_event
Subscribe event.

**Parameters:**
- eventType (string)
- filter (object, optional)

**Example:**
```json
{ "command": "subscribe_event", "params": { "eventType": "selection_change" } }
```

### get_annotation
Get annotation.

**Parameters:**
- nodeId (string, optional)
- nodeIds (array, optional)

**Example:**
```json
{ "command": "get_annotation", "params": { "nodeId": "123:456" } }
```

### set_annotation
Set annotation.

**Parameters:**
- entry (object, optional)
- entries (array, optional)

**Example:**
```json
{ "command": "set_annotation", "params": { "entry": { "nodeId": "123:456", "annotation": { "label": "Note" } } } }
