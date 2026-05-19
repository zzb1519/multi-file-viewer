import * as XLSX from 'xlsx';
import { createElement } from '../utils/dom';
import type { RendererContext, ViewerRenderer } from '../types';

interface SheetView {
  rows: unknown[][];
  columnWidths: number[];
  rowHeights: number[];
}

const ROW_HEADER_WIDTH = 46;
const DEFAULT_ROW_HEIGHT = 24;

export const excelRenderer: ViewerRenderer = {
  kind: 'excel',
  render(container, context) {
    const workbook = readWorkbook(context.file);
    const sheetNames = workbook.SheetNames;
    const activeSheet = context.state.activeSheet && sheetNames.includes(context.state.activeSheet)
      ? context.state.activeSheet
      : context.options.excel.sheetName && sheetNames.includes(context.options.excel.sheetName)
        ? context.options.excel.sheetName
        : sheetNames[0];

    if (!activeSheet) {
      container.appendChild(createElement('div', { className: 'mfv-empty-message', text: 'No sheets found.' }));
      return;
    }

    context.setState({ activeSheet });
    renderWorkbook(container, context, workbook, activeSheet);
  }
};

function readWorkbook(file: RendererContext['file']): XLSX.WorkBook {
  if (file.extension === 'csv' || file.extension === 'tsv') {
    return XLSX.read(file.text ?? '', {
      type: 'string',
      FS: file.extension === 'tsv' ? '\t' : ','
    });
  }

  return XLSX.read(file.arrayBuffer, {
    type: 'array',
    cellDates: true,
    cellNF: true,
    cellStyles: true,
    cellText: false
  });
}

function renderWorkbook(
  container: HTMLElement,
  context: RendererContext,
  workbook: XLSX.WorkBook,
  activeSheet: string
): void {
  const shell = createElement('div', { className: 'mfv-excel' });
  const gridWrap = createElement('div', { className: 'mfv-excel-grid-wrap' });
  const scroller = createElement('div', { className: 'mfv-excel-scroller' });
  const sheetView = buildSheetView(workbook.Sheets[activeSheet], context);
  const table = renderSheetTable(workbook.Sheets[activeSheet], sheetView, context);
  table.style.fontSize = `${13 * context.state.zoom}px`;
  if (context.options.layout.fit === 'natural') {
    shell.style.width = `${getSheetWidth(sheetView)}px`;
  }

  scroller.appendChild(table);
  gridWrap.appendChild(scroller);
  shell.append(gridWrap, renderSheetTabs(workbook.SheetNames, activeSheet, context));
  container.appendChild(shell);
}

function getSheetWidth(view: SheetView): number {
  return ROW_HEADER_WIDTH + view.columnWidths.reduce((sum, width) => sum + width, 0);
}

function renderSheetTabs(sheetNames: string[], activeSheet: string, context: RendererContext): HTMLElement {
  const footer = createElement('div', { className: 'mfv-sheet-bar' });
  const nav = createElement('div', { className: 'mfv-sheet-nav', text: '\u2039 \u203a' });
  const tabs = createElement('div', { className: 'mfv-sheet-tabs' });

  sheetNames.forEach((sheetName) => {
    const button = createElement('button', {
      className: sheetName === activeSheet ? 'mfv-sheet-tab is-active' : 'mfv-sheet-tab',
      text: sheetName,
      attrs: {
        type: 'button',
        title: `${context.options.locale.sheet}: ${sheetName}`
      }
    });
    button.addEventListener('click', () => {
      context.setSheet(sheetName);
    });
    tabs.appendChild(button);
  });

  footer.append(nav, tabs);
  return footer;
}

