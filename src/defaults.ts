import type { MultiFileViewerOptions, RequiredViewerOptions, ToolbarConfig, ViewerLocale, ViewerTheme } from './types';

export const defaultLocale: Required<ViewerLocale> = {
  loading: 'Loading preview...',
  unsupported: 'This file type cannot be previewed yet.',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  rotate: 'Rotate',
  download: 'Download',
  print: 'Print',
  fullscreen: 'Fullscreen',
  fitWidth: 'Fit width',
  reset: 'Reset',
  sheet: 'Sheet',
  page: 'Page',
  error: 'Preview failed'
};

export const zhCNLocale: Required<ViewerLocale> = {
  loading: '正在加载预览...',
  unsupported: '暂不支持预览该文件类型。',
  zoomIn: '放大',
  zoomOut: '缩小',
  rotate: '旋转',
  download: '下载',
  print: '打印',
  fullscreen: '全屏',
  fitWidth: '适应宽度',
  reset: '重置',
  sheet: '工作表',
  page: '页',
  error: '预览失败'
};

export const defaultToolbar: Required<ToolbarConfig> = {
  visible: true,
  zoom: true,
  rotate: true,
  download: true,
  print: true,
  fullscreen: true,
  fitWidth: true,
  reset: true
};

export const defaultTheme: Required<ViewerTheme> = {
  background: '#f6f7f9',
  surface: '#ffffff',
  border: '#dfe3ea',
  text: '#172033',
  mutedText: '#687386',
  primary: '#235ee8',
  toolbarBackground: '#ffffff',
  toolbarText: '#172033',
  accent: '#eef3ff'
};

export function resolveOptions(options: MultiFileViewerOptions = {}): RequiredViewerOptions {
  const locale = {
    ...zhCNLocale,
    ...options.locale
  };
  const toolbar = typeof options.toolbar === 'boolean'
    ? { ...defaultToolbar, visible: options.toolbar }
    : { ...defaultToolbar, ...options.toolbar };

  return {
    file: options.file,
    filename: options.filename,
    type: options.type,
    className: options.className ?? '',
    style: options.style,
    width: options.width ?? '100%',
    height: options.height ?? 640,
    theme: {
      ...defaultTheme,
      ...options.theme
    },
    toolbar,
    locale,
    initialZoom: options.initialZoom ?? 1,
    minZoom: options.minZoom ?? 0.25,
    maxZoom: options.maxZoom ?? 4,
    zoomStep: options.zoomStep ?? 0.15,
    downloadable: options.downloadable ?? true,
    printable: options.printable ?? true,
    excel: {
      sheetName: options.excel?.sheetName,
      maxRows: options.excel?.maxRows ?? 10000,
      maxColumns: options.excel?.maxColumns ?? 200,
      autoFit: options.excel?.autoFit ?? true,
      wrapText: options.excel?.wrapText ?? true,
      minColumnWidth: options.excel?.minColumnWidth ?? 72,
      maxColumnWidth: options.excel?.maxColumnWidth ?? 360,
      rowHeight: options.excel?.rowHeight ?? 'auto',
      allowManualResize: options.excel?.allowManualResize ?? true
    },
    pdf: {
      pageGap: options.pdf?.pageGap ?? 16,
      renderTextLayer: options.pdf?.renderTextLayer ?? false
    },
    code: {
      language: options.code?.language,
      showLineNumbers: options.code?.showLineNumbers ?? true
    },
    word: {
      includeDefaultStyleMap: options.word?.includeDefaultStyleMap ?? true
    },
    requestHeaders: options.requestHeaders ?? {},
    withCredentials: options.withCredentials ?? false,
    renderers: options.renderers ?? [],
    onReady: options.onReady,
    onLoad: options.onLoad,
    onError: options.onError,
    onZoomChange: options.onZoomChange,
    onRotateChange: options.onRotateChange,
    onSheetChange: options.onSheetChange
  };
}
