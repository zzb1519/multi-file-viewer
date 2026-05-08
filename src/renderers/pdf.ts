import { createElement } from '../utils/dom';
import type { ViewerRenderer } from '../types';

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

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({
        scale: context.state.zoom,
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
