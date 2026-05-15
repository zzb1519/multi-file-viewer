import type { LocaleName, MultiFileViewerOptions, RequiredViewerOptions, ToolbarConfig, ViewerLocale, ViewerTheme } from './types';

export const defaultLocale: Required<ViewerLocale> = {
  loading: 'Loading preview...',
  unsupported: 'This file type cannot be previewed yet.',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  rotate: 'Rotate',
  download: 'Download',
  print: 'Print',
  fullscreen: 'Fullscreen',
  exitFullscreen: 'Exit fullscreen',
  fitWidth: 'Fit width',
  reset: 'Reset',
  sheet: 'Sheet',
  page: 'Page',
  error: 'Preview failed'
};

export const zhCNLocale: Required<ViewerLocale> = {
  loading: '\u6b63\u5728\u52a0\u8f7d\u9884\u89c8...',
  unsupported: '\u6682\u4e0d\u652f\u6301\u9884\u89c8\u8be5\u6587\u4ef6\u7c7b\u578b\u3002',
  zoomIn: '\u653e\u5927',
  zoomOut: '\u7f29\u5c0f',
  rotate: '\u65cb\u8f6c',
  download: '\u4e0b\u8f7d',
  print: '\u6253\u5370',
  fullscreen: '\u5168\u5c4f',
  exitFullscreen: '\u9000\u51fa\u5168\u5c4f',
  fitWidth: '\u9002\u5e94\u5bbd\u5ea6',
  reset: '\u91cd\u7f6e',
  sheet: '\u5de5\u4f5c\u8868',
  page: '\u9875',
  error: '\u9884\u89c8\u5931\u8d25'
};

const localeMap: Record<LocaleName, Required<ViewerLocale>> = {
  'en-US': defaultLocale,
  en: defaultLocale,
  'zh-CN': zhCNLocale
};

export const defaultToolbar: Required<ToolbarConfig> = {
  visible: true,
  zoom: true,
  rotate: true,
  download: true,
  print: false,
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
  const language = resolveLanguage(options.language, options.locale);
  const customLocale = typeof options.locale === 'object' ? options.locale : undefined;
  const locale = {
    ...localeMap[language],
    ...customLocale
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
    language,
    locale,
    initialZoom: options.initialZoom ?? 1,
    minZoom: options.minZoom ?? 0.25,
    maxZoom: options.maxZoom ?? 4,
    zoomStep: options.zoomStep ?? 0.15,
    downloadable: options.downloadable ?? true,
    printable: options.printable ?? false,
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
    requestMode: options.requestMode ?? 'cors',
    requestCredentials: options.requestCredentials ?? (options.crossOrigin === 'use-credentials' || options.withCredentials ? 'include' : 'same-origin'),
    requestCache: options.requestCache ?? 'default',
    referrerPolicy: options.referrerPolicy ?? 'strict-origin-when-cross-origin',
    crossOrigin: options.crossOrigin ?? 'anonymous',
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

function resolveLanguage(language?: LocaleName, locale?: MultiFileViewerOptions['locale']): LocaleName {
  if (typeof locale === 'string') {
    return locale;
  }
  if (language) {
    return language;
  }
  return 'zh-CN';
}
