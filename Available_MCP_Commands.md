# MCP Commands for Conduit Integration

This documentation outlines all available Model Context Protocol (MCP) commands for the Conduit integration. These commands enable AI-assisted design in Figma through natural language instructions processed by Claude.

---

## Command Categories

### Read Commands
- get_document_info
- get_selection
- get_node_info
- get_nodes_info
- get_styles
- get_local_components
- get_remote_components
- get_styled_text_segments
- scan_text_nodes
- get_css_async

### Create Commands
- create_frame
- create_rectangles
- create_rectangle
- create_ellipses
- create_ellipse
- create_polygons
- create_lines
- create_line
- create_text
- create_bounded_text
- create_vector
- create_vectors
- create_component_from_node
- create_component_instance
- create_component_instances
- create_button
- insert_image
- insert_images
- insert_local_image
- insert_local_images
- insert_svg_vector
- insert_svg_vectors

### Modify/Style Commands
- set_fill_color
- set_stroke_color
- set_style
- set_styles
- create_gradient_variable
- create_gradient_variables
- apply_gradient_style
- apply_gradient_styles
- apply_direct_gradient
- set_corner_radius
- set_font_name
- set_font_size
- set_font_weight
- set_letter_spacing
- set_line_height
- set_paragraph_spacing
- set_text_case
- set_text_decoration
- load_font_async
- set_effects
- set_effect_style_id
- set_auto_layout
- set_auto_layout_resizing
- export_node_as_image

### Layer/Node Management
- move_node
- move_nodes
- resize_node
- resize_nodes
- flatten_selection
- union_selection
- subtract_selection
- intersect_selection
- exclude_selection
- group_nodes
- ungroup_nodes
- delete_node

### Rename/AI Commands
- rename_layer
- rename_layers
- rename_multiple
- ai_rename_layers

### Channel/Interop/HTML
- join_channel
- generate_html

---

## Command Details

### get_document_info
Get detailed information about the current Figma document.

**Parameters:** None

**Example:**
```json
{
  "command": "get_document_info",
  "params": {}
}
```

---

### get_selection
Get information about the current selection in Figma.

**Parameters:** None

**Example:**
```json
{
  "command": "get_selection",
  "params": {}
}
```

---

### get_node_info
Get detailed information about a specific node in Figma.

**Parameters:**
- nodeId (string): The ID of the node

**Example:**
```json
{
  "command": "get_node_info",
  "params": { "nodeId": "123:456" }
}
```

---

### get_nodes_info
Get detailed information about multiple nodes in Figma.

**Parameters:**
- nodeIds (array of string): Array of node IDs

**Example:**
```json
{
  "command": "get_nodes_info",
  "params": { "nodeIds": ["123:456", "123:789"] }
}
```

---

### get_styles
Get all styles from the current Figma document.

**Parameters:** None

**Example:**
```json
{
  "command": "get_styles",
  "params": {}
}
```

---

### get_local_components
Get all local components from the Figma document.

**Parameters:** None

**Example:**
```json
{
  "command": "get_local_components",
  "params": {}
}
```

---

### get_remote_components
Get available components from team libraries in Figma.

**Parameters:** None

**Example:**
```json
{
  "command": "get_remote_components",
  "params": {}
}
```

---

### get_styled_text_segments
Get text segments with specific styling in a text node.

**Parameters:**
- nodeId (string): The ID of the text node
- property (string): One of "fillStyleId", "fontName", "fontSize", "textCase", "textDecoration", "textStyleId", "fills", "letterSpacing", "lineHeight", "fontWeight"

**Example:**
```json
{
  "command": "get_styled_text_segments",
  "params": { "nodeId": "123:456", "property": "fontWeight" }
}
```

---

### scan_text_nodes
Scan all text nodes in the selected Figma node.

**Parameters:**
- nodeId (string): ID of the node to scan

**Example:**
```json
{
  "command": "scan_text_nodes",
  "params": { "nodeId": "123:456" }
}
```

