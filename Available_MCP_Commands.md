# MCP Commands for Conduit Integration


## Unified Command Pattern

**Most commands support both single and batch operations via a unified API:**
- You can pass either a single object or an array of objects (using a pluralized parameter) for batch operations.
- The same command name is used for both single and batch; the input type determines the behavior.
- For commands that require a specific batch parameter (e.g., `nodeIds`), this is documented per command.

---

# Quick Reference

> **Note:** For batch operations, pass an array to the singular command (e.g., `rectangles` for `create_rectangle`). Plural command names are deprecated.

### Communication

- [join_channel](#join_channel): Join a specific communication channel

### Document and Information
- [get_document_info](#get_document_info): Get detailed information about the current Figma document
- [get_selection](#get_selection): Get information about the current selection in Figma
- [get_node_info](#get_node_info): Get detailed information about one or more nodes (single or batch)
- [get_annotation](#get_annotation): Get annotation(s) for one or more nodes
- [get_styles](#get_styles): Get all styles from the document
- [get_components](#get_components): Get components from the current document, a team library, or remote team libraries (unified)
- [get_local_components](#get_local_components) **[DEPRECATED]**
- [get_team_components](#get_team_components) **[DEPRECATED]**
- [get_remote_components](#get_remote_components) **[DEPRECATED]**
- [get_styled_text_segments](#get_styled_text_segments): Get text segments with specific styling
- [scan_text_nodes](#scan_text_nodes): Scan all text nodes in the selected node
- [get_css_async](#get_css_async): Get CSS properties from a node
- [get_pages](#get_pages): Get all pages in the current Figma document
- [set_current_page](#set_current_page): Set the current active page in Figma

### Creation

**Shapes:**
- [create_rectangle](#create_rectangle): Create one or more rectangles
- [create_frame](#create_frame): Create one or more frames
- [create_line](#create_line): Create one or more lines
- [create_ellipse](#create_ellipse): Create one or more ellipses
- [create_polygon](#create_polygon): Create one or more polygons
- [create_star](#create_star): Create one or more star shapes
- [create_vector](#create_vector): Create one or more vectors

**Text:**
- [create_text](#create_text): Create one or more text elements
- [create_bounded_text](#create_bounded_text): Create one or more bounded text boxes
- [set_text_content](#set_text_content): Set text content of an existing node
- [set_multiple_text_contents](#set_multiple_text_contents): Set multiple text contents

**Components:**
- [create_components_from_nodes](#create_components_from_nodes): Convert nodes to components
- [create_component_instance](#create_component_instance): Create component instances
- [create_button](#create_button): Create a complete button

**Images and SVG:**
- [insert_image](#insert_image): Insert images from URLs, local files, or base64 data (single or batch)
- [insert_svg_vector](#insert_svg_vector): Insert SVG vectors

**Pages:**
- [create_page](#create_page): Create a new page
- [duplicate_page](#duplicate_page): Duplicate a Figma page and all its children as a new page

### Styling and Modification

- [set_annotation](#set_annotation): Set, update, or delete annotation(s) for one or more nodes

**Selection:**
- [set_selection](#set_selection): Set the current selection in Figma to one or more node IDs

**Basic Styling:**
- [set_fill_color](#set_fill_color): Set fill color
- [set_stroke_color](#set_stroke_color): Set stroke color
- [set_style](#set_style): Set both fill and stroke

**Gradients:**
- [create_gradient_style](#create_gradient_style): Create one or more gradient styles
- [set_gradient](#set_gradient): Set gradient(s) directly or by style variable

**Effects:**
- [create_effect_style_variable](#create_effect_style_variable): Create one or more effect style variables
- [set_effect](#set_effect): Set effect(s) directly or by style variable

**Text Styling:**
- [set_font_name](#set_font_name): Set font name and style
- [set_font_size](#set_font_size): Set font size
- [set_font_weight](#set_font_weight): Set font weight
- [set_letter_spacing](#set_letter_spacing): Set letter spacing
- [set_line_height](#set_line_height): Set line height
- [set_paragraph_spacing](#set_paragraph_spacing): Set paragraph spacing
- [set_text_case](#set_text_case): Set text case
- [set_text_decoration](#set_text_decoration): Set text decoration
- [set_bulk_font](#set_bulk_font): Set font for multiple nodes in bulk
- [load_font_async](#load_font_async): Load a font asynchronously

**Effects and Layout:**
- [set_effects](#set_effects): Set visual effects
- [set_effect_style_id](#set_effect_style_id): Apply an effect style
- [set_auto_layout](#set_auto_layout): Configure auto layout
- [set_auto_layout_resizing](#set_auto_layout_resizing): Set hug or fill sizing mode
- [set_corner_radius](#set_corner_radius): Set corner radius

### Transformations and Management

**Positioning and Sizing:**
- [move_nodes](#move_nodes): Move one or more nodes (single or batch)
- [reorder_node](#reorder_node): Reorder a node in its parent's children array
- [reorder_nodes](#reorder_nodes): Batch reorder multiple nodes
- [resize_node](#resize_node): Resize a node (single or batch)
- [flatten_node](#flatten_node): Flatten a single node (or batch)
- [flatten_selection](#flatten_selection): Flatten a selection of nodes

**Boolean Operations:**
- [boolean](#boolean): Perform union, subtract, intersect, or exclude on nodes or selection

**Node Management:**
- [group_or_ungroup_nodes](#group_or_ungroup_nodes): Group or ungroup nodes
- [convert_rectangle_to_frame](#convert_rectangle_to_frame): Convert a rectangle to a frame
- [delete_node](#delete_node): Delete one or more nodes
- [clone_node](#clone_node): Clone a node (single or batch)
- [insert_child](#insert_child): Insert a child node into a parent (single or batch)
- [set_node_locked](#set_node_locked): Lock or unlock nodes
- [set_node_visible](#set_node_visible): Show or hide nodes

**Component/Instance Management:**
- [detach_instance](#detach_instance): Detach a single component instance from its master
- [detach_instances](#detach_instances): Detach one or more component instances

**Naming:**
- [rename_layer](#rename_layer): Rename nodes (single or batch, each with its own name)
- [ai_rename_layers](#ai_rename_layers): AI-powered renaming

### Export and Conversion

- [export_node_as_image](#export_node_as_image): Export a node as an image
- [generate_html](#generate_html): Generate HTML structure from Figma nodes

---

### Grids, Guides, and Constraints

- [set_grid](#set_grid): Create, update, or delete one or more layout grids on nodes
- [get_grid](#get_grid): Get all layout grids for one or more nodes
- [set_guide](#set_guide): Add or delete one or more guides on the current page
- [get_guide](#get_guide): Get all guides on the current page
- [set_constraints](#set_constraints): Set constraints for one or more nodes
- [get_constraints](#get_constraints): Get constraints for one or more nodes

### Variants

- [set_variant](#set_variant): Create, add, rename, delete, organize, or batch create variants/properties in a component set
- [get_variant](#get_variant): Get info about variants/properties for one or more component sets

### Event Subscription

- [subscribe_event](#subscribe_event): Subscribe to a Figma event (e.g., selection_change, document_change)
- [unsubscribe_event](#unsubscribe_event): Unsubscribe from a previously subscribed event

### Other

- [join](#join): Join a specific communication channel (note: previously listed as join_channel)

## set_selection
Set the current selection in Figma to the specified node(s) by ID.

**Parameters:**
- nodeId (string, optional): A single node ID to select.
- nodeIds (array of string, optional): An array of node IDs to select.
- At least one of `nodeId` or `nodeIds` is required.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the selection result as JSON, including which nodes were selected and which were not found.

**Examples:**
_Single:_
```json
{ "command": "set_selection", "params": { "nodeId": "123:456" } }
```
_Batch:_
```json
{ "command": "set_selection", "params": { "nodeIds": ["123:456", "789:101"] } }
```

---

# Command Index

## create_effect_style_variable
Create one or more effect style variables in Figma.

**Parameters:**
- effects (object or array): Effect style definition(s), each with:
  - name (string): Name for the effect style
  - type (string): "DROP_SHADOW", "INNER_SHADOW", "LAYER_BLUR", or "BACKGROUND_BLUR"
  - color (string, optional): Color for shadow effects (hex or rgba)
  - offset (object, optional): { x, y }
  - radius (number, optional)
  - spread (number, optional)
  - visible (boolean, optional)
  - blendMode (string, optional)
  - opacity (number, optional)

**Example:**
```json
{ "command": "create_effect_style_variable", "params": { "effects": { "name": "Soft Shadow", "type": "DROP_SHADOW", "color": "#000", "radius": 8, "opacity": 0.2 } } }
```
_Batch:_
```json
{ "command": "create_effect_style_variable", "params": { "effects": [
  { "name": "Soft Shadow", "type": "DROP_SHADOW", "color": "#000", "radius": 8, "opacity": 0.2 },
  { "name": "Blur", "type": "LAYER_BLUR", "radius": 12 }
] } }
```

---


## set_effect
Set effect(s) directly or by style variable on one or more nodes in Figma.

**Parameters:**
- entries (object or array): Each entry:
  - nodeId (string): Node to update
  - effects (object or array, optional): Effect(s) to set directly (see EffectSchema)
  - effectStyleId (string, optional): Effect style variable to apply

**At least one of `effects` or `effectStyleId` is required per entry.**

**Example:**
_Direct:_
```json
{ "command": "set_effect", "params": { "entries": { "nodeId": "123:456", "effects": { "type": "DROP_SHADOW", "color": "#000", "radius": 4 } } } }
```
_Batch:_
```json
{ "command": "set_effect", "params": { "entries": [
  { "nodeId": "123:456", "effects": [{ "type": "DROP_SHADOW", "color": "#000", "radius": 4 }] },
  { "nodeId": "789:101", "effectStyleId": "S:effect123" }
] } }
```

---

## get_document_info
Get detailed information about the current Figma document.

**Parameters:** none

**Example:**
```json
{ "command": "get_document_info", "params": {} }
```

---

## get_selection
Get information about the current selection in Figma.

**Parameters:** none

**Example:**
```json
{ "command": "get_selection", "params": {} }
```

---

## get_node_info
Get detailed information about one or more nodes (single or batch).

**Parameters:**
- nodeId (string, optional): Node ID for a single node.
- nodeIds (array of string, optional): Array of node IDs for batch.
- At least one of `nodeId` or `nodeIds` is required.

**Returns:**
- For single: `{ nodeId, document }`
- For batch: `Array<{ nodeId, document }>` (one object per node)

**Examples:**
_Single:_
```json
{ "command": "get_node_info", "params": { "nodeId": "123:456" } }
```
_Batch:_
```json
{ "command": "get_node_info", "params": { "nodeIds": ["123:456", "123:789"] } }
```

---

## get_annotation
Get annotation(s) for one or more Figma nodes.

**Parameters:**
- nodeId (string, optional): Node ID for single node.
- nodeIds (array of string, optional): Array of node IDs for batch.

**Returns:**
- For single: `{ nodeId, annotations }`
- For batch: `Array<{ nodeId, annotations }>`

**Examples:**
_Single:_
```json
{ "command": "get_annotation", "params": { "nodeId": "123:456" } }
```
_Batch:_
```json
{ "command": "get_annotation", "params": { "nodeIds": ["123:456", "789:101"] } }
```

---

## set_annotation
Set, update, or delete annotation(s) for one or more Figma nodes.

**Parameters:**
- entry (object, optional): `{ nodeId, annotation, delete }` (for single)
- entries (array of objects, optional): Array of `{ nodeId, annotation, delete }` (for batch)
  - annotation (object, optional): `{ label, labelMarkdown }`
  - delete (boolean, optional): If true, deletes annotation(s) for node(s).

**Returns:**
- For single: `{ nodeId, updated/deleted }`
- For batch: `Array<{ nodeId, updated/deleted }>`

**Examples:**
_Single (set/update):_
```json
{ "command": "set_annotation", "params": { "entry": { "nodeId": "123:456", "annotation": { "labelMarkdown": "## Note" } } } }
```
_Single (delete):_
```json
{ "command": "set_annotation", "params": { "entry": { "nodeId": "123:456", "delete": true } } }
```
_Batch:_
```json
{ "command": "set_annotation", "params": { "entries": [
  { "nodeId": "123:456", "annotation": { "label": "A" } },
  { "nodeId": "789:101", "annotation": { "labelMarkdown": "**B**" }, "delete": true }
] } }
```

---

## get_styles
Get all styles from the current Figma document.

**Parameters:** none

**Example:**
```json
{ "command": "get_styles", "params": {} }
```

---

## get_components
Get components from the current document, a team library, or remote team libraries (unified).

**Parameters:**
- source (string, required): "local", "team", or "remote"
- team_id (string, required if source is "team")
- page_size (number, optional, for team/remote)
- after (string/number, optional, for team/remote)

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the components info as JSON.

**Examples:**
_Local components:_
```json
{ "command": "get_components", "params": { "source": "local" } }
```
_Team components:_
```json
{ "command": "get_components", "params": { "source": "team", "team_id": "123456" } }
```
_Remote components:_
```json
{ "command": "get_components", "params": { "source": "remote" } }
```

---

## get_local_components **[DEPRECATED]**
Use `get_components` with `{ "source": "local" }` instead.

## get_team_components **[DEPRECATED]**
Use `get_components` with `{ "source": "team", "team_id": "..." }` instead.

## get_remote_components **[DEPRECATED]**
Use `get_components` with `{ "source": "remote" }` instead.

---

## get_styled_text_segments
Get text segments with specific styling in a text node.

**Parameters:**
- nodeId (string)
- property (string): e.g. "fontWeight", "fontSize", etc.

**Example:**
```json
{ "command": "get_styled_text_segments", "params": { "nodeId": "123:456", "property": "fontWeight" } }
```

---

## scan_text_nodes
Scan all text nodes in the selected Figma node.

**Parameters:**
- nodeId (string)

**Example:**
```json
{ "command": "scan_text_nodes", "params": { "nodeId": "123:456" } }
```

---

## get_css_async
Get CSS properties from a node.

**Parameters:**
- nodeId (string, optional)
- format (string, optional): "object", "string", or "inline"

**Example:**
```json
{ "command": "get_css_async", "params": { "nodeId": "123:456", "format": "inline" } }
```

---

## get_pages
Get all pages in the current Figma document.

**Parameters:** none

**Example:**
```json
{ "command": "get_pages", "params": {} }
```

---

## set_current_page
Set the current active page in Figma.

**Parameters:**
- pageId (string)

**Example:**
```json
{ "command": "set_current_page", "params": { "pageId": "1:1" } }
```

---

## create_frame
Create one or more frames.

**Parameters:**
- x, y, width, height (number)
- name (string, optional)
- parentId (string, optional)
- fillColor, strokeColor (object, optional)
- strokeWeight (number, optional)
- frame (object) or frames (array of objects)

**Examples:**
_Single:_
```json
{ "command": "create_frame", "params": { "x": 100, "y": 100, "width": 375, "height": 812, "name": "Mobile Screen" } }
```
_Batch:_
```json
{ "command": "create_frame", "params": { "frames": [
  { "x": 100, "y": 100, "width": 375, "height": 812, "name": "Screen 1" },
  { "x": 500, "y": 100, "width": 375, "height": 812, "name": "Screen 2" }
] } }
```

---

## create_rectangle
Create one or more rectangles.

**Parameters:**
- x, y, width, height (number)
- name (string, optional)
- parentId (string, optional)
- cornerRadius (number, optional)
- rectangle (object) or rectangles (array of objects)

**Examples:**
_Single:_
```json
{ "command": "create_rectangle", "params": { "x": 100, "y": 100, "width": 200, "height": 100, "cornerRadius": 8, "name": "Button Background" } }
```
_Batch:_
```json
{ "command": "create_rectangle", "params": { "rectangles": [
  { "x": 100, "y": 100, "width": 200, "height": 100, "name": "Rect1" },
  { "x": 300, "y": 100, "width": 200, "height": 100, "name": "Rect2" }
] } }
```

---

## create_ellipse
Create one or more ellipses.

**Parameters:**
- x, y, width, height (number)
- name (string, optional)
- parentId (string, optional)
- fillColor, strokeColor (object, optional)
- strokeWeight (number, optional)
- ellipse (object) or ellipses (array of objects)

**Examples:**
_Single:_
```json
{ "command": "create_ellipse", "params": { "x": 100, "y": 100, "width": 50, "height": 30, "name": "Profile Avatar" } }
```
_Batch:_
```json
{ "command": "create_ellipse", "params": { "ellipses": [
  { "x": 100, "y": 100, "width": 50, "height": 50, "name": "Ellipse1" },
  { "x": 300, "y": 100, "width": 30, "height": 30, "name": "Ellipse2" }
] } }
```

---

## create_polygon
Create one or more polygons.

**Parameters:**
- x, y, width, height, sides (number)
- name (string, optional)
- parentId (string, optional)
- fillColor, strokeColor (object, optional)
- strokeWeight (number, optional)
- polygon (object) or polygons (array of objects)

**Examples:**
_Single:_
```json
{ "command": "create_polygon", "params": { "x": 100, "y": 100, "width": 50, "height": 50, "sides": 6, "name": "Hexagon" } }
```
_Batch:_
```json
{ "command": "create_polygon", "params": { "polygons": [
  { "x": 100, "y": 100, "width": 50, "height": 50, "sides": 6, "name": "Hexagon" },
  { "x": 300, "y": 100, "width": 40, "height": 40, "sides": 3, "name": "Triangle" }
] } }
```

---

## create_line
Create one or more lines.

**Parameters:**
- x1, y1, x2, y2 (number)
- parentId (string, optional)
- strokeColor (object, optional)
- strokeWeight (number, optional)
- line (object) or lines (array of objects)

**Examples:**
_Single:_
```json
{ "command": "create_line", "params": { "x1": 100, "y1": 100, "x2": 300, "y2": 300 } }
```
_Batch:_
```json
{ "command": "create_line", "params": { "lines": [
  { "x1": 100, "y1": 100, "x2": 300, "y2": 100 },
  { "x1": 100, "y1": 200, "x2": 300, "y2": 200 }
] } }
```

---

## create_text
Create one or more text elements in Figma. This unified command supports both single and batch creation.

**Parameters:**
- text (object, optional): Single text configuration
- texts (array of objects, optional): Array of text configurations (batch)
- Each text config supports:
  - x (number): X coordinate
  - y (number): Y coordinate
  - text (string): Text content
  - fontSize (number, optional): Font size
  - fontWeight (number, optional): Font weight
  - fontColor (object, optional): Font color
  - name (string, optional): Node name
  - parentId (string, optional): Parent node ID
  - ...other supported text properties

**At least one of `text` or `texts` is required.**

**Examples:**

_Single:_
```json
{ "command": "create_text", "params": { "text": { "x": 100, "y": 100, "text": "Hello, Figma!", "fontSize": 24, "name": "Heading" } } }
```

_Batch:_
```json
{ "command": "create_text", "params": { "texts": [
  { "x": 100, "y": 100, "text": "Title", "fontSize": 32 },
  { "x": 100, "y": 200, "text": "Subtitle", "fontSize": 18 }
] } }
```
---

---

## create_vector
Create one or more vectors.

**Parameters:**
- x, y, width, height (number)
- vectorPaths (array)
- name, parentId, fillColor, strokeColor, strokeWeight (optional)
- vector (object) or vectors (array of objects)

**Examples:**
_Single:_
```json
{ "command": "create_vector", "params": {
  "x": 100, "y": 100, "width": 50, "height": 50,
  "vectorPaths": [{ "data": "M10 10 H 90 V 90 H 10 Z" }]
} }
```
_Batch:_
```json
{ "command": "create_vector", "params": { "vectors": [
  {
    "x": 100, "y": 100, "width": 50, "height": 50,
    "vectorPaths": [{ "data": "M10 10 H 90 V 90 H 10 Z" }]
  }
] } }
```

---

## create_instances_from_components
Create one or more component instances from components.

**Parameters:**
- entry (object, optional): Single instance config: { componentKey, x, y }
- entries (array, optional): Array of instance configs

**Examples:**
_Single:_
```json
{ "command": "create_instances_from_components", "params": { "entry": { "componentKey": "123:456", "x": 100, "y": 100 } } }
```
_Batch:_
```json
{ "command": "create_instances_from_components", "params": { "entries": [
  { "componentKey": "123:456", "x": 100, "y": 100 },
  { "componentKey": "123:789", "x": 300, "y": 100 }
] } }
```

---

## create_components_from_nodes
Convert one or more existing nodes into components.

**Parameters:**
- entry (object) or entries (array of objects)

**Examples:**
_Single:_
```json
{ "command": "create_components_from_nodes", "params": { "entry": { "nodeId": "123:456" } } }
```
_Batch:_
```json
{ "command": "create_components_from_nodes", "params": { "entries": [
  { "nodeId": "123:456" },
  { "nodeId": "789:101" }
] } }
```

---

## create_button
Create a complete button with background and text.

**Parameters:**
- x, y (number)
- width, height, text, background, textColor, fontSize, fontWeight, cornerRadius, name, parentId (optional)

**Example:**
```json
{ "command": "create_button", "params": { "x": 100, "y": 100, "text": "Click Me" } }
```

---

## insert_image
Insert one or more images from a remote URL, local file path, or base64 data URI.

**Parameters:**
- url (string, optional): Remote image URL
- imagePath (string, optional): Local file path
- imageData (string, optional): Base64 data URI
- x, y, width, height, name, parentId (optional): Position, size, and metadata
- image (object) or images (array of objects): Single or batch

**At least one of `url`, `imagePath`, or `imageData` is required for each image.**

**Examples:**

_Single remote image:_
```json
{ "command": "insert_image", "params": { "image": { "url": "https://example.com/image.jpg", "x": 100, "y": 100 } } }
```

_Single local file:_
```json
{ "command": "insert_image", "params": { "image": { "imagePath": "/path/to/image.png", "x": 100, "y": 100 } } }
```

_Single base64 data:_
```json
{ "command": "insert_image", "params": { "image": { "imageData": "data:image/png;base64,iVBORw0KGgoAAAANS...", "x": 100, "y": 100 } } }
```

_Batch (mixed):_
```json
{ "command": "insert_image", "params": { "images": [
  { "url": "https://example.com/image1.jpg", "x": 100, "y": 100 },
  { "imagePath": "/path/to/image2.png", "x": 300, "y": 100 },
  { "imageData": "data:image/png;base64,iVBORw0KGgoAAAANS...", "x": 500, "y": 100 }
] } }
```

---

## insert_svg_vector
Insert one or more SVG vectors.

**Parameters:**
- svg (string), x, y, name, parentId (optional)
- svg (object) or svgs (array of objects)

**Examples:**
_Single:_
```json
{ "command": "insert_svg_vector", "params": { "svg": "<svg .../>", "x": 100, "y": 100 } }
```
_Batch:_
```json
{ "command": "insert_svg_vector", "params": { "svgs": [
  { "svg": "<svg .../>", "x": 100, "y": 100 },
  { "svg": "<svg .../>", "x": 300, "y": 100 }
] } }
```

---

## create_page
Create a new page in the Figma document.

**Parameters:**
- name (string, optional)

**Example:**
```json
{ "command": "create_page", "params": { "name": "My New Page" } }
```

---

## move_nodes
Move one or more nodes to a new position in Figma.

**Parameters:**
- move (object): { nodeId (string), x (number), y (number) }
- moves (array of objects): Each with { nodeId (string), x (number), y (number) }

**Examples:**
_Single:_
```json
{ "command": "move_nodes", "params": { "move": { "nodeId": "123:456", "x": 100, "y": 200 } } }
```
_Batch:_
```json
{ "command": "move_nodes", "params": { "moves": [
  { "nodeId": "123:456", "x": 100, "y": 200 },
  { "nodeId": "789:101", "x": 300, "y": 400 }
] } }
```

---

## reorder_nodes
Reorder one or more nodes in their parents' children arrays (z-order/layer order).

**Parameters:**

---

## create_star
Create one or more star shapes in Figma.

**Parameters:**
- x, y, width, height (number): Position and size of the star.
- name (string, optional): Name for the star node.
- parentId (string, optional): Parent node ID.
- points (number, optional): Number of points for the star (default: 5).
- star (object) or stars (array of objects): Single or batch.

**Examples:**
_Single:_
```json
{ "command": "create_star", "params": { "x": 100, "y": 100, "width": 50, "height": 50, "points": 5, "name": "Star" } }
```
_Batch:_
```json
{ "command": "create_star", "params": { "stars": [
  { "x": 100, "y": 100, "width": 50, "height": 50, "points": 5, "name": "Star1" },
  { "x": 200, "y": 100, "width": 40, "height": 40, "points": 6, "name": "Star2" }
] } }
```

---

## set_bulk_font
Set the font for multiple nodes in bulk.

**Parameters:**
- fonts (array): Array of font configuration objects, each with:
  - nodeId (string): Node to update.
  - family (string): Font family.
  - style (string, optional): Font style.

**Example:**
```json
{ "command": "set_bulk_font", "params": { "fonts": [
  { "nodeId": "123:456", "family": "Inter", "style": "Bold" },
  { "nodeId": "789:101", "family": "Roboto" }
] } }
```

---

## detach_instance
Detach a single component instance from its master.

**Parameters:**
- instanceId (string): The unique Figma instance ID to detach.

**Example:**
```json
{ "command": "detach_instance", "params": { "instanceId": "123:456" } }
```

---

## convert_rectangle_to_frame
Convert a rectangle node to a frame node.

**Parameters:**
- nodeId (string): The rectangle node ID to convert.

**Example:**
```json
{ "command": "convert_rectangle_to_frame", "params": { "nodeId": "123:456" } }
```

---

## join
Join a specific communication channel.

**Parameters:**
- channel (string): The name of the channel to join.

**Example:**
```json
{ "command": "join", "params": { "channel": "figma" } }
```

---

## reorder_node
Reorder a node in its parent's children array (z-order/layer order).

**Parameters:**
- nodeId (string): Node to reorder.
- direction (string, optional): "up", "down", "top", "bottom".
- index (number, optional): Target index in the parent's children array.

**Example:**
```json
{ "command": "reorder_node", "params": { "nodeId": "123:456", "direction": "up" } }
```

- reorder (object, optional): Single reorder config: { nodeId (string), direction (string, optional), index (number, optional) }
- reorders (array, optional): Array of reorder configs (same shape as above)
- options (object, optional): { skip_errors (boolean, optional) }

**Examples:**
_Single:_
```json
{ "command": "reorder_nodes", "params": {
  "reorder": { "nodeId": "123:456", "direction": "up" }
} }
```
_Batch:_
```json
{ "command": "reorder_nodes", "params": {
  "reorders": [
    { "nodeId": "123:456", "direction": "up" },
    { "nodeId": "789:101", "index": 1 }
  ],
  "options": { "skip_errors": true }
} }
```

---

## resize_node
Resize a node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to resize.
- width (number): The new width.
- height (number): The new height.

**Example:**
```json
{ "command": "resize_node", "params": { "nodeId": "123:456", "width": 200, "height": 100 } }
```

---

## flatten_nodes
Flatten one or more nodes, or the current selection, merging all child vector layers and shapes into a single vector layer.

**Parameters:**
- nodeId (string, optional): The ID of a single node to flatten.
- nodeIds (array of string, optional): Array of node IDs to flatten.
- selection (boolean, optional): If true, flattens all currently selected nodes.

**Examples:**
_Single node:_
```json
{ "command": "flatten_nodes", "params": { "nodeId": "123:456" } }
```
_Batch:_
```json
{ "command": "flatten_nodes", "params": { "nodeIds": ["123:456", "789:101"] } }
```
_Flatten selection:_
```json
{ "command": "flatten_nodes", "params": { "selection": true } }
```

---

## boolean
Perform boolean operations (union, subtract, intersect, exclude) on Figma nodes or the current selection.

**Parameters:**
- operation (string, required): One of "union", "subtract", "intersect", "exclude"
- selection (boolean, optional): If true, use the current selection in Figma (nodeId/nodeIds ignored)
- nodeId (string, optional): Single node ID
- nodeIds (array of string, optional): Multiple node IDs (min 2)

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the result.

**Examples:**
_Union on selection:_
```json
{ "command": "boolean", "params": { "operation": "union", "selection": true } }
```
_Subtract with explicit node IDs:_
```json
{ "command": "boolean", "params": { "operation": "subtract", "nodeIds": ["123:456", "789:101"] } }
```
_Intersect a single node with others:_
```json
{ "command": "boolean", "params": { "operation": "intersect", "nodeId": "123:456", "nodeIds": ["789:101"] } }
```

---

## group_or_ungroup_nodes
Group or ungroup nodes in Figma, depending on the 'group' flag.

**Parameters:**
- group (boolean, required): If true, group nodes; if false, ungroup a group node.
- nodeIds (array of string, min 2, required if grouping): The nodes to group.
- name (string, optional): Name for the group (only if grouping).
- nodeId (string, required if ungrouping): The group node to ungroup.

**Examples:**

_Grouping:_
```json
{ "command": "group_or_ungroup_nodes", "params": { "group": true, "nodeIds": ["123:456", "789:101"], "name": "My Group" } }
```

_Ungrouping:_
```json
{ "command": "group_or_ungroup_nodes", "params": { "group": false, "nodeId": "123:456" } }
```

---


## intersect_selection
Intersect selected shapes in Figma.

**Parameters:**
- nodeIds (array of string): Array of node IDs to intersect.

**Example:**
```json
{ "command": "intersect_selection", "params": { "nodeIds": ["123:456", "789:101"] } }
```

---

## exclude_selection
Exclude overlapping areas of selected shapes in Figma.

**Parameters:**
- nodeIds (array of string): Array of node IDs to exclude.

**Example:**
```json
{ "command": "exclude_selection", "params": { "nodeIds": ["123:456", "789:101"] } }
```

---

## group_nodes
Group nodes in Figma.

**Parameters:**
- nodeIds (array of string): Nodes to group.
- name (string, optional): Name of the group.

**Example:**
```json
{ "command": "group_nodes", "params": { "nodeIds": ["123:456", "789:101"], "name": "My Group" } }
```

---

## delete_nodes
Delete one or more nodes in Figma.

**Parameters:**
- nodeId (string, optional): The node ID to delete.
- nodeIds (array of string, optional): Array of node IDs to delete.

**Examples:**
_Single:_
```json
{ "command": "delete_nodes", "params": { "nodeId": "123:456" } }
```
_Batch:_
```json
{ "command": "delete_nodes", "params": { "nodeIds": ["123:456", "789:101"] } }
```

---

## insert_child
Insert a child node into a parent node at an optional index.

**Parameters:**
- parentId (string): ID of the parent node.
- childId (string): ID of the child node to insert.
- index (number, optional): Insertion index (0-based).

**Example:**
```json
{ "command": "insert_child", "params": { "parentId": "123:456", "childId": "123:789", "index": 2 } }
```

---

## set_node_locked
Lock or unlock one or more nodes.

**Parameters:**
- nodeId (string, optional): Node ID.
- nodeIds (array of string, optional): Array of node IDs.
- locked (boolean): Lock (true) or unlock (false).

**Example:**
```json
{ "command": "set_node_locked", "params": { "nodeIds": ["123:456", "123:789"], "locked": true } }
```

---

## set_node_visible
Show or hide one or more nodes.

**Parameters:**
- nodeId (string, optional): Node ID.
- nodeIds (array of string, optional): Array of node IDs.
- visible (boolean): Show (true) or hide (false).

**Example:**
```json
{ "command": "set_node_visible", "params": { "nodeIds": ["123:456", "123:789"], "visible": false } }
```

---

## detach_instances
Detach one or more component instances from their masters.

**Parameters:**
- instanceId (string, optional): A single instance node ID to detach.
- instanceIds (array of string, optional): Array of instance node IDs to detach.
- options (object, optional): { maintain_position (boolean, optional), skip_errors (boolean, optional) }

**Examples:**
_Single:_
```json
{ "command": "detach_instances", "params": { "instanceId": "123:456" } }
```
_Batch:_
```json
{ "command": "detach_instances", "params": { "instanceIds": ["123:456", "123:789"], "options": { "skip_errors": true } } }
```

---

## rename_layer
Rename one or more nodes in Figma.

**Parameters:**
- rename (object) or renames (array of objects): { nodeId, newName, setAutoRename (optional) }

**Example:**
```json
{ "command": "rename_layer", "params": { "rename": { "nodeId": "123:456", "newName": "Header Section" } } }
```

---

## set_font_name
Set the font family and style of one or more text nodes.

**Parameters:**
- font (object) or fonts (array of objects): { nodeId, family, style }

**Example:**
```json
{ "command": "set_font_name", "params": { "font": { "nodeId": "123:456", "family": "Inter", "style": "Bold" } } }
```

---

## set_font_size
Set the font size of a text node in Figma.

**Parameters:**
- nodeId (string): The unique Figma text node ID to update.
- fontSize (number): The font size to set.

**Example:**
```json
{ "command": "set_font_size", "params": { "nodeId": "123:456", "fontSize": 24 } }
```

---

## set_font_weight
Set the font weight of a text node in Figma.

**Parameters:**
- nodeId (string): The unique Figma text node ID to update.
- weight (number): The font weight to set.

**Example:**
```json
{ "command": "set_font_weight", "params": { "nodeId": "123:456", "weight": 700 } }
```

---

## set_letter_spacing
Set the letter spacing of a text node in Figma.

**Parameters:**
- nodeId (string): The unique Figma text node ID to update.
- letterSpacing (number): The letter spacing value to set.
- unit (string, optional): "PIXELS" or "PERCENT".

**Example:**
```json
{ "command": "set_letter_spacing", "params": { "nodeId": "123:456", "letterSpacing": 2, "unit": "PIXELS" } }
```

---

## set_line_height
Set the line height of a text node in Figma.

**Parameters:**
- nodeId (string): The unique Figma text node ID to update.
- lineHeight (number): The line height value to set.
- unit (string, optional): "PIXELS", "PERCENT", "AUTO".

**Example:**
```json
{ "command": "set_line_height", "params": { "nodeId": "123:456", "lineHeight": 32, "unit": "PIXELS" } }
```

---

## set_paragraph_spacing
Set the paragraph spacing of a text node in Figma.

**Parameters:**
- nodeId (string): The unique Figma text node ID to update.
- paragraphSpacing (number): The paragraph spacing value to set.

**Example:**
```json
{ "command": "set_paragraph_spacing", "params": { "nodeId": "123:456", "paragraphSpacing": 8 } }
```

---

## set_text_case
Set the text case of a text node in Figma.

**Parameters:**
- nodeId (string): The unique Figma text node ID to update.
- textCase (string): "ORIGINAL", "UPPER", "LOWER", or "TITLE".

**Example:**
```json
{ "command": "set_text_case", "params": { "nodeId": "123:456", "textCase": "UPPER" } }
```

---

## set_text_decoration
Set the text decoration of a text node in Figma.

**Parameters:**
- nodeId (string): The unique Figma text node ID to update.
- textDecoration (string): "NONE", "UNDERLINE", or "STRIKETHROUGH".

**Example:**
```json
{ "command": "set_text_decoration", "params": { "nodeId": "123:456", "textDecoration": "UNDERLINE" } }
```

---

## load_font_async
Load a font asynchronously in Figma.

**Parameters:**
- family (string): The font family to set.
- style (string, optional): The font style to set.

**Example:**
```json
{ "command": "load_font_async", "params": { "family": "Inter", "style": "Bold" } }
```

---

## set_effects
Set visual effects of a node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to update.
- effects (array): Array of effect objects to apply.

**Example:**
```json
{ "command": "set_effects", "params": { "nodeId": "123:456", "effects": [] } }
```

---

## set_effect_style_id
Apply an effect style to a node in Figma.

**Parameters:**
- nodeId (string): The node ID to update.
- effectStyleId (string): The effect style ID to apply.

**Example:**
```json
{ "command": "set_effect_style_id", "params": { "nodeId": "123:456", "effectStyleId": "effect123" } }
```

---

## set_auto_layout
Configure auto layout properties for a node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to update.
- layoutMode (string): "HORIZONTAL", "VERTICAL", or "NONE".

**Example:**
```json
{ "command": "set_auto_layout", "params": { "nodeId": "123:456", "layoutMode": "VERTICAL" } }
```

---

## set_auto_layout_resizing
Set hug or fill sizing mode on an auto layout frame or child node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to update.
- axis (string): "horizontal" or "vertical".
- mode (string): "FIXED", "HUG", or "FILL".

**Example:**
```json
{ "command": "set_auto_layout_resizing", "params": { "nodeId": "123:456", "axis": "horizontal", "mode": "HUG" } }
```

---

## set_corner_radius
Set the corner radius of a node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to update.
- radius (number): The new corner radius to set, in pixels.
- corners (array of boolean, optional): [top-left, top-right, bottom-right, bottom-left].

**Example:**
```json
{ "command": "set_corner_radius", "params": { "nodeId": "123:456", "radius": 8 } }
```

---

## create_gradient_style
Create one or more gradient style variables in Figma.

**Parameters:**
- gradients (object or array): Gradient definition(s), each with:
  - name (string)
  - gradientType (string): "LINEAR", "RADIAL", "ANGULAR", or "DIAMOND"
  - stops (array): Array of color stops
  - (other optional gradient properties)

**Example:**
_Single:_
```json
{ "command": "create_gradient_style", "params": { "gradients": { "name": "Primary Linear", "gradientType": "LINEAR", "stops": [ { "position": 0, "color": [1,0,0,1] }, { "position": 1, "color": [0,0,1,1] } ] } } }
```
_Batch:_
```json
{ "command": "create_gradient_style", "params": { "gradients": [
  { "name": "Primary Linear", "gradientType": "LINEAR", "stops": [ { "position": 0, "color": [1,0,0,1] }, { "position": 1, "color": [0,0,1,1] } ] },
  { "name": "Accent Radial", "gradientType": "RADIAL", "stops": [ { "position": 0, "color": [0,1,0,1] }, { "position": 1, "color": [0,0,0,1] } ] }
] } }
```

---

## set_gradient
Set a gradient on one or more nodes in Figma, either directly or by style variable.

**Parameters:**
- entries (object or array): Each entry:
  - nodeId (string): Node to update
  - EITHER:
    - gradientType (string): "LINEAR", "RADIAL", "ANGULAR", or "DIAMOND"
    - stops (array): Array of color stops
  - OR
    - gradientStyleId (string): Style variable to apply
  - applyTo (string, optional): "FILL", "STROKE", or "BOTH"

**At least one of direct args or styleId is required per entry.**

**Examples:**
_Single node, direct:_
```json
{ "command": "set_gradient", "params": { "entries": { "nodeId": "123:456", "gradientType": "LINEAR", "stops": [ { "position": 0, "color": [1,0,0,1] }, { "position": 1, "color": [0,0,1,1] } ], "applyTo": "FILL" } } }
```
_Single node, style variable:_
```json
{ "command": "set_gradient", "params": { "entries": { "nodeId": "123:456", "gradientStyleId": "S:gradient123", "applyTo": "FILL" } } }
```
_Batch (mixed):_
```json
{ "command": "set_gradient", "params": { "entries": [
  { "nodeId": "123:456", "gradientType": "LINEAR", "stops": [ { "position": 0, "color": [1,0,0,1] }, { "position": 1, "color": [0,0,1,1] } ], "applyTo": "FILL" },
  { "nodeId": "789:101", "gradientStyleId": "S:gradient123", "applyTo": "STROKE" }
] } }
```

---

## set_fill_color
Set the fill color of a node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to update.
- r (number): Red channel (0-1).
- g (number): Green channel (0-1).
- b (number): Blue channel (0-1).
- a (number, optional): Alpha channel (0-1).

**Example:**
```json
{ "command": "set_fill_color", "params": { "nodeId": "123:456", "r": 1, "g": 0, "b": 0 } }
```

---

## set_stroke_color
Set the stroke color of a node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to update.
- r (number): Red channel (0-1).
- g (number): Green channel (0-1).
- b (number): Blue channel (0-1).
- a (number, optional): Alpha channel (0-1).
- weight (number, optional): Stroke weight.

**Example:**
```json
{ "command": "set_stroke_color", "params": { "nodeId": "123:456", "r": 0, "g": 0, "b": 0, "weight": 2 } }
```

---

## set_stroke_color
Set the stroke color of a node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to update.
- r (number): Red channel (0-1).
- g (number): Green channel (0-1).
- b (number): Blue channel (0-1).
- a (number, optional): Alpha channel (0-1).
- weight (number, optional): Stroke weight.

**Example:**
```json
{ "command": "set_stroke_color", "params": { "nodeId": "123:456", "r": 0, "g": 0, "b": 0, "weight": 2 } }
```

---

## set_style
Set both fill and stroke properties for one or more Figma nodes.

**Parameters:**
- entries (object or array): { nodeId, fillProps, strokeProps }

**Example:**
```json
{ "command": "set_style", "params": {
  "entries": {
    "nodeId": "123:456",
    "fillProps": { "color": [1, 0, 0, 1] },
    "strokeProps": { "color": [0, 0, 0, 1], "weight": 2 }
  }
} }
```

---


## ai_rename_layers
AI-powered rename of specified layers.

**Parameters:**
- layer_ids (array of string): Array of node IDs to rename.
- context_prompt (string, optional): Context for the AI renaming.

**Example:**
```json
{ "command": "ai_rename_layers", "params": { "layer_ids": ["123:456", "123:789"], "context_prompt": "Rename for navigation" } }
```

---

## set_fill_color
Set the fill color of a node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to update.
- r (number): Red channel (0-1).
- g (number): Green channel (0-1).
- b (number): Blue channel (0-1).
- a (number, optional): Alpha channel (0-1).

**Example:**
```json
{ "command": "set_fill_color", "params": { "nodeId": "123:456", "r": 1, "g": 0, "b": 0 } }
```

---

## rename_layer
Rename one or more nodes in Figma.

**Parameters:**
- rename (object) or renames (array of objects): { nodeId, newName, setAutoRename (optional) }

**Example:**
```json
{ "command": "rename_layer", "params": { "rename": { "nodeId": "123:456", "newName": "Header Section" } } }
```

---

## rename_layer
Rename one or more nodes in Figma.

**Parameters:**
- rename (object) or renames (array of objects): { nodeId, newName, setAutoRename (optional) }

**Example:**
```json
{ "command": "rename_layer", "params": { "rename": { "nodeId": "123:456", "newName": "Header Section" } } }
```

---

## ungroup_nodes
Ungroup a group node in Figma.

**Parameters:**
- nodeId (string): The group node ID to ungroup.

**Example:**
```json
{ "command": "ungroup_nodes", "params": { "nodeId": "123:456" } }
```

---

## ungroup_nodes
Ungroup a group node in Figma.

**Parameters:**
- nodeId (string): The group node ID.

**Example:**
```json
{ "command": "ungroup_nodes", "params": { "nodeId": "123:456" } }
```

---

## delete_node
Delete a node in Figma.

**Parameters:**
- nodeId (string): The node ID to delete.

**Example:**
```json
{ "command": "delete_node", "params": { "nodeId": "123:456" } }
```

---

## clone_node
Clone a node in Figma.

**Parameters:**
- nodeId (string): The node ID to clone.
- position (object, optional): { x, y } for the clone.
- offsetX (number, optional): X offset.
- offsetY (number, optional): Y offset.
- parentId (string, optional): Parent node ID for the clone.

**Example:**
```json
{ "command": "clone_node", "params": { "nodeId": "123:456", "offsetX": 100, "offsetY": 0 } }
```

---

## export_node_as_image
Export a node as an image from Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to export.
- format (string, optional): Image format ("PNG", "JPG", "SVG", "PDF").
- scale (number, optional): Export scale factor.

**Example:**
```json
{ "command": "export_node_as_image", "params": { "nodeId": "123:456", "format": "PNG", "scale": 2 } }
```

---

## generate_html
Generate HTML structure from Figma nodes.

**Parameters:**
- nodeId (string): The unique Figma node ID to generate HTML from.
- format (string, optional): HTML output format ("semantic", "div-based", "webcomponent").
- cssMode (string, optional): CSS handling mode ("inline", "classes", "external").

**Example:**
```json
{ "command": "generate_html", "params": { "nodeId": "123:456", "format": "semantic", "cssMode": "classes" } }
```

---

## insert_child
Insert a child node into a parent node at an optional index.

**Parameters:**
- parentId (string): ID of the parent node.
- childId (string): ID of the child node to insert.
- index (number, optional): Insertion index (0-based).

**Example:**
```json
{ "command": "insert_child", "params": { "parentId": "123:456", "childId": "123:789", "index": 2 } }
```

---

## set_node_locked
Lock or unlock one or more nodes.

**Parameters:**
- nodeId (string, optional): Node ID.
- nodeIds (array of string, optional): Array of node IDs.
- locked (boolean): Lock (true) or unlock (false).

**Example:**
```json
{ "command": "set_node_locked", "params": { "nodeIds": ["123:456", "123:789"], "locked": true } }
```

---

## set_node_visible
Show or hide one or more nodes.

**Parameters:**
- nodeId (string, optional): Node ID.
- nodeIds (array of string, optional): Array of node IDs.
- visible (boolean): Show (true) or hide (false).

**Example:**
```json
{ "command": "set_node_visible", "params": { "nodeIds": ["123:456", "123:789"], "visible": false } }
```

---

## detach_instances
Detach one or more component instances from their masters.

**Parameters:**
- instanceIds (array of string): Array of instance node IDs.

**Example:**
```json
{ "command": "detach_instances", "params": { "instanceIds": ["123:456", "123:789"] } }
```

---


## flatten_selection
Flatten a selection of nodes in Figma.

**Parameters:**
- nodeIds (array of string): Array of node IDs to flatten.

**Example:**
```json
{ "command": "flatten_selection", "params": { "nodeIds": ["123:456", "789:101"] } }
```

---

## union_selection
Union selected shapes in Figma.

**Parameters:**
- nodeIds (array of string): Array of node IDs to union.

**Example:**
```json
{ "command": "union_selection", "params": { "nodeIds": ["123:456", "789:101"] } }
```

---

## subtract_selection
Subtract top shapes from bottom shape in Figma.

**Parameters:**
- nodeIds (array of string): Array of node IDs to subtract.

**Example:**
```json
{ "command": "subtract_selection", "params": { "nodeIds": ["123:456", "789:101"] } }
```

---

## intersect_selection
Intersect selected shapes in Figma.

**Parameters:**
- nodeIds (array of string): Array of node IDs to intersect.

**Example:**
```json
{ "command": "intersect_selection", "params": { "nodeIds": ["123:456", "789:101"] } }
```

---

## exclude_selection
Exclude overlapping areas of selected shapes in Figma.

**Parameters:**
- nodeIds (array of string): Array of node IDs to exclude.

**Example:**
```json
{ "command": "exclude_selection", "params": { "nodeIds": ["123:456", "789:101"] } }
```

---

## group_nodes
Group nodes in Figma.

**Parameters:**
- nodeIds (array of string): Nodes to group.
- name (string, optional): Name of the group.

**Example:**
```json
{ "command": "group_nodes", "params": { "nodeIds": ["123:456", "789:101"], "name": "My Group" } }
```

---

## ungroup_nodes
Ungroup a group node in Figma.

**Parameters:**
- nodeId (string): The group node ID.

**Example:**
```json
{ "command": "ungroup_nodes", "params": { "nodeId": "123:456" } }
```

---

## delete_node
Delete a node in Figma.

**Parameters:**
- nodeId (string): The node ID to delete.

**Example:**
```json
{ "command": "delete_node", "params": { "nodeId": "123:456" } }
```

---

## clone_node
Clone a node in Figma.

**Parameters:**
- nodeId (string): The node ID to clone.
- position (object, optional): { x, y } for the clone.
- offsetX (number, optional): X offset.
- offsetY (number, optional): Y offset.
- parentId (string, optional): Parent node ID for the clone.

**Example:**
```json
{ "command": "clone_node", "params": { "nodeId": "123:456", "offsetX": 100, "offsetY": 0 } }
```

---

## resize_node
Resize a node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to resize.
- width (number): The new width.
- height (number): The new height.

**Example:**
```json
{ "command": "resize_node", "params": { "nodeId": "123:456", "width": 200, "height": 100 } }
```

---

## flatten_node
Flatten a single node in Figma, merging all its child vector layers and shapes into a single vector layer.

**Parameters:**
- nodeId (string): The ID of the node to flatten.

**Example:**
```json
{ "command": "flatten_node", "params": { "nodeId": "123:456" } }
```

---

## flatten_selection
Flatten a selection of nodes in Figma.

**Parameters:**
- nodeIds (array of string): Array of node IDs to flatten.

**Example:**
```json
{ "command": "flatten_selection", "params": { "nodeIds": ["123:456", "789:101"] } }
```

---

## union_selection
Union selected shapes in Figma.

**Parameters:**
- nodeIds (array of string): Array of node IDs to union.

**Example:**
```json
{ "command": "union_selection", "params": { "nodeIds": ["123:456", "789:101"] } }
```

---

## subtract_selection
Subtract top shapes from bottom shape in Figma.

**Parameters:**
- nodeIds (array of string): Array of node IDs to subtract.

**Example:**
```json
{ "command": "subtract_selection", "params": { "nodeIds": ["123:456", "789:101"] } }
```

---

## intersect_selection
Intersect selected shapes in Figma.

**Parameters:**
- nodeIds (array of string): Array of node IDs to intersect.

**Example:**
```json
{ "command": "intersect_selection", "params": { "nodeIds": ["123:456", "789:101"] } }
```

---

## exclude_selection
Exclude overlapping areas of selected shapes in Figma.

**Parameters:**
- nodeIds (array of string): Array of node IDs to exclude.

**Example:**
```json
{ "command": "exclude_selection", "params": { "nodeIds": ["123:456", "789:101"] } }
```

---

## group_nodes
Group nodes in Figma.

**Parameters:**
- nodeIds (array of string): Nodes to group.
- name (string, optional): Name of the group.

**Example:**
```json
{ "command": "group_nodes", "params": { "nodeIds": ["123:456", "789:101"], "name": "My Group" } }
```

---

## ungroup_nodes
Ungroup a group node in Figma.

**Parameters:**
- nodeId (string): The group node ID.

**Example:**
```json
{ "command": "ungroup_nodes", "params": { "nodeId": "123:456" } }
```

---

## delete_node
Delete a node in Figma.

**Parameters:**
- nodeId (string): The node ID to delete.

**Example:**
```json
{ "command": "delete_node", "params": { "nodeId": "123:456" } }
```

---

## clone_node
Clone a node in Figma.

**Parameters:**
- nodeId (string): The node ID to clone.
- position (object, optional): { x, y } for the clone.
- offsetX (number, optional): X offset.
- offsetY (number, optional): Y offset.
- parentId (string, optional): Parent node ID for the clone.

**Example:**
```json
{ "command": "clone_node", "params": { "nodeId": "123:456", "offsetX": 100, "offsetY": 0 } }
```

---


---

## Constraint Commands

### set_constraints
Set constraints (left/right/top/bottom/center/scale/stretch) for one or more Figma nodes.

**Parameters:**
- constraint (object, optional): Single constraint operation
  - nodeId (string): Target node
  - horizontal (string): "left", "right", "center", "scale", "stretch"
  - vertical (string): "top", "bottom", "center", "scale", "stretch"
- constraints (array, optional): Batch of constraint operations (same shape as above)
- applyToChildren (boolean, optional): If true, apply to all children
- maintainAspectRatio (boolean, optional): If true, use "scale" for both axes

**Returns:** Array of result objects for each operation.

**Examples:**

_Set constraints (single):_
```json
{ "command": "set_constraints", "params": {
  "constraint": {
    "nodeId": "123:456",
    "horizontal": "right",
    "vertical": "bottom"
  }
} }
```

_Set constraints (batch):_
```json
{ "command": "set_constraints", "params": {
  "constraints": [
    { "nodeId": "123:456", "horizontal": "left", "vertical": "top" },
    { "nodeId": "789:101", "horizontal": "center", "vertical": "scale" }
  ]
} }
```

_Set constraints for all children:_
```json
{ "command": "set_constraints", "params": {
  "constraint": {
    "nodeId": "123:456",
    "horizontal": "scale",
    "vertical": "scale"
  },
  "applyToChildren": true
} }
```

---

### get_constraints
Get constraints for one or more Figma nodes (optionally including children).

**Parameters:**
- nodeId (string, optional): Single node ID (if omitted, use current selection)
- nodeIds (array, optional): Multiple node IDs
- includeChildren (boolean, optional): If true, include constraints for all children

**Returns:** Array of constraint info for each node, including children if requested.

**Examples:**

_Get constraints for a single node:_
```json
{ "command": "get_constraints", "params": { "nodeId": "123:456" } }
```

_Get constraints for multiple nodes, including children:_
```json
{ "command": "get_constraints", "params": { "nodeIds": ["123:456", "789:101"], "includeChildren": true } }
```

_Get constraints for current selection:_
```json
{ "command": "get_constraints", "params": {} }
```

---

## Guide Commands

### set_guide
Add or delete one or more guides on the current Figma page.

**Parameters:**
- guide (object, optional): Single guide operation
  - axis ("X"|"Y"): Guide direction (vertical/horizontal)
  - offset (number): Position in canvas coordinates
  - delete (boolean, optional): If true, delete the guide at axis/offset
- guides (array, optional): Batch of guide operations (same shape as above)

**Returns:** Array of result objects for each operation.

**Examples:**

_Add a guide (single):_
```json
{ "command": "set_guide", "params": {
  "guide": { "axis": "X", "offset": 100 }
} }
```

_Add guides (batch):_
```json
{ "command": "set_guide", "params": {
  "guides": [
    { "axis": "X", "offset": 100 },
    { "axis": "Y", "offset": 200 }
  ]
} }
```

_Delete a guide (single):_
```json
{ "command": "set_guide", "params": {
  "guide": { "axis": "X", "offset": 100, "delete": true }
} }
```

_Batch create and delete:_
```json
{ "command": "set_guide", "params": {
  "guides": [
    { "axis": "X", "offset": 100 },
    { "axis": "Y", "offset": 200, "delete": true }
  ]
} }
```

---

### get_guide
Get all guides on the current Figma page.

**Parameters:** none

**Returns:** Array of guides, each with `{ axis, offset }`.

**Example:**
```json
{ "command": "get_guide", "params": {} }
```

---

## Grid Commands

### set_grid
Create, update, or delete one or more layout grids on Figma nodes (FRAME, COMPONENT, INSTANCE).

**Parameters:**
- entry (object, optional): Single grid operation
  - nodeId (string): Node to modify
  - gridIndex (number, optional): Index of grid to update/delete (omit for create)
  - properties (object, optional): Grid properties (for create/update)
  - delete (boolean, optional): If true, delete the grid at gridIndex
- entries (array, optional): Batch of grid operations (same shape as above)

**Returns:** Array of result objects for each operation.

**Examples:**

_Create a grid:_
```json
{ "command": "set_grid", "params": {
  "entry": {
    "nodeId": "123:456",
    "properties": { "pattern": "COLUMNS", "count": 12, "gutterSize": 16 }
  }
} }
```

_Update a grid:_
```json
{ "command": "set_grid", "params": {
  "entry": {
    "nodeId": "123:456",
    "gridIndex": 0,
    "properties": { "visible": false }
  }
} }
```

_Delete a grid:_
```json
{ "command": "set_grid", "params": {
  "entry": {
    "nodeId": "123:456",
    "gridIndex": 0,
    "delete": true
  }
} }
```

_Batch create:_
```json
{ "command": "set_grid", "params": {
  "entries": [
    { "nodeId": "123:456", "properties": { "pattern": "GRID", "sectionSize": 8 } },
    { "nodeId": "789:101", "properties": { "pattern": "COLUMNS", "count": 6 } }
  ]
} }
```

---

### get_grid
Get all layout grids for one or more Figma nodes (FRAME, COMPONENT, INSTANCE).

**Parameters:**
- nodeId (string, optional): Single node ID
- nodeIds (array of string, optional): Multiple node IDs

**Returns:** For single: `{ nodeId, grids: [...] }`, for batch: `Array<{ nodeId, grids: [...] }>`

**Examples:**

_Single node:_
```json
{ "command": "get_grid", "params": { "nodeId": "123:456" } }
```

_Batch:_
```json
{ "command": "get_grid", "params": { "nodeIds": ["123:456", "789:101"] } }
```

---


---

## Component Variant Commands

### set_variant
Create, add, rename, delete, organize, or batch create variants/properties in a component set (single or batch).

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

**Returns:** Array of result objects for each operation.

**Examples:**

_Add a new variant:_
```json
{ "command": "set_variant", "params": {
  "variant": {
    "componentSetId": "123:456",
    "action": "add",
    "properties": { "state": "hover", "size": "large" }
  }
} }
```

_Batch create variants from a template:_
```json
{ "command": "set_variant", "params": {
  "variant": {
    "componentSetId": "123:456",
    "action": "batch_create",
    "templateComponentId": "789:101",
    "propertiesList": [
      { "state": "active", "size": "small" },
      { "state": "disabled", "size": "large" }
    ]
  }
} }
```

_Organize variants in a grid:_
```json
{ "command": "set_variant", "params": {
  "variant": {
    "componentSetId": "123:456",
    "action": "organize",
    "organizeBy": ["state", "size"]
  }
} }
```

_Rename a property:_
```json
{ "command": "set_variant", "params": {
  "variant": {
    "componentSetId": "123:456",
    "action": "rename",
    "propertyName": "state",
    "newPropertyName": "status"
  }
} }
```

_Delete a variant:_
```json
{ "command": "set_variant", "params": {
  "variant": {
    "componentSetId": "123:456",
    "action": "delete",
    "variantId": "789:101"
  }
} }
```

_Batch add and delete:_
```json
{ "command": "set_variant", "params": { "variants": [
  { "componentSetId": "123:456", "action": "add", "properties": { "state": "active" } },
  { "componentSetId": "123:456", "action": "delete", "variantId": "789:101" }
] } }
```

---

### get_variant
Get info about variants/properties for one or more component sets.

**Parameters:**
- componentSetId (string, optional): Single component set node
- componentSetIds (array, optional): Multiple component set nodes

**Returns:** For single: `{ componentSetId, variants: [...] }`, for batch: `Array<{ componentSetId, variants: [...] }>`

**Examples:**

_Get all variants for a component set:_
```json
{ "command": "get_variant", "params": { "componentSetId": "123:456" } }
```

_Batch get:_
```json
{ "command": "get_variant", "params": { "componentSetIds": ["123:456", "789:101"] } }
```

---


---

## Event Subscription & Notification

### subscribe_event
Subscribe to a Figma event (e.g., selection_change, document_change).

**Parameters:**
- eventType (string): Event type to subscribe to (e.g., "selection_change", "document_change")
- filter (object, optional): Optional filter for event payloads

**Returns:** `{ subscriptionId }`

**Example:**
```json
{ "command": "subscribe_event", "params": { "eventType": "selection_change" } }
```

---

### unsubscribe_event
Unsubscribe from a previously subscribed event.

**Parameters:**
- subscriptionId (string): The subscription ID to remove

**Returns:** `{ success: true }`

**Example:**
```json
{ "command": "unsubscribe_event", "params": { "subscriptionId": "sub-abc123" } }
```

---

### Event Notification
When an event occurs, the server pushes a message to all matching subscribers:

**Example:**
```json
{
  "event": "selection_change",
  "payload": {
    "selectedNodeIds": ["123:456", "789:101"],
    "timestamp": 1716000000000
  },
  "subscriptionId": "sub-abc123"
}
```

---

This document lists all available Model Context Protocol (MCP) commands for the Conduit integration, enabling AI-assisted design in Figma via natural language instructions.

---

## get_style
Get all styles from the current Figma document.

**Parameters:** none

**Example:**
```json
{ "command": "get_style", "params": {} }
```

---

## set_style
Create, update, or delete one or more Figma styles (PAINT, EFFECT, TEXT, GRID) in a unified call.

**Parameters:**
- entry (object, optional): Single style operation
  - styleId (string, optional): Required for update/delete, omitted for create
  - styleType (string, required): "PAINT", "EFFECT", "TEXT", or "GRID"
  - properties (object, optional): Properties to set (required for create/update, omitted for delete)
  - delete (boolean, optional): If true, deletes the style (ignores properties)
- entries (array of objects, optional): Batch style operations (same shape as above)

**Operation Semantics:**
- Create: `styleId` omitted, `delete` false/omitted, `properties` present → create new style.
- Update: `styleId` present, `delete` false/omitted, `properties` present → update existing style.
- Delete: `styleId` present, `delete: true`, `properties` ignored/omitted → delete style.

**Returns:**
- Array of result objects: `{ styleId, styleType, action: "created" | "updated" | "deleted", success: true, [error?: string] }`

**Examples:**

_Single Create:_
```json
{ "command": "set_style", "params": {
  "entry": {
    "styleType": "PAINT",
    "properties": {
      "name": "Accent",
      "paints": [{ "type": "SOLID", "color": { "r": 1, "g": 0, "b": 0, "a": 1 } }]
    }
  }
} }
```

_Single Update:_
```json
{ "command": "set_style", "params": {
  "entry": {
    "styleId": "S:1234",
    "styleType": "PAINT",
    "properties": {
      "name": "Accent Updated",
      "paints": [{ "type": "SOLID", "color": { "r": 0, "g": 1, "b": 0, "a": 1 } }]
    }
  }
} }
```

_Single Delete:_
```json
{ "command": "set_style", "params": {
  "entry": {
    "styleId": "S:1234",
    "styleType": "PAINT",
    "delete": true
  }
} }
```

_Batch Mixed:_
```json
{ "command": "set_style", "params": {
  "entries": [
    {
      "styleType": "PAINT",
      "properties": { "name": "New Style", "paints": [{ "type": "SOLID", "color": { "r": 0.5, "g": 0.5, "b": 0.5, "a": 1 } }] }
    },
    {
      "styleId": "S:5678",
      "styleType": "EFFECT",
      "properties": { "name": "Shadow", "effects": [{ "type": "DROP_SHADOW", "color": { "r": 0, "g": 0, "b": 0, "a": 0.5 }, "radius": 8 }] }
    },
    {
      "styleId": "S:9999",
      "styleType": "TEXT",
      "delete": true
    }
  ]
} }
```

---