function buildSheetView(sheet: XLSX.WorkSheet, context: RendererContext): SheetView {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: false,
    defval: ''
  });
  const maxRows = context.options.excel.maxRows;
  const maxColumns = context.options.excel.maxColumns;
  const clippedRows = rows.slice(0, maxRows).map((row) => row.slice(0, maxColumns));
  const columnCount = Math.max(1, ...clippedRows.map((row) => row.length));
  const zoom = context.state.zoom;
  const columnWidths = Array.from({ length: columnCount }, (_, columnIndex) => {
    const explicitWidth = getExplicitColumnWidth(sheet, columnIndex);
    if (explicitWidth) {
      return explicitWidth * zoom;
    }

    if (!context.options.excel.autoFit) {
      return 112 * zoom;
    }

    let maxLength = 6;
    clippedRows.forEach((row) => {
      const value = formatCellValue(row[columnIndex]);
      const visualLength = Array.from(value).reduce((sum, char) => sum + (char.charCodeAt(0) > 255 ? 2 : 1), 0);
      maxLength = Math.max(maxLength, Math.min(80, visualLength));
    });

    return clamp(maxLength * 7 + 22, context.options.excel.minColumnWidth, context.options.excel.maxColumnWidth) * zoom;
  });

  const rowHeights = clippedRows.map((row, rowIndex) => {
    const explicitHeight = getExplicitRowHeight(sheet, rowIndex);
    if (explicitHeight) {
      return explicitHeight * zoom;
    }

    if (context.options.excel.rowHeight !== 'auto') {
      return context.options.excel.rowHeight * zoom;
    }

    if (!context.options.excel.wrapText) {
      return DEFAULT_ROW_HEIGHT * zoom;
    }

    const longest = row.reduce<number>((max, value) => Math.max(max, formatCellValue(value).length), 0);
    return clamp(DEFAULT_ROW_HEIGHT + Math.floor(longest / 60) * 18, DEFAULT_ROW_HEIGHT, 120) * zoom;
  });

  return {
    rows: clippedRows,
    columnWidths,
    rowHeights
  };
}