---

### get_css_async
Get CSS properties from a node.

**Parameters:**
- nodeId (string, optional): Node ID
- format (string, optional): "object", "string", or "inline"

**Example:**
```json
{
  "command": "get_css_async",
  "params": { "nodeId": "123:456", "format": "inline" }
}
```

---

### create_frame
Create a new frame in Figma.

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
{
  "command": "create_frame",
  "params": { "x": 100, "y": 100, "width": 375, "height": 812, "name": "Mobile Screen" }
}
```

---

### create_rectangles
Create multiple rectangles in Figma.

**Parameters:**
- rectangles (array): Array of rectangle configs

**Example:**
```json
{
  "command": "create_rectangles",
  "params": {
    "rectangles": [
      { "x": 100, "y": 100, "width": 200, "height": 100, "name": "Rect1" },
      { "x": 300, "y": 100, "width": 200, "height": 100, "name": "Rect2" }
    ]
  }
}
```

---

### create_rectangle
Create a new rectangle in Figma.

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
{
  "command": "create_rectangle",
  "params": { "x": 100, "y": 100, "width": 200, "height": 100, "cornerRadius": 8, "name": "Button Background" }
}
```

---

### create_ellipses
Create multiple ellipses in Figma.

**Parameters:**
- ellipses (array): Array of ellipse configs

**Example:**
```json
{
  "command": "create_ellipses",
  "params": {
    "ellipses": [
      { "x": 100, "y": 100, "width": 50, "height": 50, "name": "Ellipse1" },
      { "x": 300, "y": 100, "width": 30, "height": 30, "name": "Ellipse2" }
    ]
  }
}
```

---

### create_ellipse
Create a new ellipse in Figma.

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
{
  "command": "create_ellipse",
  "params": { "x": 100, "y": 100, "width": 50, "height": 30, "name": "Profile Avatar" }
}
```

---

### create_polygons
Create multiple polygons in Figma.

**Parameters:**
- polygons (array): Array of polygon configs

**Example:**
```json
{
  "command": "create_polygons",
  "params": {
    "polygons": [
      { "x": 100, "y": 100, "width": 50, "height": 50, "sides": 6, "name": "Hexagon" },
      { "x": 300, "y": 100, "width": 40, "height": 40, "sides": 3, "name": "Triangle" }
    ]
  }
}
```

---

### create_lines
Create multiple lines in Figma.

**Parameters:**
- lines (array): Array of line configs

**Example:**
```json
{
  "command": "create_lines",
  "params": {
    "lines": [
      { "x1": 100, "y1": 100, "x2": 300, "y2": 100 },
      { "x1": 100, "y1": 200, "x2": 300, "y2": 200 }
    ]
  }
}
```

---

### create_line
Create a new line in Figma.

**Parameters:**
- x1 (number)
- y1 (number)
- x2 (number)
- y2 (number)
- parentId (string, optional)
- strokeColor (object, optional)
- strokeWeight (number, optional)

**Example:**
```json
{
  "command": "create_line",
  "params": { "x1": 100, "y1": 100, "x2": 300, "y2": 300 }
}
```

---

### create_text
Create a new text element in Figma.

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
{
  "command": "create_text",
  "params": { "x": 100, "y": 100, "text": "Hello, Figma!", "fontSize": 24, "name": "Heading" }
}
```

---

### create_bounded_text
Create a bounded text box in Figma.

**Parameters:**
- x (number)
- y (number)
- width (number)
- height (number)
- text (string)
- fontSize (number, optional)
- fontWeight (number, optional)
- fontColor (object, optional)
- name (string, optional)
- parentId (string, optional)

**Example:**
```json
{
  "command": "create_bounded_text",
  "params": { "x": 100, "y": 100, "width": 200, "height": 100, "text": "Wrapped text", "fontSize": 16 }
}
```

---

### create_vector
Create a new vector in Figma.

