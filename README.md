# multi-file-viewer

一个多格式文件预览 npm 库，面向 React、Vue 3 和原生 JavaScript。

## 特性

- 支持 React、Vue 3、原生 JS 调用。
- 内置 PDF、Excel、Word、Markdown、代码、纯文本、HTML、图片、音视频预览。
- 统一工具栏：放大、缩小、适应宽度、旋转、重置、打印、下载、全屏。
- Excel 支持多工作表切换、内容自适应列宽、自动换行、手动拖拽列宽、最大行列限制。
- Word 使用浏览器端 `.docx` 转 HTML；PDF 使用 pdf.js；Excel/CSV/TSV 使用 SheetJS。
- Markdown 与 Word 转换后的 HTML 会经过 DOMPurify 净化。
- 支持主题变量、className、内联样式、局部 renderer 扩展。
- 提供命令式 API：`setFile`、`setZoom`、`setSheet`、`download`、`print` 等。

## 安装

```bash
npm install multi-file-viewer
```

React 项目需要安装 React peer dependency；Vue 项目需要安装 Vue peer dependency。

## React 使用

```tsx
import { useRef } from 'react';
import { MultiFileViewerReact, type ViewerApi } from 'multi-file-viewer/react';
import 'multi-file-viewer/style.css';

export default function App() {
  const viewerRef = useRef<ViewerApi>(null);

  return (
    <MultiFileViewerReact
      ref={viewerRef}
      file={{ source: '/files/report.xlsx', name: 'report.xlsx' }}
      height={680}
      excel={{
        autoFit: true,
        wrapText: true,
        allowManualResize: true,
        maxRows: 5000
      }}
      onReady={(api) => {
        api.setZoom(1);
      }}
    />
  );
}
```

## Vue 3 使用

```vue
<template>
  <MultiFileViewerVue
    ref="viewer"
    :options="options"
    @ready="onReady"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MultiFileViewerVue, type MultiFileViewerOptions, type ViewerApi } from 'multi-file-viewer/vue';
import 'multi-file-viewer/style.css';

const viewer = ref();

const options: MultiFileViewerOptions = {
  file: { source: '/files/spec.docx', name: 'spec.docx' },
  height: 680,
  toolbar: true,
  theme: {
    primary: '#235ee8'
  }
};

function onReady(api: ViewerApi) {
  api.fitWidth();
}
</script>
```

## 原生 JS 使用

```ts
import { createViewer } from 'multi-file-viewer';
import 'multi-file-viewer/style.css';

const viewer = createViewer('#viewer', {
  file: '/files/readme.md',
  height: 640,
  toolbar: {
    download: true,
    print: true,
    fullscreen: true
  }
});

viewer.zoomIn();
```

## 支持格式

| 类型 | 扩展名 |
| --- | --- |
| PDF | `.pdf` |
| Word | `.docx`，`.doc` 会显示转换提示 |
| Excel | `.xlsx` `.xls` `.xlsm` `.csv` `.tsv` |
| Markdown | `.md` `.markdown` `.mdx` |
| 代码 | `.js` `.ts` `.tsx` `.json` `.css` `.py` `.go` `.rs` `.java` `.sql` 等 |
| 文本 | `.txt` `.log` |
| HTML | `.html` `.htm` |
| 图片 | `.jpg` `.png` `.gif` `.webp` `.svg` `.bmp` `.tiff` 等 |
| 音视频 | `.mp4` `.webm` `.mov` `.mp3` `.wav` 等 |

## 配置项

```ts
type MultiFileViewerOptions = {
  file?: ViewerFile | FileSource;
  filename?: string;
  type?: FileKind;
  width?: string | number;
  height?: string | number;
  theme?: ViewerTheme;
  toolbar?: boolean | ToolbarConfig;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  downloadable?: boolean;
  printable?: boolean;
  excel?: ExcelOptions;
  pdf?: PdfOptions;
  code?: CodeOptions;
  word?: WordOptions;
  requestHeaders?: HeadersInit;
  withCredentials?: boolean;
  renderers?: ViewerRenderer[];
  onReady?: (api: ViewerApi) => void;
  onLoad?: (state: ViewerState) => void;
  onError?: (error: Error) => void;
};
```

## Excel 配置

```ts
const options = {
  excel: {
    sheetName: 'Sheet1',
    maxRows: 10000,
    maxColumns: 200,
    autoFit: true,
    wrapText: true,
    minColumnWidth: 72,
    maxColumnWidth: 360,
    rowHeight: 'auto',
    allowManualResize: true
  }
};
```

列宽会根据单元格内容估算，中文字符按更宽的视觉长度处理。表格内容过多时可以通过 `maxRows`、`maxColumns` 做保护，用户也可以拖动表头右侧调整列宽。

## API

`createViewer`、React ref、Vue expose 都返回同一组 API。

| 方法 | 说明 |
| --- | --- |
| `setFile(file, options?)` | 切换文件 |
| `getState()` | 获取当前状态 |
| `zoomIn()` / `zoomOut()` | 放大或缩小 |
| `setZoom(zoom)` | 设置缩放比例 |
| `rotate(degrees?)` | 旋转，默认 90 度 |
| `reset()` | 重置缩放和旋转 |
| `fitWidth()` | 适应容器宽度 |
| `fullscreen(enabled?)` | 进入或退出全屏 |
| `download(filename?)` | 下载当前文件 |
| `print()` | 打印当前预览 |
| `setSheet(sheetName)` | 切换 Excel 工作表 |
| `destroy()` | 销毁实例 |

## 自定义样式

可以通过主题变量快速调整颜色。

```tsx
<MultiFileViewerReact
  file="/files/demo.pdf"
  theme={{
    background: '#f7f8fb',
    surface: '#ffffff',
    border: '#d7dce5',
    text: '#172033',
    primary: '#0f62fe'
  }}
/>
```

也可以覆盖 CSS class。

```css
.mfv-root {
  border-radius: 4px;
}

.mfv-toolbar-button {
  font-weight: 600;
}

.mfv-excel-cell {
  font-size: 12px;
}
```

## 自定义 Renderer

```ts
import type { ViewerRenderer } from 'multi-file-viewer';

const jsonRenderer: ViewerRenderer = {
  kind: 'code',
  render(container, { file }) {
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(JSON.parse(file.text || '{}'), null, 2);
    container.appendChild(pre);
  }
};

createViewer('#viewer', {
  file: '/data/config.json',
  renderers: [jsonRenderer]
});
```

自定义 renderer 会优先于内置 renderer 匹配。

## 注意事项

- `.doc` 是旧版二进制格式，浏览器端无法可靠解析，本库建议转换成 `.docx`、PDF 或服务端生成 HTML。
- PDF worker 默认使用与 `pdfjs-dist` 版本匹配的 jsDelivr 地址。离线环境可以在业务侧预先配置 `pdfjs-dist` worker，或在后续版本中扩展 worker 配置项。
- 超大 Excel 建议配置 `maxRows`、`maxColumns` 或在服务端做分页/切片。

## 本地开发

```bash
npm install
npm run typecheck
npm run build
```