function renderSheetTable(sheet: XLSX.WorkSheet, view: SheetView, context: RendererContext): HTMLTableElement {
  const table = createElement('table', { className: 'mfv-excel-table' });
  const colgroup = createElement('colgroup');
  colgroup.appendChild(createElement('col', { styles: { width: ROW_HEADER_WIDTH } }));
  view.columnWidths.forEach((width) => {
    colgroup.appendChild(createElement('col', { styles: { width } }));
  });
  table.appendChild(colgroup);

  const thead = createElement('thead');
  const headerRow = createElement('tr');
  headerRow.appendChild(createElement('th', { className: 'mfv-excel-corner' }));
  view.columnWidths.forEach((_, index) => {
    const cell = createElement('th', { className: 'mfv-excel-column-header', text: getColumnName(index) });
    if (context.options.excel.allowManualResize) {
      const handle = createElement('span', { className: 'mfv-excel-col-resize-handle' });
      attachColumnResize(handle, table, index + 1, context);
      cell.appendChild(handle);
    }
    headerRow.appendChild(cell);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = createElement('tbody');
  view.rows.forEach((row, rowIndex) => {
    const tr = createElement('tr');
    tr.style.height = `${view.rowHeights[rowIndex] ?? DEFAULT_ROW_HEIGHT}px`;
    const rowHeader = createElement('th', { className: 'mfv-excel-row-header', text: String(rowIndex + 1) });
    if (context.options.excel.allowManualResize) {
      const handle = createElement('span', { className: 'mfv-excel-row-resize-handle' });
      attachRowResize(handle, tr, context);
      rowHeader.appendChild(handle);
    }
    tr.appendChild(rowHeader);

    for (let columnIndex = 0; columnIndex < view.columnWidths.length; columnIndex += 1) {
      const address = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
      tr.appendChild(createCell(sheet[address], row[columnIndex], context));
    }
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  return table;
}

function createCell(cell: XLSX.CellObject | undefined, value: unknown, context: RendererContext): HTMLTableCellElement {
  const td = createElement('td', {
    className: context.options.excel.wrapText ? 'mfv-excel-cell is-wrapped' : 'mfv-excel-cell',
    text: formatCellValue(value)
  });
  applyCellStyle(td, cell);
  return td;
}

function applyCellStyle(td: HTMLTableCellElement, cell?: XLSX.CellObject): void {
  const style = cell?.s as {
    fgColor?: { rgb?: string };
    font?: { color?: { rgb?: string }; bold?: boolean; italic?: boolean; sz?: number; name?: string };
    alignment?: { horizontal?: string; vertical?: string; wrapText?: boolean };
  } | undefined;

  if (!style) {
    return;
  }

  const fill = normalizeExcelColor(style.fgColor?.rgb);
  const fontColor = normalizeExcelColor(style.font?.color?.rgb);
  if (fill) {
    td.style.backgroundColor = fill;
  }
  if (fontColor) {
    td.style.color = fontColor;
  }
  if (style.font?.bold) {
    td.style.fontWeight = '700';
  }
  if (style.font?.italic) {
    td.style.fontStyle = 'italic';
  }
  if (style.font?.sz) {
    td.style.fontSize = `${style.font.sz}px`;
  }
  if (style.font?.name) {
    td.style.fontFamily = style.font.name;
  }
  if (style.alignment?.horizontal) {
    td.style.textAlign = mapHorizontalAlign(style.alignment.horizontal);
  }
  if (style.alignment?.vertical) {
    td.style.verticalAlign = mapVerticalAlign(style.alignment.vertical);
  }
  if (style.alignment?.wrapText) {
    td.classList.add('is-wrapped');
  }
}

function attachColumnResize(
  handle: HTMLElement,
  table: HTMLTableElement,
  colElementIndex: number,
  context: RendererContext
): void {
  let startX = 0;
  let startWidth = 0;

  const onMove = (event: PointerEvent) => {
    const nextWidth = clamp(startWidth + event.clientX - startX, context.options.excel.minColumnWidth, context.options.excel.maxColumnWidth * 2);
    const column = table.querySelectorAll('col')[colElementIndex] as HTMLTableColElement | undefined;
    if (column) {
      column.style.width = `${nextWidth}px`;
    }
  };

  const onUp = () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    document.body.classList.remove('mfv-is-col-resizing');
  };

  handle.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation();
    startX = event.clientX;
    const column = table.querySelectorAll('col')[colElementIndex] as HTMLTableColElement | undefined;
    startWidth = column?.getBoundingClientRect().width ?? 112;
    document.body.classList.add('mfv-is-col-resizing');
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  });
}

function attachRowResize(handle: HTMLElement, row: HTMLTableRowElement, context: RendererContext): void {
  let startY = 0;
  let startHeight = 0;

  const onMove = (event: PointerEvent) => {
    const nextHeight = clamp(startHeight + event.clientY - startY, 18 * context.state.zoom, 240 * context.state.zoom);
    row.style.height = `${nextHeight}px`;
  };

  const onUp = () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    document.body.classList.remove('mfv-is-row-resizing');
  };

  handle.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation();
    startY = event.clientY;
    startHeight = row.getBoundingClientRect().height;
    document.body.classList.add('mfv-is-row-resizing');
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  });
}

function getExplicitColumnWidth(sheet: XLSX.WorkSheet, columnIndex: number): number | undefined {
  const width = sheet['!cols']?.[columnIndex];
  if (!width) {
    return undefined;
  }
  if (width.wpx) {
    return width.wpx;
  }
  if (width.wch) {
    return width.wch * 7 + 12;
  }
  return undefined;
}

function getExplicitRowHeight(sheet: XLSX.WorkSheet, rowIndex: number): number | undefined {
  const height = sheet['!rows']?.[rowIndex];
  if (!height) {
    return undefined;
  }
  return height.hpx ?? (height.hpt ? height.hpt * 1.33 : undefined);
}

function normalizeExcelColor(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const hex = value.length === 8 ? value.slice(2) : value;
  return /^[0-9a-f]{6}$/i.test(hex) ? `#${hex}` : undefined;
}

function mapHorizontalAlign(value: string): string {
  if (value === 'center' || value === 'right' || value === 'left') {
    return value;
  }
  return value === 'fill' || value === 'justify' ? 'justify' : 'left';
}

function mapVerticalAlign(value: string): string {
  if (value === 'center') {
    return 'middle';
  }
  if (value === 'bottom' || value === 'top') {
    return value;
  }
  return 'middle';
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (value instanceof Date) {
    return value.toLocaleString();
  }
  return String(value);
}

function getColumnName(index: number): string {
  let name = '';
  let current = index + 1;
  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - remainder) / 26);
  }
  return name;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