**Parameters:**
- x (number)
- y (number)
- width (number)
- height (number)
- vectorPaths (array): Array of { data: string, windingRule?: string }
- name (string, optional)
- parentId (string, optional)
- fillColor (object, optional)
- strokeColor (object, optional)
- strokeWeight (number, optional)

**Example:**
```json
{
  "command": "create_vector",
  "params": {
    "x": 100, "y": 100, "width": 50, "height": 50,
    "vectorPaths": [{ "data": "M10 10 H 90 V 90 H 10 Z" }]
  }
}
```

---

### create_vectors
Create multiple vectors in Figma.

**Parameters:**
- vectors (array): Array of vector configs

**Example:**
```json
{
  "command": "create_vectors",
  "params": {
    "vectors": [
      {
        "x": 100, "y": 100, "width": 50, "height": 50,
        "vectorPaths": [{ "data": "M10 10 H 90 V 90 H 10 Z" }]
      }
    ]
  }
}
```

---

### create_component_from_node
Convert an existing node into a component.

**Parameters:**
- nodeId (string): Node ID

**Example:**
```json
{
  "command": "create_component_from_node",
  "params": { "nodeId": "123:456" }
}
```

---

### create_component_instance
Create an instance of a component in Figma.

**Parameters:**
- componentKey (string)
- x (number)
- y (number)

**Example:**
```json
{
  "command": "create_component_instance",
  "params": { "componentKey": "123:456", "x": 100, "y": 100 }
}
```

---

### create_component_instances
Create multiple component instances in Figma.

**Parameters:**
- instances (array): Array of { componentKey, x, y }

**Example:**
```json
{
  "command": "create_component_instances",
  "params": {
    "instances": [
      { "componentKey": "123:456", "x": 100, "y": 100 },
      { "componentKey": "123:789", "x": 300, "y": 100 }
    ]
  }
}
```

---

### create_button
Create a complete button with background and text in Figma.

**Parameters:**
- x (number)
- y (number)
- width (number, optional, default 100)
- height (number, optional, default 40)
- text (string, optional, default "Button")
- background (object, optional)
- textColor (object, optional)
- fontSize (number, optional)
- fontWeight (number, optional)
- cornerRadius (number, optional)
- name (string, optional)
- parentId (string, optional)

**Example:**
```json
{
  "command": "create_button",
  "params": { "x": 100, "y": 100, "text": "Click Me" }
}
```

---

### insert_image
Insert an image from a URL.

**Parameters:**
- url (string)
- x (number, optional)
- y (number, optional)
- width (number, optional)
- height (number, optional)
- name (string, optional)
- parentId (string, optional)

**Example:**
```json
{
  "command": "insert_image",
  "params": { "url": "https://example.com/image.jpg", "x": 100, "y": 100 }
}
```

---

### insert_images
Insert multiple images from URLs.

**Parameters:**
- images (array): Array of image configs

**Example:**
```json
{
  "command": "insert_images",
  "params": {
    "images": [
      { "url": "https://example.com/image1.jpg", "x": 100, "y": 100 },
      { "url": "https://example.com/image2.jpg", "x": 300, "y": 100 }
    ]
  }
}
```

---

### insert_local_image
Insert a local image via a file path or a Base64 data URI.

**Parameters:**
- imagePath (string, optional)
- imageData (string, optional)
- x (number, optional)
- y (number, optional)
- width (number, optional)
- height (number, optional)
- name (string, optional)
- parentId (string, optional)

**Example:**
```json
{
  "command": "insert_local_image",
  "params": { "imagePath": "/path/to/image.png", "x": 100, "y": 100 }
}
```

---

### insert_local_images
Insert multiple local images via file paths or Base64 data URIs.

**Parameters:**
- images (array): Array of image configs

**Example:**
```json
{
  "command": "insert_local_images",
  "params": {
    "images": [
      { "imagePath": "/path/to/image1.png", "x": 100, "y": 100 },
      { "imageData": "data:image/png;base64,iVBORw0KGgoAAAANS...", "x": 300, "y": 100 }
    ]
  }
}
```

