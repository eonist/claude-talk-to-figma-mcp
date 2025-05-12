/**
 * Type definitions for Figma node structures and responses
 */

/**
 * Base Figma node interface with common properties
 */
export interface BaseFigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  locked?: boolean;
  children?: BaseFigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Standard response format from Figma API
 */
export interface FigmaResponse {
  id: string;
  result?: any;
  error?: string;
}

/**
 * Command progress update notification structure
 */
export interface CommandProgressUpdate {
  type: 'command_progress';
  commandId: string;
  commandType: string;
  status: 'started' | 'in_progress' | 'completed' | 'error';
  progress: number;
  totalItems: number;
  processedItems: number;
  currentChunk?: number;
  totalChunks?: number;
  chunkSize?: number;
  message: string;
  payload?: any;
  timestamp: number;
}

/**
 * RGB Color structure
 */
export interface RGBAColor {
  r: number; // 0-1
  g: number; // 0-1
  b: number; // 0-1
  a?: number; // 0-1
}

/**
 * Text style properties
 */
export interface TextStyle {
  fontFamily?: string;
  fontStyle?: string;
  fontWeight?: number;
  fontSize?: number;
  textAlignHorizontal?: string;
  letterSpacing?: number | { value: number; unit: string };
  lineHeight?: number | { value: number; unit: string };
  paragraphSpacing?: number;
  textCase?: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE';
  textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
}

/**
 * Figma document information response
 */
export interface DocumentInfo {
  name: string;
  id: string;
  type: string;
  children?: BaseFigmaNode[];
  currentPage?: {
    id: string;
    name: string;
    childCount: number;
  };
  pages?: {
    id: string;
    name: string;
    childCount: number;
  }[];
}

/**
 * Selection information response
 */
export interface SelectionInfo {
  nodes: BaseFigmaNode[];
  count: number;
}
