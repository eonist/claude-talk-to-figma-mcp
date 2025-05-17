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
- [rename_layer](#rename_layer): Rename nodes (single or batch)
- [rename_multiple](#rename_multiple): Rename nodes with distinct names
- [ai_rename_layers](#ai_rename_layers): AI-powered renaming

### Export and Conversion

- [export_node_as_image](#export_node_as_image): Export a node as an image
- [generate_html](#generate_html): Generate HTML structure from Figma nodes

### Communication

- [join_channel](#join_channel): Join a specific communication channel

---

# Command Index

<!-- (The rest of the file remains unchanged, with the main index and detailed sections as before) -->
