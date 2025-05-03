// Type definitions for Figma Plugin API
// This is a simplified version, Figma has many more types and methods

declare const figma: PluginAPI;

interface PluginAPI {
  readonly apiVersion: string;
  readonly command: string;
  readonly root: DocumentNode;
  readonly currentPage: PageNode;
  readonly hasMissingFont: boolean;
  readonly viewport: ViewportAPI;
  closePlugin(message?: string): void;
  notify(message: string, options?: NotificationOptions): NotificationHandler;
  showUI(html: string, options?: ShowUIOptions): void;
  readonly ui: UIAPI;
  readonly clientStorage: ClientStorageAPI;
  readonly currentUser: User | null;
  readonly teamLibrary: TeamLibraryAPI;
  
  // Nodes
  getNodeById(id: string): BaseNode | null;
  getNodeByIdAsync(id: string): Promise<BaseNode | null>;
  getStyleById(id: string): BaseStyle | null;
  loadFontAsync(fontName: FontName): Promise<void>;
  
  createPage(): PageNode;
  createFrame(): FrameNode;
  createRectangle(): RectangleNode;
  createLine(): LineNode;
  createEllipse(): EllipseNode;
  createPolygon(): PolygonNode;
  createStar(): StarNode;
  createVector(): VectorNode;
  createText(): TextNode;
  createComponent(): ComponentNode;
  createComponentSet(): ComponentSetNode;
  createBooleanOperation(): BooleanOperationNode;
  createSlice(): SliceNode;
  
  // Styles and groups
  group(nodes: ReadonlyArray<BaseNode>, parent: BaseNode & ChildrenMixin, index?: number): GroupNode;
  ungroup(node: SceneNode & ChildrenMixin): Array<SceneNode>;
  
  // Get styles
  getLocalPaintStylesAsync(): Promise<PaintStyle[]>;
  getLocalTextStylesAsync(): Promise<TextStyle[]>;
  getLocalEffectStylesAsync(): Promise<EffectStyle[]>;
  getLocalGridStylesAsync(): Promise<GridStyle[]>;
  
  // Components and libraries
  importComponentByKeyAsync(key: string): Promise<ComponentNode>;
  importComponentSetByKeyAsync(key: string): Promise<ComponentSetNode>;
  
  // Extra
  getDataTableHeadersFromNodeAsync(table: TableNode): Promise<DataTableHeaders>;
  createDataTable(request: CreateDataTableRequest): DataTableNode;
  
  // Loading pages
  loadAllPagesAsync(): Promise<void>;
  on(type: 'run', callback: (event: { command: string }) => boolean | void): void;
  once(type: 'run', callback: (event: { command: string }) => boolean | void): void;
  off(type: 'run', callback: (event: { command: string }) => boolean | void): void;
  
  // AI
  readonly ai: AI;
}

// This is a simplification - in reality each of these interfaces would be more detailed
interface UIAPI {
  show(): void;
  hide(): void;
  resize(width: number, height: number): void;
  close(): void;
  postMessage(pluginMessage: any): void;
  onmessage: ((pluginMessage: any) => void) | undefined;
}

interface ClientStorageAPI {
  getAsync(key: string): Promise<any>;
  setAsync(key: string, value: any): Promise<void>;
}

interface ViewportAPI {
  center: { x: number, y: number };
  zoom: number;
  scrollAndZoomIntoView(nodes: ReadonlyArray<BaseNode>): void;
}

interface TeamLibraryAPI {
  getAvailableComponentsAsync(): Promise<Array<LibraryComponent>>;
  getAvailableComponentSetAsync(): Promise<Array<LibraryComponentSet>>;
}