---

### insert_svg_vector
Insert an SVG as vector in Figma.

**Parameters:**
- svg (string)
- x (number, optional)
- y (number, optional)
- name (string, optional)
- parentId (string, optional)

**Example:**
```json
{
  "command": "insert_svg_vector",
  "params": { "svg": "<svg .../>", "x": 100, "y": 100 }
}
```

---

### insert_svg_vectors
Insert multiple SVG vectors in Figma.

**Parameters:**
- svgs (array): Array of SVG configs

**Example:**
```json
{
  "command": "insert_svg_vectors",
  "params": {
    "svgs": [
      { "svg": "<svg .../>", "x": 100, "y": 100 },
      { "svg": "<svg .../>", "x": 300, "y": 100 }
    ]
  }
}
```

---

### set_fill_color
Set the fill color of a node in Figma.

**Parameters:**
- nodeId (string)
- r (number, 0-1)
- g (number, 0-1)
- b (number, 0-1)
- a (number, 0-1, optional)

**Example:**
```json
{
  "command": "set_fill_color",
  "params": { "nodeId": "123:456", "r": 1, "g": 0, "b": 0 }
}
```

---

### set_stroke_color
Set the stroke color of a node in Figma.

**Parameters:**
- nodeId (string)
- r (number, 0-1)
- g (number, 0-1)
- b (number, 0-1)
- a (number, 0-1, optional)
- weight (number, optional)

**Example:**
```json
{
  "command": "set_stroke_color",
  "params": { "nodeId": "123:456", "r": 0, "g": 0, "b": 0, "weight": 2 }
}
```

---

### set_style
Set both fill and stroke properties for a Figma node.

**Parameters:**
- nodeId (string)
- fillProps (object, optional)
- strokeProps (object, optional)

**Example:**
```json
{
  "command": "set_style",
  "params": {
    "nodeId": "123:456",
    "fillProps": { "color": [1, 0, 0, 1] },
    "strokeProps": { "color": [0, 0, 0, 1], "weight": 2 }
  }
}
```

---

### set_styles
Apply fill and/or stroke styles to multiple nodes.

**Parameters:**
- entries (array): Array of { nodeId, fillProps?, strokeProps? }

**Example:**
```json
{
  "command": "set_styles",
  "params": {
    "entries": [
      { "nodeId": "123:456", "fillProps": { "color": [1, 0, 0, 1] } },
      { "nodeId": "123:789", "strokeProps": { "color": [0, 0, 0, 1], "weight": 2 } }
    ]
  }
}
```

---

### create_gradient_variable
Create a gradient paint style in Figma.

**Parameters:**
- name (string)
- gradientType (string): "LINEAR", "RADIAL", "ANGULAR", "DIAMOND"
- stops (array): Array of { position: number, color: [r, g, b, a] }

**Example:**
```json
{
  "command": "create_gradient_variable",
  "params": {
    "name": "Blue Gradient",
    "gradientType": "LINEAR",
    "stops": [
      { "position": 0, "color": [0.1, 0.1, 0.9, 1] },
      { "position": 1, "color": [0.6, 0.7, 1, 1] }
    ]
  }
}
```

---

### create_gradient_variables
Batch create gradient variables in Figma.

**Parameters:**
- gradients (array): Array of gradient configs

**Example:**
```json
{
  "command": "create_gradient_variables",
  "params": {
    "gradients": [
      {
        "name": "Blue Gradient",
        "gradientType": "LINEAR",
        "stops": [
          { "position": 0, "color": [0.1, 0.1, 0.9, 1] },
          { "position": 1, "color": [0.6, 0.7, 1, 1] }
        ]
      }
    ]
  }
}
```

---

### apply_gradient_style
Apply a gradient style to a node in Figma.

