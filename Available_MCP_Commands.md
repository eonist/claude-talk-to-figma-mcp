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
