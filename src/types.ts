export type FileKind =
  | 'pdf'
  | 'word'
  | 'excel'
  | 'markdown'
  | 'code'
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'html'
  | 'unknown';

export type FileSource = string | File | Blob | ArrayBuffer | Uint8Array;

export interface ViewerFile {
  source: FileSource;
  name?: string;
  type?: FileKind;
  mimeType?: string;
}

export interface ViewerTheme {
  background?: string;
  surface?: string;
  border?: string;
  text?: string;
  mutedText?: string;
  primary?: string;
  toolbarBackground?: string;
  toolbarText?: string;
  accent?: string;
}

export interface ToolbarConfig {
  visible?: boolean;
  zoom?: boolean;
  rotate?: boolean;
  download?: boolean;
  print?: boolean;
  fullscreen?: boolean;
  fitWidth?: boolean;
  reset?: boolean;
}

export interface ExcelOptions {
  sheetName?: string;
  maxRows?: number;
  maxColumns?: number;
  autoFit?: boolean;
  wrapText?: boolean;
  minColumnWidth?: number;
  maxColumnWidth?: number;
  rowHeight?: number | 'auto';
  allowManualResize?: boolean;
}

export interface PdfOptions {
  pageGap?: number;
  renderTextLayer?: boolean;
}

export interface CodeOptions {
  language?: string;
  showLineNumbers?: boolean;
}

export interface WordOptions {
  includeDefaultStyleMap?: boolean;
}

export interface ViewerLocale {
  loading?: string;
  unsupported?: string;
  zoomIn?: string;
  zoomOut?: string;
  rotate?: string;
  download?: string;
  print?: string;
  fullscreen?: string;
  exitFullscreen?: string;
  fitWidth?: string;
  reset?: string;
  sheet?: string;
  page?: string;
  error?: string;
}

export interface MultiFileViewerOptions {
  file?: ViewerFile | FileSource;
  filename?: string;
  type?: FileKind;
  className?: string;
  style?: Record<string, string | number>;
  width?: string | number;
  height?: string | number;
  theme?: ViewerTheme;
  toolbar?: boolean | ToolbarConfig;
  locale?: ViewerLocale;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  downloadable?: boolean;
  printable?: boolean;
  excel?: ExcelOptions;
  pdf?: PdfOptions;
  code?: CodeOptions;
  word?: WordOptions;
  requestHeaders?: HeadersInit;
  requestMode?: RequestMode;
  requestCredentials?: RequestCredentials;
  requestCache?: RequestCache;
  referrerPolicy?: ReferrerPolicy;
  crossOrigin?: 'anonymous' | 'use-credentials';
  withCredentials?: boolean;
  renderers?: ViewerRenderer[];
  onReady?: (api: ViewerApi) => void;
  onLoad?: (state: ViewerState) => void;
  onError?: (error: Error) => void;
  onZoomChange?: (zoom: number) => void;
  onRotateChange?: (rotate: number) => void;
  onSheetChange?: (sheetName: string) => void;
}

export interface ViewerState {
  file?: NormalizedFile;
  kind: FileKind;
  loading: boolean;
  error?: Error;
  zoom: number;
  rotate: number;
  fullscreen: boolean;
  activeSheet?: string;
  pageCount?: number;
}

export interface ViewerApi {
  setFile: (file: ViewerFile | FileSource, options?: { filename?: string; type?: FileKind }) => Promise<void>;
  getState: () => ViewerState;
  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (zoom: number) => void;
  rotate: (degrees?: number) => void;
  reset: () => void;
  fitWidth: () => void;
  fullscreen: (enabled?: boolean) => Promise<void>;
  download: (filename?: string) => Promise<void>;
  print: () => void;
  setSheet: (sheetName: string) => void;
  destroy: () => void;
}

export interface NormalizedFile {
  source: FileSource;
  url?: string;
  name: string;
  extension: string;
  mimeType?: string;
  kind: FileKind;
  blob?: Blob;
  arrayBuffer?: ArrayBuffer;
  revokeUrl?: boolean;
}

export interface LoadedFile extends NormalizedFile {
  text?: string;
}

export interface RendererContext {
  file: LoadedFile;
  state: ViewerState;
  options: RequiredViewerOptions;
  setState: (patch: Partial<ViewerState>) => void;
  setSheet: (sheetName: string) => void;
}

export interface ViewerRenderer {
  kind: FileKind | FileKind[];
  render: (container: HTMLElement, context: RendererContext) => void | Promise<void>;
  destroy?: () => void;
}

export type ResolvedToolbarConfig = Required<ToolbarConfig>;
export type ResolvedViewerTheme = Required<ViewerTheme>;
export type ResolvedViewerLocale = Required<ViewerLocale>;
export type ResolvedExcelOptions = Required<Omit<ExcelOptions, 'sheetName'>> & Pick<ExcelOptions, 'sheetName'>;
export type ResolvedPdfOptions = Required<PdfOptions>;
export type ResolvedCodeOptions = Required<Omit<CodeOptions, 'language'>> & Pick<CodeOptions, 'language'>;
export type ResolvedWordOptions = Required<WordOptions>;

export type RequiredViewerOptions = Omit<
  Required<MultiFileViewerOptions>,
  | 'file'
  | 'filename'
  | 'type'
  | 'style'
  | 'theme'
  | 'toolbar'
  | 'locale'
  | 'excel'
  | 'pdf'
  | 'code'
  | 'word'
  | 'renderers'
  | 'onReady'
  | 'onLoad'
  | 'onError'
  | 'onZoomChange'
  | 'onRotateChange'
  | 'onSheetChange'
> & {
  file?: ViewerFile | FileSource;
  filename?: string;
  type?: FileKind;
  style?: Record<string, string | number>;
  theme: ResolvedViewerTheme;
  toolbar: ResolvedToolbarConfig;
  locale: ResolvedViewerLocale;
  excel: ResolvedExcelOptions;
  pdf: ResolvedPdfOptions;
  code: ResolvedCodeOptions;
  word: ResolvedWordOptions;
  renderers: ViewerRenderer[];
  onReady?: (api: ViewerApi) => void;
  onLoad?: (state: ViewerState) => void;
  onError?: (error: Error) => void;
  onZoomChange?: (zoom: number) => void;
  onRotateChange?: (rotate: number) => void;
  onSheetChange?: (sheetName: string) => void;
};
