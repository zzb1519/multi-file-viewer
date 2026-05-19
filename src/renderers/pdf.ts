import { createElement } from '../utils/dom';
import type { RendererContext, ViewerRenderer } from '../types';

export const pdfRenderer: ViewerRenderer = {
  kind: 'pdf',
  async render(container, context) {
    const pdfjs = await import('pdfjs-dist');
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    }

    const documentTask = pdfjs.getDocument({ data: context.file.arrayBuffer?.slice(0) });
    const pdf = await documentTask.promise;
    context.setState({ pageCount: pdf.numPages });

    const wrapper = createElement('div', { className: 'mfv-pdf' });
    wrapper.style.gap = `${context.options.pdf.pageGap}px`;
    container.appendChild(wrapper);
    const basePage = await pdf.getPage(1);
    const baseViewport = basePage.getViewport({
      scale: 1,
      rotation: context.state.rotate
    });
    const layoutScale = resolveLayoutScale(container, context, baseViewport.width, baseViewport.height);

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = pageNumber === 1 ? basePage : await pdf.getPage(pageNumber);
      const viewport = page.getViewport({
        scale: context.state.zoom * layoutScale,
        rotation: context.state.rotate
      });
      const pageFrame = createElement('div', {
        className: 'mfv-pdf-page',
        attrs: {
          'data-page': String(pageNumber)
        }
      });
      const canvas = createElement('canvas', { className: 'mfv-pdf-canvas' });
      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      const context2d = canvas.getContext('2d');
      if (!context2d) {
        throw new Error('Canvas 2D context is not available.');
      }

      pageFrame.appendChild(canvas);
      wrapper.appendChild(pageFrame);
      await page.render({
        canvasContext: context2d,
        viewport,
        transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined
      }).promise;
    }
  }
};

function resolveLayoutScale(container: HTMLElement, context: RendererContext, width: number, height: number): number {
  const fit = context.options.layout.fit;
  if (fit === 'natural') {
    return 1;
  }

  const padding = parseSize(context.options.layout.contentPadding);
  const availableWidth = Math.max(1, container.clientWidth - padding * 2);
  const widthScale = availableWidth / width;
  if (fit === 'width') {
    return widthScale;
  }

  const availableHeight = Math.max(1, container.clientHeight - padding * 2);
  return Math.min(widthScale, availableHeight / height);
}

function parseSize(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