interface AI {
  getDataFromImageAsync(request: GetDataFromImageRequest): Promise<GetDataFromImageResponse>;
  getImageFromTextAsync(request: GetImageFromTextRequest): Promise<GetImageFromTextResponse>;
  getTextFromImageAsync(request: GetTextFromImageRequest): Promise<GetTextFromImageResponse>;
  getCreateNodeSuggestionsAsync(request: GetCreateNodeSuggestionsRequest): Promise<GetCreateNodeSuggestionsResponse>;
  getShapeTranslationsAsync(request: GetShapeTranslationsRequest): Promise<GetShapeTranslationsResponse>;
  getMockupSuggestionsAsync(request: GetMockupSuggestionsRequest): Promise<GetMockupSuggestionsResponse>;
  getTextToImageRefinementAsync(request: GetTextToImageRefinementRequest): Promise<GetTextToImageRefinementResponse>;
  completeNodeAsync(request: CompleteNodeRequest): Promise<CompleteNodeResponse>;
  renameLayersAsync(nodes: ReadonlyArray<BaseNode>, request?: RenameLayersRequest): Promise<RenameLayersResponse>;
}

// Basic node interfaces
interface BaseNode {
  id: string;
  parent: (BaseNode & ChildrenMixin) | null;
  name: string;
  removed: boolean;
  toString(): string;
  masterComponent: ComponentNode | null;
  getPluginData(key: string): string;
  setPluginData(key: string, value: string): void;
  getSharedPluginData(namespace: string, key: string): string;
  setSharedPluginData(namespace: string, key: string, value: string): void;
  getPluginDataKeys(): string[];
  getSharedPluginDataKeys(namespace: string): string[];
  exportAsync(settings?: ExportSettings): Promise<Uint8Array>;
}

interface SceneNode extends BaseNode {
  visible: boolean;
  locked: boolean;
  readonly childIndex: number;
  readonly absoluteTransform: Transform;
  relativeTransform: Transform;
  x: number;
  y: number;
  readonly width: number;
  readonly height: number;
  readonly parent: BaseNode & ChildrenMixin;
  readonly depth: number;
  attachment: PageNode;
  clone(): SceneNode;
  findAll(callback?: (node: SceneNode) => boolean): SceneNode[];
  findOne(callback: (node: SceneNode) => boolean): SceneNode | null;
  findAllWithCriteria<T extends NodeType[]>(criteria: { types: T }): Array<{ type: T[number] } & SceneNode>;
}

interface ChildrenMixin {
  readonly children: ReadonlyArray<SceneNode>;
  appendChild(child: SceneNode): void;
  insertChild(index: number, child: SceneNode): void;
  findChildren(callback?: (node: SceneNode) => boolean): Array<SceneNode>;
  findChild(callback: (node: SceneNode) => boolean): SceneNode | null;
}

// Basic simple type interfaces - these would be more detailed in actual typings
interface FontName {
  family: string;
  style: string;
}

interface Paint {
  type: PaintType;
  color?: RGB;
  opacity?: number;
  visible?: boolean;
}

interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface TextSegment {
  // Any property of text nodes like fontName, fontSize etc.
  characters: string;
  start: number;
  end: number;
  [property: string]: any;
}

interface User {
  id: string | null;
  name: string | null;
  photoUrl: string | null;
}

// Common Node Types
type NodeType = 'DOCUMENT' | 'PAGE' | 'SLICE' | 'FRAME' | 'GROUP' | 'COMPONENT' | 'COMPONENT_SET' | 'INSTANCE' | 'BOOLEAN_OPERATION' | 'VECTOR' | 'STAR' | 'LINE' | 'ELLIPSE' | 'POLYGON' | 'RECTANGLE' | 'TEXT' | 'TABLE' | 'TABLE_CELL';
type PaintType = 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE' | 'EMOJI';

// Node specific interfaces
interface DocumentNode extends BaseNode {
  type: "DOCUMENT";
  readonly children: ReadonlyArray<PageNode>;
}

