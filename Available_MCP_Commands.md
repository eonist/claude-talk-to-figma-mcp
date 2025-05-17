# MCP Commands for Conduit Integration

This document lists all available Model Context Protocol (MCP) commands for the Conduit integration, enabling AI-assisted design in Figma via natural language instructions.

---

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
- [get_node_info](#get_node_info): Get detailed information about a specific node
- [get_nodes_info](#get_nodes_info): Get detailed information about multiple nodes
- [get_styles](#get_styles): Get all styles from the document
- [get_local_components](#get_local_components): Get all local components
- [get_team_components](#get_team_components): Get components from a Figma team library
- [get_remote_components](#get_remote_components): Get available components from team libraries
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
- [insert_image](#insert_image): Insert images from URLs
- [insert_local_image](#insert_local_image): Insert local images
- [insert_svg_vector](#insert_svg_vector): Insert SVG vectors

**Pages:**
- [create_page](#create_page): Create a new page
- [duplicate_page](#duplicate_page): Duplicate a Figma page and all its children as a new page

### Styling and Modification

**Basic Styling:**
- [set_fill_color](#set_fill_color): Set fill color
- [set_stroke_color](#set_stroke_color): Set stroke color
- [set_style](#set_style): Set both fill and stroke

**Gradients:**
- [create_gradient_variable](#create_gradient_variable): Create one or more gradient styles
- [apply_gradient_style](#apply_gradient_style): Apply one or more gradient styles
- [apply_direct_gradient](#apply_direct_gradient): Apply gradient directly

**Text Styling:**
- [set_font_name](#set_font_name): Set font name and style
- [set_font_size](#set_font_size): Set font size
- [set_font_weight](#set_font_weight): Set font weight
- [set_letter_spacing](#set_letter_spacing): Set letter spacing
- [set_line_height](#set_line_height): Set line height
- [set_paragraph_spacing](#set_paragraph_spacing): Set paragraph spacing
- [set_text_case](#set_text_case): Set text case
- [set_text_decoration](#set_text_decoration): Set text decoration
- [load_font_async](#load_font_async): Load a font asynchronously

**Effects and Layout:**
- [set_effects](#set_effects): Set visual effects
- [set_effect_style_id](#set_effect_style_id): Apply an effect style
- [set_auto_layout](#set_auto_layout): Configure auto layout
- [set_auto_layout_resizing](#set_auto_layout_resizing): Set hug or fill sizing mode
- [set_corner_radius](#set_corner_radius): Set corner radius

### Transformations and Management

**Positioning and Sizing:**
- [move_node](#move_node): Move a node (single or batch)
- [resize_node](#resize_node): Resize a node (single or batch)
- [flatten_node](#flatten_node): Flatten a single node (or batch)
- [flatten_selection](#flatten_selection): Flatten a selection of nodes

**Boolean Operations:**
- [union_selection](#union_selection): Union selected shapes
- [subtract_selection](#subtract_selection): Subtract shapes
- [intersect_selection](#intersect_selection): Intersect shapes
- [exclude_selection](#exclude_selection): Exclude overlapping areas

**Node Management:**
- [group_nodes](#group_nodes): Group nodes
- [ungroup_nodes](#ungroup_nodes): Ungroup a node
- [delete_node](#delete_node): Delete one or more nodes
- [clone_node](#clone_node): Clone a node (single or batch)
- [insert_child](#insert_child): Insert a child node into a parent (single or batch)
- [set_node_locked](#set_node_locked): Lock or unlock nodes
- [set_node_visible](#set_node_visible): Show or hide nodes

**Component/Instance Management:**
- [detach_instances](#detach_instances): Detach one or more component instances

**Naming:**
- [rename_layer](#rename_layer): Rename nodes (single or batch, each with its own name)
- [ai_rename_layers](#ai_rename_layers): AI-powered renaming

### Export and Conversion

- [export_node_as_image](#export_node_as_image): Export a node as an image
- [generate_html](#generate_html): Generate HTML structure from Figma nodes

---

# Command Index


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
Get detailed information about a specific node.

**Parameters:**
- nodeId (string): Node ID

**Example:**
```json
{ "command": "get_node_info", "params": { "nodeId": "123:456" } }
```

---

## get_nodes_info
Get detailed information about multiple nodes.

**Parameters:**
- nodeIds (array of string): Array of node IDs

**Example:**
```json
{ "command": "get_nodes_info", "params": { "nodeIds": ["123:456", "123:789"] } }
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

## get_local_components
Get all local components from the Figma document.

**Parameters:** none

**Example:**
```json
{ "command": "get_local_components", "params": {} }
```

---

## get_team_components
Get components from a Figma team library.

**Parameters:**
- team_id (string): Figma team ID
- page_size (number, optional)
- after (number, optional)

**Example:**
```json
{ "command": "get_team_components", "params": { "team_id": "123456" } }
```

---

## get_remote_components
Get available components from team libraries.

**Parameters:** none

**Example:**
```json
{ "command": "get_remote_components", "params": {} }
```

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
Create one or more text elements.

**Parameters:**
- x, y, text (number/string)
- fontSize, fontWeight, fontColor (optional)
- name, parentId (string, optional)
- text (object) or texts (array of objects)

**Examples:**
_Single:_
```json
{ "command": "create_text", "params": { "x": 100, "y": 100, "text": "Hello, Figma!", "fontSize": 24, "name": "Heading" } }
```
_Batch:_
```json
{ "command": "create_text", "params": { "texts": [
  { "x": 100, "y": 100, "text": "Title", "fontSize": 32 },
  { "x": 100, "y": 200, "text": "Subtitle", "fontSize": 18 }
] } }
```

---

## create_bounded_text
Create one or more bounded text boxes.

**Parameters:**
- x, y, width, height, text (number/string)
- fontSize, fontWeight, fontColor (optional)
- name, parentId (string, optional)
- text (object) or texts (array of objects)

**Examples:**
_Single:_
```json
{ "command": "create_bounded_text", "params": { "x": 100, "y": 100, "width": 200, "height": 100, "text": "Wrapped text", "fontSize": 16 } }
```
_Batch:_
```json
{ "command": "create_bounded_text", "params": { "texts": [
  { "x": 100, "y": 100, "width": 200, "height": 100, "text": "Box 1" },
  { "x": 400, "y": 100, "width": 200, "height": 100, "text": "Box 2" }
] } }
```

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

## create_component_instance
Create one or more component instances.

**Parameters:**
- componentKey (string), x, y (number)
- instance (object) or instances (array of objects)

**Examples:**
_Single:_
```json
{ "command": "create_component_instance", "params": { "componentKey": "123:456", "x": 100, "y": 100 } }
```
_Batch:_
```json
{ "command": "create_component_instance", "params": { "instances": [
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
Insert one or more images from URLs.

**Parameters:**
- url (string), x, y, width, height, name, parentId (optional)
- image (object) or images (array of objects)

**Examples:**
_Single:_
```json
{ "command": "insert_image", "params": { "url": "https://example.com/image.jpg", "x": 100, "y": 100 } }
```
_Batch:_
```json
{ "command": "insert_image", "params": { "images": [
  { "url": "https://example.com/image1.jpg", "x": 100, "y": 100 },
  { "url": "https://example.com/image2.jpg", "x": 300, "y": 100 }
] } }
```

---

## insert_local_image
Insert one or more local images via file path or Base64 data URI.

**Parameters:**
- imagePath (string, optional), imageData (string, optional), x, y, width, height, name, parentId (optional)
- image (object) or images (array of objects)

**Examples:**
_Single:_
```json
{ "command": "insert_local_image", "params": { "imagePath": "/path/to/image.png", "x": 100, "y": 100 } }
```
_Batch:_
```json
{ "command": "insert_local_image", "params": { "images": [
  { "imagePath": "/path/to/image1.png", "x": 100, "y": 100 },
  { "imageData": "data:image/png;base64,iVBORw0KGgoAAAANS...", "x": 300, "y": 100 }
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

## move_node
Move one or more nodes to a new position in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to move.
- x (number): New X position.
- y (number): New Y position.

**Example:**
```json
{ "command": "move_node", "params": { "nodeId": "123:456", "x": 100, "y": 200 } }
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
- nodeIds (array of string): Array of node IDs to group.
- name (string, optional): Name for the group.

**Example:**
```json
{ "command": "group_nodes", "params": { "nodeIds": ["123:456", "789:101"], "name": "My Group" } }
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

## delete_node
Delete a node in Figma.

**Parameters:**
- nodeId (string): The node ID to delete.

**Example:**
```json
{ "command": "delete_node", "params": { "nodeId": "123:456" } }
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
