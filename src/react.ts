import { createElement as createReactElement, forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { MultiFileViewer } from './core/MultiFileViewer';
import type { MultiFileViewerOptions, ViewerApi } from './types';
import './style.css';

export interface MultiFileViewerReactProps extends MultiFileViewerOptions {
  containerClassName?: string;
  containerStyle?: CSSProperties;
}

export type MultiFileViewerReactRef = ViewerApi;

export const MultiFileViewerReact = forwardRef<MultiFileViewerReactRef, MultiFileViewerReactProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<MultiFileViewer | null>(null);
  const apiRef = useRef<ViewerApi | null>(null);
  const refApi = useMemo<ViewerApi>(() => ({
    setFile: (...args) => {
      const api = apiRef.current;
      if (!api) {
        return Promise.reject(new Error('MultiFileViewerReact is not mounted yet.'));
      }
      return api.setFile(...args);
    },
    getState: () => apiRef.current?.getState() ?? {
      kind: props.type ?? 'unknown',
      loading: false,
      zoom: props.initialZoom ?? 1,
      rotate: 0,
      fullscreen: false
    },
    zoomIn: () => apiRef.current?.zoomIn(),
    zoomOut: () => apiRef.current?.zoomOut(),
    setZoom: (zoom) => apiRef.current?.setZoom(zoom),
    rotate: (degrees) => apiRef.current?.rotate(degrees),
    reset: () => apiRef.current?.reset(),
    fitWidth: () => apiRef.current?.fitWidth(),
    fullscreen: (enabled) => apiRef.current?.fullscreen(enabled) ?? Promise.resolve(),
    download: (filename) => apiRef.current?.download(filename) ?? Promise.resolve(),
    print: () => apiRef.current?.print(),
    setSheet: (sheetName) => apiRef.current?.setSheet(sheetName),
    destroy: () => apiRef.current?.destroy()
  }), []);

  useImperativeHandle(ref, () => refApi, [refApi]);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) {
      return;
    }

    const viewer = new MultiFileViewer(containerRef.current, props);
    viewerRef.current = viewer;
    apiRef.current = viewer.api;

    return () => {
      viewer.destroy();
      viewerRef.current = null;
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    viewerRef.current?.setOptions(props);
  });

  return createReactElement('div', {
    ref: containerRef,
    className: props.containerClassName,
    style: props.containerStyle
  });
});

MultiFileViewerReact.displayName = 'MultiFileViewerReact';

export { createViewer, MultiFileViewer } from './core';
export type {
  CodeOptions,
  ExcelOptions,
  FileKind,
  FileSource,
  MultiFileViewerOptions,
  PdfOptions,
  ToolbarConfig,
  ViewerApi,
  ViewerFile,
  ViewerLocale,
  ViewerRenderer,
  ViewerState,
  ViewerTheme,
  WordOptions
} from './types';
