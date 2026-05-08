import { defineComponent, h, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import type { PropType } from 'vue';
import { MultiFileViewer } from './core/MultiFileViewer';
import type { MultiFileViewerOptions, ViewerApi } from './types';
import './style.css';

export const MultiFileViewerVue = defineComponent({
  name: 'MultiFileViewerVue',
  props: {
    options: {
      type: Object as PropType<MultiFileViewerOptions>,
      default: () => ({})
    },
    className: {
      type: String,
      default: ''
    }
  },
  emits: ['ready'],
  setup(props, { emit, expose }) {
    const containerRef = ref<HTMLElement | null>(null);
    const viewerRef = shallowRef<MultiFileViewer | null>(null);
    const apiRef = shallowRef<ViewerApi | null>(null);

    onMounted(() => {
      if (!containerRef.value) {
        return;
      }

      const viewer = new MultiFileViewer(containerRef.value, props.options);
      viewerRef.value = viewer;
      apiRef.value = viewer.api;
      emit('ready', viewer.api);
    });

    watch(
      () => props.options,
      (options) => {
        viewerRef.value?.setOptions(options);
      },
      { deep: true }
    );

    onBeforeUnmount(() => {
      viewerRef.value?.destroy();
      viewerRef.value = null;
      apiRef.value = null;
    });

    expose({
      get api() {
        return apiRef.value;
      },
      setFile: (...args: Parameters<ViewerApi['setFile']>) => apiRef.value?.setFile(...args),
      getState: () => apiRef.value?.getState(),
      zoomIn: () => apiRef.value?.zoomIn(),
      zoomOut: () => apiRef.value?.zoomOut(),
      setZoom: (zoom: number) => apiRef.value?.setZoom(zoom),
      rotate: (degrees?: number) => apiRef.value?.rotate(degrees),
      reset: () => apiRef.value?.reset(),
      fitWidth: () => apiRef.value?.fitWidth(),
      fullscreen: (enabled?: boolean) => apiRef.value?.fullscreen(enabled),
      download: (filename?: string) => apiRef.value?.download(filename),
      print: () => apiRef.value?.print(),
      setSheet: (sheetName: string) => apiRef.value?.setSheet(sheetName)
    });

    return () => h('div', { ref: containerRef, class: props.className });
  }
});

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
