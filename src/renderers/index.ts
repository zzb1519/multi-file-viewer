import type { ViewerRenderer } from '../types';
import { codeRenderer } from './code';
import { excelRenderer } from './excel';
import { htmlRenderer, audioRenderer, imageRenderer, videoRenderer } from './media';
import { markdownRenderer } from './markdown';
import { pdfRenderer } from './pdf';
import { textRenderer } from './text';
import { unsupportedRenderer } from './unsupported';
import { wordRenderer } from './word';

export const nativeRenderers: ViewerRenderer[] = [
  pdfRenderer,
  excelRenderer,
  wordRenderer,
  markdownRenderer,
  codeRenderer,
  textRenderer,
  imageRenderer,
  videoRenderer,
  audioRenderer,
  htmlRenderer,
  unsupportedRenderer
];

export {
  pdfRenderer,
  excelRenderer,
  wordRenderer,
  markdownRenderer,
  codeRenderer,
  textRenderer,
  imageRenderer,
  videoRenderer,
  audioRenderer,
  htmlRenderer,
  unsupportedRenderer
};