interface PageNode extends BaseNode, ChildrenMixin {
  type: "PAGE";
  appendChild(child: SceneNode): void;
  insertChild(index: number, child: SceneNode): void;
  findChildren(callback?: (node: SceneNode) => boolean): Array<SceneNode>;
  findChild(callback: (node: SceneNode) => boolean): SceneNode | null;
  clone(): PageNode;
  // Using the parent type from BaseNode
  children: ReadonlyArray<SceneNode>;
}

interface FrameNode extends SceneNode, ChildrenMixin {
  type: "FRAME";
  clone(): FrameNode;
  layoutMode: "NONE" | "HORIZONTAL" | "VERTICAL";
  primaryAxisSizingMode: "FIXED" | "AUTO";
  counterAxisSizingMode: "FIXED" | "AUTO";
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  itemSpacing: number;
  layoutAlign: "MIN" | "CENTER" | "MAX" | "STRETCH";
  layoutGrow: number;
  resize(width: number, height: number): void;
  fills: ReadonlyArray<Paint>;
  strokes: ReadonlyArray<Paint>;
  strokeWeight: number;
  cornerRadius: number;
  effects: ReadonlyArray<Effect>;
  effectStyleId: string;
}

interface RectangleNode extends SceneNode {
  type: "RECTANGLE";
  clone(): RectangleNode;
  resize(width: number, height: number): void;
  fills: ReadonlyArray<Paint>;
  strokes: ReadonlyArray<Paint>;
  strokeWeight: number;
  cornerRadius: number;
  topLeftRadius: number;
  topRightRadius: number;
  bottomLeftRadius: number;
  bottomRightRadius: number;
}

interface EllipseNode extends SceneNode {
  type: "ELLIPSE";
  clone(): EllipseNode;
  resize(width: number, height: number): void;
  fills: ReadonlyArray<Paint>;
  strokes: ReadonlyArray<Paint>;
  strokeWeight: number;
}

interface PolygonNode extends SceneNode {
  type: "POLYGON";
  clone(): PolygonNode;
  resize(width: number, height: number): void;
  fills: ReadonlyArray<Paint>;
  strokes: ReadonlyArray<Paint>;
  strokeWeight: number;
  pointCount: number;
}

interface StarNode extends SceneNode {
  type: "STAR";
  clone(): StarNode;
  resize(width: number, height: number): void;
  fills: ReadonlyArray<Paint>;
  strokes: ReadonlyArray<Paint>;
  strokeWeight: number;
  pointCount: number;
  innerRadius: number;
}

interface VectorNode extends SceneNode {
  type: "VECTOR";
  clone(): VectorNode;
  resize(width: number, height: number): void;
  fills: ReadonlyArray<Paint>;
  strokes: ReadonlyArray<Paint>;
  strokeWeight: number;
  vectorNetwork: VectorNetwork;
  vectorPaths: VectorPaths;
  handleMirroring: HandleMirroring;
}

interface TextNode extends SceneNode {
  type: "TEXT";
  clone(): TextNode;
  resize(width: number, height: number): void;
  fills: ReadonlyArray<Paint>;
  strokes: ReadonlyArray<Paint>;
  strokeWeight: number;
  characters: string;
  fontSize: number;
  fontName: FontName;
  textCase: "ORIGINAL" | "UPPER" | "LOWER" | "TITLE";
  textDecoration: "NONE" | "UNDERLINE" | "STRIKETHROUGH";
  letterSpacing: { value: number, unit: "PIXELS" | "PERCENT" };
  lineHeight: { value: number, unit: "PIXELS" | "PERCENT" | "AUTO" };
  paragraphSpacing: number;
  paragraphIndent: number;
  autoRename: boolean;
  getRangeFontName(start: number, end: number): FontName;
  getRangeTextCase(start: number, end: number): "ORIGINAL" | "UPPER" | "LOWER" | "TITLE";
  getRangeTextDecoration(start: number, end: number): "NONE" | "UNDERLINE" | "STRIKETHROUGH";
  getRangeLineHeight(start: number, end: number): { value: number, unit: "PIXELS" | "PERCENT" | "AUTO" };
  getRangeLetterSpacing(start: number, end: number): { value: number, unit: "PIXELS" | "PERCENT" };
  getRangeFills(start: number, end: number): Paint[];
  getStyledTextSegments(styleTypes: Array<"fillStyleId" | "fontName" | "fontSize" | "textCase" | "textDecoration" | "textStyleId" | "fills" | "letterSpacing" | "lineHeight">): TextSegment[];
  setRangeFontName(start: number, end: number, fontName: FontName): void;
  setRangeTextCase(start: number, end: number, textCase: "ORIGINAL" | "UPPER" | "LOWER" | "TITLE"): void;
}