**Parameters:**
- nodeId (string)
- gradientStyleId (string)
- applyTo (string): "FILL", "STROKE", "BOTH"

**Example:**
```json
{
  "command": "apply_gradient_style",
  "params": { "nodeId": "123:456", "gradientStyleId": "style123", "applyTo": "FILL" }
}
```

---

### apply_gradient_styles
Batch apply gradient styles to nodes in Figma.

**Parameters:**
- entries (array): Array of { nodeId, gradientStyleId, applyTo }

**Example:**
```json
{
  "command": "apply_gradient_styles",
  "params": {
    "entries": [
      { "nodeId": "123:456", "gradientStyleId": "style123", "applyTo": "FILL" },
      { "nodeId": "123:789", "gradientStyleId": "style456", "applyTo": "STROKE" }
    ]
  }
}
```

---

### apply_direct_gradient
Apply a gradient directly to a node without using styles.

**Parameters:**
- nodeId (string)
- gradientType (string): "LINEAR", "RADIAL", "ANGULAR", "DIAMOND"
- stops (array): Array of { position: number, color: [r, g, b, a] }
- applyTo (string, optional): "FILL", "STROKE", "BOTH"

**Example:**
```json
{
  "command": "apply_direct_gradient",
  "params": {
    "nodeId": "123:456",
    "gradientType": "LINEAR",
    "stops": [
      { "position": 0, "color": [0.1, 0.1, 0.9, 1] },
      { "position": 1, "color": [0.6, 0.7, 1, 1] }
    ],
    "applyTo": "FILL"
  }
}
```

---

### set_corner_radius
Set the corner radius of a node in Figma.

**Parameters:**
- nodeId (string)
- radius (number)
- corners (array of boolean, optional): [top-left, top-right, bottom-right, bottom-left]

**Example:**
```json
{
  "command": "set_corner_radius",
  "params": { "nodeId": "123:456", "radius": 8 }
}
```

---

### set_font_name
Set the font name and style of a text node in Figma.

**Parameters:**
- nodeId (string)
- family (string)
- style (string, optional)

**Example:**
```json
{
  "command": "set_font_name",
  "params": { "nodeId": "123:456", "family": "Inter", "style": "Bold" }
}
```

---

### set_font_size
Set the font size of a text node in Figma.

**Parameters:**
- nodeId (string)
- fontSize (number)

**Example:**
```json
{
  "command": "set_font_size",
  "params": { "nodeId": "123:456", "fontSize": 24 }
}
```

---

### set_font_weight
Set the font weight of a text node in Figma.

**Parameters:**
- nodeId (string)
- weight (number)

**Example:**
```json
{
  "command": "set_font_weight",
  "params": { "nodeId": "123:456", "weight": 700 }
}
```

---

### set_letter_spacing
Set the letter spacing of a text node in Figma.

**Parameters:**
- nodeId (string)
- letterSpacing (number)
- unit (string, optional): "PIXELS", "PERCENT"

**Example:**
```json
{
  "command": "set_letter_spacing",
  "params": { "nodeId": "123:456", "letterSpacing": 2, "unit": "PIXELS" }
}
```

---

### set_line_height
Set the line height of a text node in Figma.

**Parameters:**
- nodeId (string)
- lineHeight (number)
- unit (string, optional): "PIXELS", "PERCENT", "AUTO"

**Example:**
```json
{
  "command": "set_line_height",
  "params": { "nodeId": "123:456", "lineHeight": 32, "unit": "PIXELS" }
}
```

---

### set_paragraph_spacing
Set the paragraph spacing of a text node in Figma.

**Parameters:**
- nodeId (string)
- paragraphSpacing (number)

**Example:**
```json
{
  "command": "set_paragraph_spacing",
  "params": { "nodeId": "123:456", "paragraphSpacing": 8 }
}
```

---

### set_text_case
Set the text case of a text node in Figma.

**Parameters:**
- nodeId (string)
- textCase (string): "ORIGINAL", "UPPER", "LOWER", "TITLE"

