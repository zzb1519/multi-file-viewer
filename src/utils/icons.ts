import {
  Download,
  Maximize,
  MoreHorizontal,
  Minimize,
  Printer,
  RefreshCw,
  RotateCw,
  StretchHorizontal,
  ZoomIn,
  ZoomOut,
  type IconNode
} from 'lucide';

export type IconName = 'zoomIn' | 'zoomOut' | 'fitWidth' | 'rotate' | 'reset' | 'print' | 'download' | 'fullscreen' | 'exitFullscreen' | 'more';

const ICONS: Record<IconName, IconNode> = {
  zoomIn: ZoomIn,
  zoomOut: ZoomOut,
  fitWidth: StretchHorizontal,
  rotate: RotateCw,
  reset: RefreshCw,
  print: Printer,
  download: Download,
  fullscreen: Maximize,
  exitFullscreen: Minimize,
  more: MoreHorizontal
};

export function renderIcon(name: IconName): string {
  return `<svg class="mfv-toolbar-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${renderIconNode(ICONS[name])}</svg>`;
}

function renderIconNode(node: IconNode): string {
  return node
    .map(([tag, attrs]) => {
      const attributes = Object.entries(attrs)
        .map(([key, value]) => `${toKebabCase(key)}="${escapeAttribute(String(value))}"`)
        .join(' ');
      return `<${tag} ${attributes}></${tag}>`;
    })
    .join('');
}

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