interface ComponentNode extends SceneNode, ChildrenMixin {
  type: "COMPONENT";
  clone(): ComponentNode;
  createInstance(): InstanceNode;
  description: string;
  key: string;
}

interface ComponentSetNode extends SceneNode, ChildrenMixin {
  type: "COMPONENT_SET";
  clone(): ComponentSetNode;
  description: string;
  defaultVariant: ComponentNode;
}

interface LineNode extends SceneNode {
  type: "LINE";
  clone(): LineNode;
  resize(width: number, height: number): void;
  strokes: ReadonlyArray<Paint>;
  strokeWeight: number;
  strokeCap: "NONE" | "ROUND" | "SQUARE" | "ARROW_LINES" | "ARROW_EQUILATERAL";
}

interface GroupNode extends SceneNode, ChildrenMixin {
  type: "GROUP";
  clone(): GroupNode;
}

interface SliceNode extends SceneNode {
  type: "SLICE";
  clone(): SliceNode;
}

interface BooleanOperationNode extends SceneNode, ChildrenMixin {
  type: "BOOLEAN_OPERATION";
  clone(): BooleanOperationNode;
  booleanOperation: "UNION" | "INTERSECT" | "SUBTRACT" | "EXCLUDE";
}

interface InstanceNode extends SceneNode, ChildrenMixin {
  type: "INSTANCE";
  clone(): InstanceNode;
  mainComponent: ComponentNode | null;
  swapComponent(componentNode: ComponentNode): void;
  detachInstance(): FrameNode;
  componentId: string;
}

interface TableNode extends SceneNode, ChildrenMixin {
  type: "TABLE";
  clone(): TableNode;
}

// Style interfaces
interface BaseStyle {
  id: string;
  key: string;
  name: string;
  description: string;
  readonly remote: boolean;
}

interface PaintStyle extends BaseStyle {
  type: "PAINT";
  paints: ReadonlyArray<Paint>;
}

interface TextStyle extends BaseStyle {
  type: "TEXT";
  fontSize: number;
  textDecoration: "NONE" | "UNDERLINE" | "STRIKETHROUGH";
  fontName: FontName;
  letterSpacing: { value: number, unit: "PIXELS" | "PERCENT" };
  lineHeight: { value: number, unit: "PIXELS" | "PERCENT" | "AUTO" };
  paragraphIndent: number;
  paragraphSpacing: number;
  textCase: "ORIGINAL" | "UPPER" | "LOWER" | "TITLE";
}

interface EffectStyle extends BaseStyle {
  type: "EFFECT";
  effects: ReadonlyArray<Effect>;
}

interface GridStyle extends BaseStyle {
  type: "GRID";
  layoutGrids: ReadonlyArray<LayoutGrid>;
}

// Misc interfaces
interface Effect {
  type: "DROP_SHADOW" | "INNER_SHADOW" | "LAYER_BLUR" | "BACKGROUND_BLUR";
  visible: boolean;
  radius: number;
  color?: RGB;
  blendMode?: BlendMode;
  offset?: Vector;
  showShadowBehindNode?: boolean;
}

