import * as XLSX from 'xlsx';
import { createElement } from '../utils/dom';
import type { ViewerRenderer } from '../types';

interface SheetView {
  name: string;
  rows: unknown[][];
  columnWidths: number[];
}

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

function readWorkbook(file: Parameters<ViewerRenderer['render']>[1]['file']): XLSX.WorkBook {
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
    cellText: false
  });
}

function renderWorkbook(
  container: HTMLElement,
  context: Parameters<ViewerRenderer['render']>[1],
  workbook: XLSX.WorkBook,
  activeSheet: string
): void {
  const shell = createElement('div', { className: 'mfv-excel' });
  const tabs = createElement('div', { className: 'mfv-sheet-tabs' });

  workbook.SheetNames.forEach((sheetName) => {
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

  const scroller = createElement('div', { className: 'mfv-excel-scroller' });
  const sheetView = buildSheetView(workbook.Sheets[activeSheet], context);
  const table = renderSheetTable(sheetView, context);
  table.style.fontSize = `${13 * context.state.zoom}px`;
  table.style.transform = `rotate(${context.state.rotate}deg)`;
  scroller.appendChild(table);
  shell.append(tabs, scroller);
  container.appendChild(shell);
}

function buildSheetView(sheet: XLSX.WorkSheet, context: Parameters<ViewerRenderer['render']>[1]): SheetView {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: false,
    defval: ''
  });
  const maxRows = context.options.excel.maxRows;
  const maxColumns = context.options.excel.maxColumns;
  const clippedRows = rows.slice(0, maxRows).map((row) => row.slice(0, maxColumns));
  const columnCount = Math.max(1, ...clippedRows.map((row) => row.length));
  const columnWidths = Array.from({ length: columnCount }, (_, columnIndex) => {
    const explicitWidth = getExplicitColumnWidth(sheet, columnIndex);
    if (explicitWidth) {
      return explicitWidth * context.state.zoom;
    }

    if (!context.options.excel.autoFit) {
      return 120 * context.state.zoom;
    }

    let maxLength = 8;
    clippedRows.forEach((row) => {
      const value = formatCellValue(row[columnIndex]);
      const visualLength = Array.from(value).reduce((sum, char) => sum + (char.charCodeAt(0) > 255 ? 2 : 1), 0);
      maxLength = Math.max(maxLength, Math.min(80, visualLength));
    });

    return clamp(maxLength * 8 + 28, context.options.excel.minColumnWidth, context.options.excel.maxColumnWidth) * context.state.zoom;
  });

  return {
    name: sheet['!ref'] ?? '',
    rows: clippedRows,
    columnWidths
  };
}

function renderSheetTable(sheet: SheetView, context: Parameters<ViewerRenderer['render']>[1]): HTMLTableElement {
  const table = createElement('table', { className: 'mfv-excel-table' });
  const colgroup = createElement('colgroup');
  sheet.columnWidths.forEach((width) => {
    colgroup.appendChild(createElement('col', { styles: { width } }));
  });
  table.appendChild(colgroup);

  const thead = createElement('thead');
  const headerRow = createElement('tr');
  headerRow.appendChild(createElement('th', { className: 'mfv-excel-corner' }));
  sheet.columnWidths.forEach((_, index) => {
    const cell = createElement('th', { className: 'mfv-excel-column-header', text: getColumnName(index) });
    if (context.options.excel.allowManualResize) {
      const handle = createElement('span', { className: 'mfv-excel-resize-handle' });
      attachColumnResize(handle, table, index, context);
      cell.appendChild(handle);
    }
    headerRow.appendChild(cell);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = createElement('tbody');
  sheet.rows.forEach((row, rowIndex) => {
    const tr = createElement('tr');
    if (context.options.excel.rowHeight !== 'auto') {
      tr.style.height = `${context.options.excel.rowHeight * context.state.zoom}px`;
    }
    tr.appendChild(createElement('th', { className: 'mfv-excel-row-header', text: String(rowIndex + 1) }));
    for (let columnIndex = 0; columnIndex < sheet.columnWidths.length; columnIndex += 1) {
      tr.appendChild(createElement('td', {
        className: context.options.excel.wrapText ? 'mfv-excel-cell is-wrapped' : 'mfv-excel-cell',
        text: formatCellValue(row[columnIndex])
      }));
    }
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  return table;
}

function attachColumnResize(
  handle: HTMLElement,
  table: HTMLTableElement,
  columnIndex: number,
  context: Parameters<ViewerRenderer['render']>[1]
): void {
  let startX = 0;
  let startWidth = 0;

  const onMove = (event: PointerEvent) => {
    const nextWidth = clamp(startWidth + event.clientX - startX, context.options.excel.minColumnWidth, context.options.excel.maxColumnWidth * 2);
    const column = table.querySelectorAll('col')[columnIndex] as HTMLTableColElement | undefined;
    if (column) {
      column.style.width = `${nextWidth}px`;
    }
  };

  const onUp = () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    document.body.classList.remove('mfv-is-resizing');
  };

  handle.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    startX = event.clientX;
    const column = table.querySelectorAll('col')[columnIndex] as HTMLTableColElement | undefined;
    startWidth = column?.getBoundingClientRect().width ?? 120;
    document.body.classList.add('mfv-is-resizing');
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
    return width.wch * 8 + 24;
  }
  return undefined;
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
