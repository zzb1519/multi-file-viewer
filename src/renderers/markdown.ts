import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { createElement } from '../utils/dom';
import type { ViewerRenderer } from '../types';

export const markdownRenderer: ViewerRenderer = {
  kind: 'markdown',
  render(container, { file, state }) {
    const article = createElement('article', { className: 'mfv-markdown' });
    article.style.fontSize = `${16 * state.zoom}px`;
    article.style.transform = `rotate(${state.rotate}deg)`;
    article.innerHTML = DOMPurify.sanitize(marked.parse(file.text ?? '') as string);
    container.appendChild(article);
  }
};
