import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import { createElement } from '../utils/dom';
import type { ViewerRenderer } from '../types';

const EXTENSION_LANGUAGE: Record<string, string> = {
  js: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'tsx',
  json: 'json',
  css: 'css',
  scss: 'scss',
  html: 'markup',
  htm: 'markup',
  xml: 'markup',
  py: 'python',
  sh: 'bash',
  bash: 'bash',
  go: 'go',
  rs: 'rust',
  java: 'java',
  sql: 'sql'
};

export const codeRenderer: ViewerRenderer = {
  kind: 'code',
  render(container, { file, options, state }) {
    const language = options.code.language ?? EXTENSION_LANGUAGE[file.extension] ?? file.extension ?? 'markup';
    const grammar = Prism.languages[language] ?? Prism.languages.markup;
    const highlighted = Prism.highlight(file.text ?? '', grammar, language);
    const pre = createElement('pre', { className: `mfv-code language-${language}` });
    const code = createElement('code', { className: `language-${language}` });
    pre.style.fontSize = `${13 * state.zoom}px`;
    pre.style.transform = `rotate(${state.rotate}deg)`;

    if (options.code.showLineNumbers) {
      const lines = highlighted.split('\n');
      code.innerHTML = lines
        .map((line, index) => `<span class="mfv-code-line"><span class="mfv-code-no">${index + 1}</span><span class="mfv-code-text">${line || ' '}</span></span>`)
        .join('');
    } else {
      code.innerHTML = highlighted;
    }

    pre.appendChild(code);
    container.appendChild(pre);
  }
};
