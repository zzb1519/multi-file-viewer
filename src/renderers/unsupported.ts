import { createElement } from '../utils/dom';
import type { ViewerRenderer } from '../types';

export const unsupportedRenderer: ViewerRenderer = {
  kind: 'unknown',
  render(container, { file, options }) {
    const wrapper = createElement('div', { className: 'mfv-empty' });
    const badge = createElement('div', { className: 'mfv-empty-badge', text: file.extension ? file.extension.toUpperCase() : '?' });
    const title = createElement('div', { className: 'mfv-empty-title', text: file.name });
    const message = createElement('div', { className: 'mfv-empty-message', text: options.locale.unsupported });
    wrapper.append(badge, title, message);
    container.appendChild(wrapper);
  }
};
