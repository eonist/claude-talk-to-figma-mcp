// Type definitions for the Figma plugin

// Plugin state type
export interface PluginState {
  serverPort: number;
}

// Progress update payload type
export interface ProgressUpdatePayload {
  currentChunk?: number;
  totalChunks?: number;
  chunkSize?: number;
  [key: string]: any;
}

// Progress update type
export interface ProgressUpdate {
  type: 'command_progress';
  commandId: string;
  commandType: string;
  status: 'started' | 'in_progress' | 'completed' | 'error';
  progress: number;
  totalItems: number;
  processedItems: number;
  message: string;
  timestamp: number;
  currentChunk?: number;
  totalChunks?: number;
  chunkSize?: number;
  payload?: any;
}

// Command message types
export interface CommandMessage {
  type: string;
  command?: string;
  params?: any;
  id?: string;
  [key: string]: any;
}

// Command result types
export interface CommandResult {
  type: 'command-result';
  id: string;
  result: any;
}

export interface CommandError {
  type: 'command-error';
  id: string;
  error: string;
}

// Settings types
export interface PluginSettings {
  serverPort: number;
}

// Node Info types
export interface NodeInfo {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
}

// Text node info for scanning
export interface TextNodeInfo {
  id: string;
  name: string;
  type: string;
  characters: string;
  fontSize: number;
  fontFamily: string;
  fontStyle: string;
  x: number;
  y: number;
  width: number;
  height: number;
  path: string;
  depth: number;
}

// Text replacement parameters
export interface TextReplacement {
  nodeId: string;
  text: string;
}

// Multiple text content replacement parameters
export interface MultipleTextContentsParams {
  nodeId: string;
  text: TextReplacement[];
  commandId?: string;
}

// Color type for fills and strokes
export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

// Basic shape creation parameters
export interface ShapeCreationParams {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  parentId?: string;
  fillColor?: RGBAColor;
  strokeColor?: RGBAColor;
  strokeWeight?: number;
}
