import { createElement } from '../utils/dom';
import type { ViewerRenderer } from '../types';

export const imageRenderer: ViewerRenderer = {
  kind: 'image',
  render(container, { file, state }) {
    const wrapper = createElement('div', { className: 'mfv-media-frame' });
    const image = createElement('img', {
      className: 'mfv-image',
      attrs: {
        src: file.url ?? String(file.source),
        alt: file.name
      },
      styles: {
        transform: `scale(${state.zoom}) rotate(${state.rotate}deg)`
      }
    });
    wrapper.appendChild(image);
    container.appendChild(wrapper);
  }
};

export const videoRenderer: ViewerRenderer = {
  kind: 'video',
  render(container, { file, options }) {
    const video = createElement('video', {
      className: 'mfv-video',
      attrs: {
        src: file.url ?? String(file.source),
        controls: 'true'
      }
    });
    if (options.layout.fit === 'contain') {
      video.classList.add('mfv-media-contain');
    }
    container.appendChild(video);
  }
};

export const audioRenderer: ViewerRenderer = {
  kind: 'audio',
  render(container, { file }) {
    const wrapper = createElement('div', { className: 'mfv-audio-frame' });
    const name = createElement('div', { className: 'mfv-audio-name', text: file.name });
    const audio = createElement('audio', {
      className: 'mfv-audio',
      attrs: {
        src: file.url ?? String(file.source),
        controls: 'true'
      }
    });
    wrapper.append(name, audio);
    container.appendChild(wrapper);
  }
};

export const htmlRenderer: ViewerRenderer = {
  kind: 'html',
  render(container, { file, options }) {
    const iframe = createElement('iframe', {
      className: 'mfv-html',
      attrs: {
        sandbox: 'allow-same-origin allow-popups allow-forms',
        title: file.name
      }
    });
    if (options.layout.fit === 'contain') {
      iframe.classList.add('mfv-media-contain');
    }

    if (file.url) {
      iframe.src = file.url;
    } else {
      iframe.srcdoc = file.text ?? '';
    }

    container.appendChild(iframe);
  }
};
