export function setStyles(element: HTMLElement, styles: Record<string, string | number | undefined>): void {
  Object.entries(styles).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }
    element.style.setProperty(toKebabCase(key), typeof value === 'number' && key !== 'opacity' && key !== 'zIndex' ? `${value}px` : String(value));
  });
}

export function clearElement(element: HTMLElement): void {
  while (element.firstChild) {
    element.firstChild.remove();
  }
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: {
    className?: string;
    text?: string;
    attrs?: Record<string, string>;
    styles?: Record<string, string | number | undefined>;
  } = {}
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (options.className) {
    element.className = options.className;
  }
  if (options.text !== undefined) {
    element.textContent = options.text;
  }
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => element.setAttribute(key, value));
  }
  if (options.styles) {
    setStyles(element, options.styles);
  }
  return element;
}

export function formatSize(value?: string | number): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return typeof value === 'number' ? `${value}px` : value;
}

export function makeButton(label: string, title: string, className = 'mfv-toolbar-button'): HTMLButtonElement {
  const button = createElement('button', {
    className,
    text: label,
    attrs: {
      type: 'button',
      title,
      'aria-label': title
    }
  });
  return button;
}

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}
