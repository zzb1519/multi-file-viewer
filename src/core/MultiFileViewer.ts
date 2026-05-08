import { nativeRenderers } from '../renderers';
import { resolveOptions } from '../defaults';
import type {
  FileKind,
  FileSource,
  LoadedFile,
  MultiFileViewerOptions,
  RequiredViewerOptions,
  ViewerApi,
  ViewerFile,
  ViewerRenderer,
  ViewerState
} from '../types';
import { clearElement, createElement, formatSize, makeButton, setStyles } from '../utils/dom';
import { downloadUrl, loadFile, normalizeFile, releaseLoadedFile } from '../utils/file';
import { renderIcon, type IconName } from '../utils/icons';

const ROOT_CLASS = 'mfv-root';

export class MultiFileViewer {
  private readonly root: HTMLElement;
  private readonly toolbar: HTMLElement;
  private readonly viewport: HTMLElement;
  private readonly content: HTMLElement;
  private options: RequiredViewerOptions;
  private file?: LoadedFile;
  private renderer?: ViewerRenderer;
  private renderToken = 0;
  private destroyed = false;
  private state: ViewerState;

  readonly api: ViewerApi;

  constructor(target: HTMLElement | string, options: MultiFileViewerOptions = {}) {
    const element = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    if (!element) {
      throw new Error('MultiFileViewer target element was not found.');
    }

    this.options = resolveOptions(options);
    this.root = createElement('div', { className: `${ROOT_CLASS} ${this.options.className}`.trim() });
    this.toolbar = createElement('div', { className: 'mfv-toolbar' });
    this.viewport = createElement('div', { className: 'mfv-viewport' });
    this.content = createElement('div', { className: 'mfv-content' });
    this.viewport.appendChild(this.content);
    this.root.append(this.toolbar, this.viewport);
    element.appendChild(this.root);
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);

    this.state = {
      kind: this.options.type ?? 'unknown',
      loading: false,
      zoom: this.options.initialZoom,
      rotate: 0,
      fullscreen: false
    };

    this.api = this.createApi();
    this.applyRootOptions();
    this.renderToolbar();
    this.options.onReady?.(this.api);