interface LayoutGrid {
  pattern: "COLUMNS" | "ROWS" | "GRID";
  sectionSize: number;
  visible: boolean;
  color: RGBA;
  alignment: "MIN" | "MAX" | "CENTER" | "STRETCH";
  gutterSize: number;
  offset: number;
  count: number;
}

interface ShowUIOptions {
  visible?: boolean;
  width?: number;
  height?: number;
  position?: { x: number, y: number };
}

interface NotificationOptions {
  timeout?: number;
  error?: boolean;
  button?: { text: string; action: () => void };
}

interface NotificationHandler {
  cancel: () => void;
}

interface ExportSettings {
  format: "JPG" | "PNG" | "SVG" | "PDF" | "JSON_REST_V1";
  suffix?: string;
  constraint?: { type: "SCALE"; value: number } | { type: "WIDTH"; value: number } | { type: "HEIGHT"; value: number };
}

// Library components
interface LibraryComponent {
  key: string;
  name: string;
  description: string;
  libraryName: string;
}

interface LibraryComponentSet {
  key: string;
  name: string;
  description: string;
  libraryName: string;
}

// AI related interfaces
interface GetDataFromImageRequest {
  // Request structure fields would go here
}

interface GetDataFromImageResponse {
  status: 'SUCCESS' | 'ERROR';
  // Response fields would go here
}

interface GetImageFromTextRequest {
  // Request structure fields would go here
}

interface GetImageFromTextResponse {
  status: 'SUCCESS' | 'ERROR';
  // Response fields would go here
}

interface GetTextFromImageRequest {
  // Request structure fields would go here
}

interface GetTextFromImageResponse {
  status: 'SUCCESS' | 'ERROR';
  // Response fields would go here
}

interface GetCreateNodeSuggestionsRequest {
  // Request structure fields would go here
}

interface GetCreateNodeSuggestionsResponse {
  status: 'SUCCESS' | 'ERROR';
  // Response fields would go here
}

interface GetShapeTranslationsRequest {
  // Request structure fields would go here
}

interface GetShapeTranslationsResponse {
  status: 'SUCCESS' | 'ERROR';
  // Response fields would go here
}

interface GetMockupSuggestionsRequest {
  // Request structure fields would go here
}

interface GetMockupSuggestionsResponse {
  status: 'SUCCESS' | 'ERROR';
  // Response fields would go here
}

interface GetTextToImageRefinementRequest {
  // Request structure fields would go here
}

interface GetTextToImageRefinementResponse {
  status: 'SUCCESS' | 'ERROR';
  // Response fields would go here
}

interface CompleteNodeRequest {
  // Request structure fields would go here
}

interface CompleteNodeResponse {
  status: 'SUCCESS' | 'ERROR';
  // Response fields would go here
}

interface RenameLayersRequest {
  context?: string;
}

interface RenameLayersResponse {
  status: 'SUCCESS' | 'ERROR';
  names?: string[];
  error?: string;
}

interface CreateDataTableRequest {
  // Request structure fields would go here
}

interface DataTableNode extends SceneNode, ChildrenMixin {
  type: "TABLE";
  // Additional properties would go here
}

interface DataTableHeaders {
  // Headers structure would go here
}

interface Transform {
  // Transform structure would go here
}

interface Vector {
  x: number;
  y: number;
}

interface VectorNetwork {
  // VectorNetwork structure would go here
}

interface VectorPaths {
  windingRule: "NONZERO" | "EVENODD";
  data: string;
}

interface HandleMirroring {
  // HandleMirroring structure would go here
}

type BlendMode = "PASS_THROUGH" | "NORMAL" | "DARKEN" | "MULTIPLY" | "LINEAR_BURN" | "COLOR_BURN" | "LIGHTEN" | "SCREEN" | "LINEAR_DODGE" | "COLOR_DODGE" | "OVERLAY" | "SOFT_LIGHT" | "HARD_LIGHT" | "DIFFERENCE" | "EXCLUSION" | "HUE" | "SATURATION" | "COLOR" | "LUMINOSITY";

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}