**Example:**
```json
{
  "command": "set_text_case",
  "params": { "nodeId": "123:456", "textCase": "UPPER" }
}
```

---

### set_text_decoration
Set the text decoration of a text node in Figma.

**Parameters:**
- nodeId (string)
- textDecoration (string): "NONE", "UNDERLINE", "STRIKETHROUGH"

**Example:**
```json
{
  "command": "set_text_decoration",
  "params": { "nodeId": "123:456", "textDecoration": "UNDERLINE" }
}
```

---

### load_font_async
Load a font asynchronously in Figma.

**Parameters:**
- family (string)
- style (string, optional)

**Example:**
```json
{
  "command": "load_font_async",
  "params": { "family": "Inter", "style": "Bold" }
}
```

---

### set_effects
Set visual effects of a node in Figma.

**Parameters:**
- nodeId (string)
- effects (array)

**Example:**
```json
{
  "command": "set_effects",
  "params": { "nodeId": "123:456", "effects": [] }
}
```

---

### set_effect_style_id
Apply an effect style to a node in Figma.

**Parameters:**
- nodeId (string)
- effectStyleId (string)

**Example:**
```json
{
  "command": "set_effect_style_id",
  "params": { "nodeId": "123:456", "effectStyleId": "effect123" }
}
```

---

### set_auto_layout
Configure auto layout properties for a node in Figma.

**Parameters:**
- nodeId (string)
- layoutMode (string): "HORIZONTAL", "VERTICAL", "NONE"

**Example:**
```json
{
  "command": "set_auto_layout",
  "params": { "nodeId": "123:456", "layoutMode": "VERTICAL" }
}
```

---

### set_auto_layout_resizing
Set hug or fill sizing mode on an auto layout frame or child node.

**Parameters:**
- nodeId (string)
- axis (string): "horizontal", "vertical"
- mode (string): "FIXED", "HUG", "FILL"

**Example:**
```json
{
  "command": "set_auto_layout_resizing",
  "params": { "nodeId": "123:456", "axis": "horizontal", "mode": "HUG" }
}
```

---

### export_node_as_image
Export a node as an image from Figma.

**Parameters:**
- nodeId (string)
- format (string, optional): "PNG", "JPG", "SVG", "PDF"
- scale (number, optional)

**Example:**
```json
{
  "command": "export_node_as_image",
  "params": { "nodeId": "123:456", "format": "PNG", "scale": 2 }
}
```

---

### move_node
Move a node to a new position in Figma.

**Parameters:**
- nodeId (string)
- x (number)
- y (number)

**Example:**
```json
{
  "command": "move_node",
  "params": { "nodeId": "123:456", "x": 100, "y": 200 }
}
```

---

### move_nodes
Move multiple nodes to a new absolute position in Figma.

**Parameters:**
- nodeIds (array of string)
- x (number)
- y (number)

**Example:**
```json
{
  "command": "move_nodes",
  "params": { "nodeIds": ["123:456", "123:789"], "x": 100, "y": 200 }
}
```

---

### resize_node
Resize a node in Figma.

**Parameters:**
- nodeId (string)
- width (number)
- height (number)

**Example:**
```json
{
  "command": "resize_node",
  "params": { "nodeId": "123:456", "width": 200, "height": 100 }
}
```

---

### resize_nodes
Resize multiple nodes in Figma.

**Parameters:**
- nodeIds (array of string)
- targetSize (object): { width, height }

**Example:**
```json
{
  "command": "resize_nodes",
  "params": { "nodeIds": ["123:456", "123:789"], "targetSize": { "width": 200, "height": 100 } }
}
```

---

### flatten_selection
Flatten a selection of nodes in Figma.

**Parameters:**
- nodeIds (array of string)

**Example:**
```json
{
  "command": "flatten_selection",
  "params": { "nodeIds": ["123:456", "123:789"] }
}
```

---

### union_selection
Union selected shapes.

