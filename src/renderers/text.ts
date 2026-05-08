import { createElement } from '../utils/dom';
import type { ViewerRenderer } from '../types';

export const textRenderer: ViewerRenderer = {
  kind: 'text',
  render(container, { file, state }) {
    const pre = createElement('pre', { className: 'mfv-text', text: file.text ?? '' });
    pre.style.fontSize = `${13 * state.zoom}px`;
    pre.style.transform = `rotate(${state.rotate}deg)`;
    container.appendChild(pre);
  }
};
