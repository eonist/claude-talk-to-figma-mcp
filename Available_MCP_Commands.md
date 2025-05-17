# MCP Commands for Conduit Integration

This document lists all available Model Context Protocol (MCP) commands for the Conduit integration, enabling AI-assisted design in Figma via natural language instructions.

---

## Unified Command Pattern

**Most commands now support both single and batch operations via a unified API:**
- You can pass either a single object or an array of objects (using a pluralized parameter) for batch operations.
- The same command name is used for both single and batch; the input type determines the behavior.
- For commands that require a specific batch parameter (e.g., `nodeIds`), this is documented per command.

---

# Command Index

## Read Commands
- [get_document_info](#get_document_info): Get detailed information about the current Figma document
- [get_selection](#get_selection): Get information about the current selection in Figma
- [get_node_info](#get_node_info): Get detailed information about a specific node
- [get_nodes_info](#get_nodes_info): Get detailed information about multiple nodes
- [get_styles](#get_styles): Get all styles from the current Figma document
- [get_local_components](#get_local_components): Get all local components from the Figma document
- [get_team_components](#get_team_components): Get components from a Figma team library
- [get_remote_components](#get_remote_components): Get available components from team libraries
- [get_styled_text_segments](#get_styled_text_segments): Get text segments with specific styling in a text node
- [scan_text_nodes](#scan_text_nodes): Scan all text nodes in the selected Figma node
- [get_css_async](#get_css_async): Get CSS properties from a node
- [get_pages](#get_pages): Get all pages in the current Figma document
- [set_current_page](#set_current_page): Set the current active page in Figma

## Create Commands
- [create_frame](#create_frame): Create one or more frames
- [create_rectangle](#create_rectangle): Create one or more rectangles
- [create_ellipse](#create_ellipse): Create one or more ellipses
- [create_polygon](#create_polygon): Create one or more polygons
- [create_line](#create_line): Create one or more lines
- [create_text](#create_text): Create one or more text elements
- [create_bounded_text](#create_bounded_text): Create one or more bounded text boxes
- [create_vector](#create_vector): Create one or more vectors
- [create_component_instance](#create_component_instance): Create one or more component instances
- [create_components_from_nodes](#create_components_from_nodes): Convert one or more existing nodes into components
- [create_button](#create_button): Create a complete button with background and text
- [insert_image](#insert_image): Insert one or more images from URLs
- [insert_local_image](#insert_local_image): Insert one or more local images via file path or Base64 data URI
- [insert_svg_vector](#insert_svg_vector): Insert one or more SVG vectors
- [create_page](#create_page): Create a new page in the Figma document

## Modify/Style Commands
- [set_fill_color](#set_fill_color): Set the fill color of a node
- [set_stroke_color](#set_stroke_color): Set the stroke color of a node
- [set_style](#set_style): Set both fill and stroke properties for one or more nodes
- [create_gradient_variable](#create_gradient_variable): Create one or more gradient paint styles
- [apply_gradient_style](#apply_gradient_style): Apply one or more gradient styles to node(s)
- [apply_direct_gradient](#apply_direct_gradient): Apply a gradient directly to a node without using styles
- [set_corner_radius](#set_corner_radius): Set the corner radius of a node
- [set_font_name](#set_font_name): Set the font family and style of one or more text nodes
- [set_font_size](#set_font_size): Set the font size of a text node
- [set_font_weight](#set_font_weight): Set the font weight of a text node
- [set_letter_spacing](#set_letter_spacing): Set the letter spacing of a text node
- [set_line_height](#set_line_height): Set the line height of a text node
- [set_paragraph_spacing](#set_paragraph_spacing): Set the paragraph spacing of a text node
- [set_text_case](#set_text_case): Set the text case of a text node
- [set_text_decoration](#set_text_decoration): Set the text decoration of a text node
- [load_font_async](#load_font_async): Load a font asynchronously in Figma
- [set_effects](#set_effects): Set visual effects of a node
- [set_effect_style_id](#set_effect_style_id): Apply an effect style to a node
- [set_auto_layout](#set_auto_layout): Configure auto layout properties for a node
- [set_auto_layout_resizing](#set_auto_layout_resizing): Set hug or fill sizing mode on an auto layout frame or child node
- [export_node_as_image](#export_node_as_image): Export a node as an image

## Layer/Node Management
- [move_node](#move_node): Move a node to a new position
- [move_nodes](#move_nodes): Move multiple nodes to a new absolute position
- [resize_node](#resize_node): Resize a node
- [resize_nodes](#resize_nodes): Resize multiple nodes
- [flatten_selection](#flatten_selection): Flatten a selection of nodes
- [union_selection](#union_selection): Union selected shapes
- [subtract_selection](#subtract_selection): Subtract top shapes from bottom shape
- [intersect_selection](#intersect_selection): Intersect selected shapes
- [exclude_selection](#exclude_selection): Exclude overlapping areas of selected shapes
- [group_nodes](#group_nodes): Group nodes in Figma
- [ungroup_nodes](#ungroup_nodes): Ungroup a group node
- [delete_node](#delete_node): Delete a node
- [delete_nodes](#delete_nodes): Delete multiple nodes
- [insert_child](#insert_child): Insert a child node into a parent node at an optional index
- [insert_children](#insert_children): Batch-insert multiple child nodes into parent nodes
- [set_node_locked](#set_node_locked): Lock or unlock one or more nodes
- [set_node_visible](#set_node_visible): Show or hide one or more nodes

## Rename/AI Commands
- [rename_layer](#rename_layer): Rename one or more nodes
- [rename_layers](#rename_layers): Rename specified layers by exact name or pattern replace
- [rename_multiple](#rename_multiple): Rename multiple layers with distinct new names
- [ai_rename_layers](#ai_rename_layers): AI-powered rename of specified layers
- [detach_instances](#detach_instances): Detach one or more component instances from their masters

## Channel/Interop/HTML
- [join_channel](#join_channel): Join a specific channel to communicate with Figma
- [generate_html](#generate_html): Generate HTML structure from Figma nodes

---

# Command Details

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

<!-- The rest of the Modify/Style, Layer/Node Management, Rename/AI, and Channel/Interop/HTML commands would follow the same pattern as above, with each command having: -->
<!-- - Description -->
<!-- - Parameters (with unified single/batch explanation if relevant) -->
<!-- - Single and batch examples (if relevant) -->

---

## Deprecated/Removed Commands

- `create_rectangles`, `create_ellipses`, `create_polygons`, `create_lines`, `create_vectors`, `create_component_instances`, `insert_images`, `insert_local_images`, `insert_svg_vectors`, `apply_gradient_styles`, etc.:  
  _No longer needed—use the unified single/batch command pattern above._

- `create_polygon` (singular): Not implemented, use `create_polygon` with array input.

- `flatten_node`, `clone_nodes`: Not implemented in the current codebase.

---

## Notes

- Parameter names and types are case-sensitive and must match the above exactly.
- For batch operations, provide arrays as specified.
- For the most up-to-date list, refer to the codebase or use the `get_available_tools` command if available.
- See individual command sections for single vs. batch parameter usage.