    if (this.options.file) {
      void this.api.setFile(this.options.file, {
        filename: this.options.filename,
        type: this.options.type
      });
    } else {
      this.renderEmpty();
    }
  }

  setOptions(options: MultiFileViewerOptions): void {
    const previousFile = this.options.file;
    this.options = resolveOptions({
      ...this.options,
      ...options,
      toolbar: mergeToolbar(this.options.toolbar, options.toolbar),
      theme: {
        ...this.options.theme,
        ...options.theme
      },
      locale: {
        ...this.options.locale,
        ...options.locale
      },
      excel: {
        ...this.options.excel,
        ...options.excel
      },
      pdf: {
        ...this.options.pdf,
        ...options.pdf
      },
      code: {
        ...this.options.code,
        ...options.code
      },
      word: {
        ...this.options.word,
        ...options.word
      },
      renderers: options.renderers ?? this.options.renderers
    });
    this.applyRootOptions();
    this.renderToolbar();

    if (options.file && options.file !== previousFile) {
      void this.api.setFile(options.file, {
        filename: options.filename,
        type: options.type
      });
      return;
    }

    if (this.file) {
      void this.renderCurrentFile();
    }
  }

  destroy(): void {
    this.destroyed = true;
    this.renderer?.destroy?.();
    releaseLoadedFile(this.file);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    this.root.remove();
  }

  private createApi(): ViewerApi {
    return {
      setFile: async (file, options) => {
        await this.setFile(file, options);
      },
      getState: () => ({ ...this.state }),
      zoomIn: () => this.setZoom(this.state.zoom + this.options.zoomStep),
      zoomOut: () => this.setZoom(this.state.zoom - this.options.zoomStep),
      setZoom: (zoom) => this.setZoom(zoom),
      rotate: (degrees = 90) => this.setRotate(this.state.rotate + degrees),
      reset: () => {
        this.updateState({ zoom: this.options.initialZoom, rotate: 0 });
        this.options.onZoomChange?.(this.state.zoom);
        this.options.onRotateChange?.(this.state.rotate);
        void this.renderCurrentFile();
      },
      fitWidth: () => this.fitWidth(),
      fullscreen: async (enabled) => {
        await this.setFullscreen(enabled);
      },
      download: async (filename) => {
        await this.download(filename);
      },
      print: () => this.print(),
      setSheet: (sheetName) => {
        this.setSheet(sheetName);
      },
      destroy: () => this.destroy()
    };
  }

  private async setFile(input: ViewerFile | FileSource, fallback?: { filename?: string; type?: FileKind }): Promise<void> {
    const token = ++this.renderToken;
    this.renderer?.destroy?.();
    releaseLoadedFile(this.file);
    this.file = undefined;
    this.updateState({
      loading: true,
      error: undefined,
      activeSheet: undefined,
      pageCount: undefined,
      file: undefined,
      kind: fallback?.type ?? 'unknown'
    });
    this.renderLoading();

    try {
      const normalized = normalizeFile(input, fallback);
      const loadedFile = await loadFile(normalized, {
        headers: this.options.requestHeaders,
        mode: this.options.requestMode,
        credentials: this.options.requestCredentials,
        cache: this.options.requestCache,
        referrerPolicy: this.options.referrerPolicy,
        withCredentials: this.options.withCredentials
      });
      if (this.destroyed || token !== this.renderToken) {
        releaseLoadedFile(loadedFile);
        return;
      }

      this.file = loadedFile;
      this.updateState({
        file: loadedFile,
        kind: loadedFile.kind,
        loading: false,
        error: undefined
      });
      await this.renderCurrentFile(token);
      this.options.onLoad?.({ ...this.state });
    } catch (error) {
      if (this.destroyed || token !== this.renderToken) {
        return;
      }
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      this.updateState({ loading: false, error: normalizedError });
      this.renderError(normalizedError);
      this.options.onError?.(normalizedError);
    }
  }

  private async renderCurrentFile(token = this.renderToken): Promise<void> {
    if (!this.file || this.destroyed) {
      return;
    }

    this.renderer?.destroy?.();
    clearElement(this.content);
    this.renderer = this.findRenderer(this.file.kind);
    const renderer = this.renderer;

    try {
      await renderer.render(this.content, {
        file: this.file,
        state: { ...this.state },
        options: this.options,
        setState: (patch) => this.updateState(patch),
        setSheet: (sheetName) => this.setSheet(sheetName)
      });
    } catch (error) {
      if (this.destroyed || token !== this.renderToken) {
        return;
      }
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      this.updateState({ error: normalizedError });
      this.renderError(normalizedError);
      this.options.onError?.(normalizedError);
    }
  }

  private findRenderer(kind: FileKind): ViewerRenderer {
    const renderers = [...this.options.renderers, ...nativeRenderers];
    return renderers.find((renderer) => {
      const kinds = Array.isArray(renderer.kind) ? renderer.kind : [renderer.kind];
      return kinds.includes(kind);
    }) ?? nativeRenderers[nativeRenderers.length - 1];
  }

  private renderToolbar(): void {
    clearElement(this.toolbar);
    const toolbar = this.options.toolbar;
    this.toolbar.hidden = !toolbar.visible;
    if (!toolbar.visible) {
      return;
    }

    const left = createElement('div', { className: 'mfv-toolbar-group' });
    const right = createElement('div', { className: 'mfv-toolbar-group' });
    const filename = createElement('div', { className: 'mfv-file-name', text: this.file?.name ?? this.options.filename ?? '' });
    left.appendChild(filename);

    if (toolbar.zoom) {
      right.appendChild(this.bindButton('zoomOut', this.options.locale.zoomOut, () => this.api.zoomOut()));
      right.appendChild(createElement('span', { className: 'mfv-zoom-value', text: `${Math.round(this.state.zoom * 100)}%` }));
      right.appendChild(this.bindButton('zoomIn', this.options.locale.zoomIn, () => this.api.zoomIn()));
    }
    if (toolbar.fitWidth) {
      right.appendChild(this.bindButton('fitWidth', this.options.locale.fitWidth, () => this.api.fitWidth()));
    }
    if (toolbar.rotate) {
      right.appendChild(this.bindButton('rotate', this.options.locale.rotate, () => this.api.rotate()));
    }
    if (toolbar.reset) {
      right.appendChild(this.bindButton('reset', this.options.locale.reset, () => this.api.reset()));
    }
    if (toolbar.print && this.options.printable) {
      right.appendChild(this.bindButton('print', this.options.locale.print, () => this.api.print()));
    }
    if (toolbar.download && this.options.downloadable) {
      right.appendChild(this.bindButton('download', this.options.locale.download, () => void this.api.download()));
    }
    if (toolbar.fullscreen) {
      const icon = this.state.fullscreen ? 'exitFullscreen' : 'fullscreen';
      const label = this.state.fullscreen ? this.options.locale.exitFullscreen : this.options.locale.fullscreen;
      right.appendChild(this.bindButton(icon, label, () => void this.api.fullscreen()));
    }

    this.toolbar.append(left, right);
  }

  private bindButton(icon: IconName, title: string, handler: () => void): HTMLButtonElement {
    const button = makeButton(renderIcon(icon), title, 'mfv-toolbar-button mfv-icon-button', true);
    button.addEventListener('click', handler);
    return button;
  }

  private renderLoading(): void {
    clearElement(this.content);
    const loading = createElement('div', { className: 'mfv-loading', text: this.options.locale.loading });
    this.content.appendChild(loading);
    this.renderToolbar();
  }

  private renderError(error: Error): void {
    clearElement(this.content);
    const wrapper = createElement('div', { className: 'mfv-empty' });
    const detail = createElement('pre', {
      className: 'mfv-error-detail',
      text: error.stack || `${error.name}: ${error.message}`
    });
    wrapper.append(
      createElement('div', { className: 'mfv-empty-badge', text: '!' }),
      createElement('div', { className: 'mfv-empty-title', text: this.options.locale.error }),
      createElement('div', { className: 'mfv-empty-message', text: error.message }),
      detail
    );
    this.content.appendChild(wrapper);
    this.renderToolbar();
  }

  private renderEmpty(): void {
    clearElement(this.content);
    const wrapper = createElement('div', { className: 'mfv-empty' });
    wrapper.append(
      createElement('div', { className: 'mfv-empty-badge', text: '+' }),
      createElement('div', { className: 'mfv-empty-message', text: this.options.locale.unsupported })
    );
    this.content.appendChild(wrapper);
  }

  private setZoom(zoom: number): void {
    const nextZoom = clamp(zoom, this.options.minZoom, this.options.maxZoom);
    if (nextZoom === this.state.zoom) {
      return;
    }
    this.updateState({ zoom: nextZoom });
    this.options.onZoomChange?.(nextZoom);
    void this.renderCurrentFile();
  }

  private setRotate(rotate: number): void {
    const nextRotate = ((rotate % 360) + 360) % 360;
    this.updateState({ rotate: nextRotate });
    this.options.onRotateChange?.(nextRotate);
    void this.renderCurrentFile();
  }

  private fitWidth(): void {
    const page = this.content.querySelector<HTMLElement>('.mfv-pdf-page, .mfv-word, .mfv-markdown, .mfv-text, .mfv-code, .mfv-excel-table, .mfv-image');
    if (!page) {
      this.setZoom(1);
      return;
    }

    const viewportWidth = this.viewport.clientWidth - 32;
    const pageWidth = page.scrollWidth || page.getBoundingClientRect().width;
    if (pageWidth > 0) {
      this.setZoom(clamp(viewportWidth / pageWidth * this.state.zoom, this.options.minZoom, this.options.maxZoom));
    }
  }

  private async setFullscreen(enabled?: boolean): Promise<void> {
    const shouldEnter = enabled ?? !this.state.fullscreen;
    if (shouldEnter && !document.fullscreenElement) {
      await this.root.requestFullscreen?.();
      this.updateState({ fullscreen: true });
      return;
    }

    if (!shouldEnter && document.fullscreenElement === this.root) {
      await document.exitFullscreen?.();
      this.updateState({ fullscreen: false });
    }
  }

  private handleFullscreenChange = (): void => {
    this.updateState({ fullscreen: document.fullscreenElement === this.root });
  };

  private async download(filename?: string): Promise<void> {
    if (!this.file) {
      return;
    }

    if (this.file.url) {
      downloadUrl(this.file.url, filename ?? this.file.name);
      return;
    }

    if (typeof this.file.source === 'string') {
      downloadUrl(this.file.source, filename ?? this.file.name);
    }
  }

  private print(): void {
    if (!this.file) {
      return;
    }

    if (this.file.kind === 'pdf' || this.file.kind === 'image' || this.file.kind === 'html') {
      const frame = createElement('iframe', {
        className: 'mfv-print-frame',
        attrs: {
          src: this.file.url ?? String(this.file.source),
          title: 'print'
        }
      });
      document.body.appendChild(frame);
      frame.addEventListener('load', () => {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
        setTimeout(() => frame.remove(), 1000);
      });
      return;
    }

    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) {
      return;
    }
    printWindow.document.write(`<!doctype html><html><head><title>${escapeHtml(this.file.name)}</title></head><body>${this.content.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  private setSheet(sheetName: string): void {
    this.updateState({ activeSheet: sheetName });
    this.options.onSheetChange?.(sheetName);
    void this.renderCurrentFile();
  }

  private updateState(patch: Partial<ViewerState>): void {
    this.state = {
      ...this.state,
      ...patch
    };
    this.renderToolbar();
  }

  private applyRootOptions(): void {
    const theme = this.options.theme;
    this.root.className = `${ROOT_CLASS} ${this.options.className}`.trim();
    setStyles(this.root, {
      width: formatSize(this.options.width),
      height: formatSize(this.options.height),
      '--mfv-background': theme.background,
      '--mfv-surface': theme.surface,
      '--mfv-border': theme.border,
      '--mfv-text': theme.text,
      '--mfv-muted-text': theme.mutedText,
      '--mfv-primary': theme.primary,
      '--mfv-toolbar-background': theme.toolbarBackground,
      '--mfv-toolbar-text': theme.toolbarText,
      '--mfv-accent': theme.accent,
      ...this.options.style
    });
  }
}

export function createViewer(target: HTMLElement | string, options: MultiFileViewerOptions = {}): ViewerApi {
  const viewer = new MultiFileViewer(target, options);
  return viewer.api;
}

function mergeToolbar(previous: RequiredViewerOptions['toolbar'], next: MultiFileViewerOptions['toolbar']): MultiFileViewerOptions['toolbar'] {
  if (next === undefined) {
    return previous;
  }
  if (typeof next === 'boolean') {
    return next;
  }
  return {
    ...previous,
    ...next
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
