import DOMPurify from 'dompurify';
import { convertToHtml } from 'mammoth/mammoth.browser';
import { createElement } from '../utils/dom';
import type { ViewerRenderer } from '../types';

export const wordRenderer: ViewerRenderer = {
  kind: 'word',
  async render(container, { file, options, state }) {
    if (file.extension === 'doc') {
      const message = createElement('div', {
        className: 'mfv-empty-message',
        text: '.doc binary documents cannot be rendered safely in the browser. Please convert to .docx or provide a server-side HTML/PDF preview.'
      });
      container.appendChild(message);
      return;
    }

    if (!file.arrayBuffer) {
      throw new Error('Word preview requires an ArrayBuffer file source.');
    }

    const result = await convertToHtml(
      { arrayBuffer: file.arrayBuffer },
      { includeDefaultStyleMap: options.word.includeDefaultStyleMap }
    );
    const article = createElement('article', { className: 'mfv-word' });
    article.style.fontSize = `${16 * state.zoom}px`;
    article.style.transform = `rotate(${state.rotate}deg)`;
    article.innerHTML = DOMPurify.sanitize(result.value);
    container.appendChild(article);
  }
};