**Parameters:**
- nodeIds (array of string)

**Example:**
```json
{
  "command": "union_selection",
  "params": { "nodeIds": ["123:456", "123:789"] }
}
```

---

### subtract_selection
Subtract top shapes from bottom shape.

**Parameters:**
- nodeIds (array of string)

**Example:**
```json
{
  "command": "subtract_selection",
  "params": { "nodeIds": ["123:456", "123:789"] }
}
```

---

### intersect_selection
Intersect selected shapes.

**Parameters:**
- nodeIds (array of string)

**Example:**
```json
{
  "command": "intersect_selection",
  "params": { "nodeIds": ["123:456", "123:789"] }
}
```

---

### exclude_selection
Exclude overlapping areas of selected shapes.

**Parameters:**
- nodeIds (array of string)

**Example:**
```json
{
  "command": "exclude_selection",
  "params": { "nodeIds": ["123:456", "123:789"] }
}
```

---

### group_nodes
Group nodes in Figma.

**Parameters:**
- nodeIds (array of string)
- name (string, optional)

**Example:**
```json
{
  "command": "group_nodes",
  "params": { "nodeIds": ["123:456", "123:789"], "name": "Group 1" }
}
```

---

### ungroup_nodes
Ungroup a group node in Figma.

**Parameters:**
- nodeId (string)

**Example:**
```json
{
  "command": "ungroup_nodes",
  "params": { "nodeId": "123:456" }
}
```

---

### delete_node
Delete a node in Figma.

**Parameters:**
- nodeId (string)

**Example:**
```json
{
  "command": "delete_node",
  "params": { "nodeId": "123:456" }
}
```

---

### rename_layer
Rename a single node in Figma.

**Parameters:**
- nodeId (string)
- newName (string)
- setAutoRename (boolean, optional)

**Example:**
```json
{
  "command": "rename_layer",
  "params": { "nodeId": "123:456", "newName": "Header Section" }
}
```

---

### rename_layers
Rename specified layers by exact name or pattern replace.

**Parameters:**
- layer_ids (array of string)
- new_name (string)
- match_pattern (string, optional)
- replace_with (string, optional)

**Example:**
```json
{
  "command": "rename_layers",
  "params": { "layer_ids": ["123:456", "123:789"], "new_name": "Button" }
}
```

---

### rename_multiple
Rename multiple layers with distinct new names.

**Parameters:**
- layer_ids (array of string)
- new_names (array of string)

**Example:**
```json
{
  "command": "rename_multiple",
  "params": { "layer_ids": ["123:456", "123:789"], "new_names": ["Header", "Footer"] }
}
```

---

### ai_rename_layers
AI-powered rename of specified layers.

**Parameters:**
- layer_ids (array of string)
- context_prompt (string, optional)

**Example:**
```json
{
  "command": "ai_rename_layers",
  "params": { "layer_ids": ["123:456", "123:789"], "context_prompt": "Rename for navigation" }
}
```

---

### join_channel
Join a specific channel to communicate with Figma.

**Parameters:**
- channel (string)

**Example:**
```json
{
  "command": "join_channel",
  "params": { "channel": "my-channel" }
}
```

---

### generate_html
Generates HTML structure from Figma nodes.

**Parameters:**
- nodeId (string)
- format (string, optional): "semantic", "div-based", "webcomponent"
- cssMode (string, optional): "inline", "classes", "external"

**Example:**
```json
{
  "command": "generate_html",
  "params": { "nodeId": "123:456", "format": "semantic", "cssMode": "classes" }
}
```

---

## Deprecated/Removed Commands

- `create_polygon` (singular): Not implemented, use `create_polygons`.
- `flatten_node`, `clone_nodes`: Not implemented in the current codebase.

---

## Notes

- Parameter names and types are case-sensitive and must match the above exactly.
- For batch operations, always provide arrays as specified.
- For the most up-to-date list, refer to the codebase or use the `get_available_tools` command if available.
