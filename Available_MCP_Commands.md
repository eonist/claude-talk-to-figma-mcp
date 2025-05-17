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
- [duplicate_page](#duplicate_page): Duplicate a Figma page and all its children as a new page

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
- [set_text_content](#set_text_content): Set the text content of a text node
- [set_multiple_text_contents](#set_multiple_text_contents): Set multiple text contents in parallel for child nodes

## Layer/Node Management
- [move_node](#move_node): Move a node to a new position
- [move_nodes](#move_nodes): Move multiple nodes to a new absolute position
- [resize_node](#resize_node): Resize a node
- [resize_nodes](#resize_nodes): Resize multiple nodes
- [flatten_selection](#flatten_selection): Flatten a selection of nodes
- [flatten_node](#flatten_node): Flatten a single node
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
- [clone_node](#clone_node): Clone a node

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

<!-- ...existing command details... -->

## set_text_content
Set the text content of an existing text node in Figma.

**Parameters:**
- nodeId (string): The unique Figma text node ID to update.
- text (string): The new text content to set for the node.

**Example:**
```json
{ "command": "set_text_content", "params": { "nodeId": "123:456", "text": "Updated text" } }
```

---

## set_multiple_text_contents
Set multiple text contents in parallel for child nodes of a parent node in Figma.

**Parameters:**
- nodeId (string): The unique Figma parent node ID.
- text (array): Array of objects specifying nodeId and text for each child text node to update.

**Example:**
```json
{ "command": "set_multiple_text_contents", "params": {
  "nodeId": "123:456",
  "text": [
    { "nodeId": "123:789", "text": "First child" },
    { "nodeId": "123:790", "text": "Second child" }
  ]
} }
```

---

## duplicate_page
Duplicate a Figma page and all its children as a new page.

**Parameters:**
- pageId (string): The ID of the page to duplicate.
- newPageName (string, optional): Optional name for the new page.

**Example:**
```json
{ "command": "duplicate_page", "params": { "pageId": "1:1", "newPageName": "Copy of Page 1" } }
```

---

## flatten_node
Flatten a single node in Figma, merging all its child vector layers and shapes into a single vector layer.

**Parameters:**
- nodeId (string): ID of the node to flatten.

**Example:**
```json
{ "command": "flatten_node", "params": { "nodeId": "123:456" } }
```

---

## clone_node
Clone a node in Figma.

**Parameters:**
- nodeId (string): ID of the node to clone.
- position (object, optional): { x, y } coordinates for the clone.
- offsetX (number, optional): X offset for the clone.
- offsetY (number, optional): Y offset for the clone.
- parentId (string, optional): ID of the parent node for the clone.

**Example:**
```json
{ "command": "clone_node", "params": { "nodeId": "123:456", "offsetX": 100, "offsetY": 0 } }
```

---

<!-- The rest of the command details remain as previously documented, but any command not present in the codebase (not registered via server.tool) should be removed from both the index and details sections. -->

## Deprecated/Removed Commands

- Any command not listed above is not currently registered in the codebase and has been removed from this documentation.

---

## Notes

- Parameter names and types are case-sensitive and must match the above exactly.
- For batch operations, provide arrays as specified.
- For the most up-to-date list, refer to the codebase or use the `get_available_tools` command if available.
- See individual command sections for single vs. batch parameter usage.
