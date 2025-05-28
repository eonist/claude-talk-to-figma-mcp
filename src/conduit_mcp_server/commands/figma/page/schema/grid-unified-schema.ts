import { z } from "zod";

/**
 * Schema for grid layout properties that define how elements are arranged in a grid system.
 * Supports different grid patterns including standard grids, columns, and rows.
 */
export const GridProperties = z.object({
  /** 
   * The type of grid layout pattern to apply
   * - GRID: Standard 2D grid layout
   * - COLUMNS: Vertical column-based layout
   * - ROWS: Horizontal row-based layout
   */
  pattern: z.enum(["GRID", "COLUMNS", "ROWS"]),

  /** Whether the grid is visible in the interface */
  visible: z.boolean().optional(),

  /** 
   * RGBA color configuration for the grid
   * All color values should be normalized between 0 and 1
   */
  color: z.object({
    /** Red component (0-1) */
    r: z.number().min(0).max(1),
    /** Green component (0-1) */
    g: z.number().min(0).max(1),
    /** Blue component (0-1) */
    b: z.number().min(0).max(1),
    /** Alpha/opacity component (0-1), defaults to 1 if not specified */
    a: z.number().min(0).max(1).optional(),
  }).optional(),

  /** 
   * How grid items are aligned within their cells
   * - MIN: Align to start/top
   * - MAX: Align to end/bottom
   * - STRETCH: Fill entire cell
   * - CENTER: Center within cell
   */
  alignment: z.enum(["MIN", "MAX", "STRETCH", "CENTER"]).optional(),

  /** Spacing between grid items in pixels */
  gutterSize: z.number().optional(),

  /** Number of columns or rows in the grid */
  count: z.number().optional(),

  /** Size of each grid section in pixels */
  sectionSize: z.number().optional(),

  /** Offset from the container edge in pixels */
  offset: z.number().optional(),
});

/**
 * Configuration for setting grid properties on a specific node
 */
export const SetGridEntry = z.object({
  /** Unique identifier of the node to apply grid settings to */
  nodeId: z.string(),

  /** Index position within the grid (0-based) */
  gridIndex: z.number().optional(),

  /** Grid layout properties to apply */
  properties: GridProperties.optional(),

  /** Whether to remove the grid from this node */
  delete: z.boolean().optional(),
});

/**
 * Schema for setting grid configurations
 * Can handle single entry or batch operations
 */
export const SetGridSchema = z.object({
  /** Single grid entry to set */
  entry: SetGridEntry.optional(),

  /** Multiple grid entries for batch operations */
  entries: z.array(SetGridEntry).optional(),
});

/**
 * Schema for retrieving grid configurations
 * Can query single node or multiple nodes
 */
export const GetGridSchema = z.object({
  /** Single node ID to retrieve grid settings for */
  nodeId: z.string().optional(),

  /** Multiple node IDs for batch retrieval */
  nodeIds: z.array(z.string()).optional(),
});
