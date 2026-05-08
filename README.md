# multi-file-viewer

一个自研的多格式文件预览 npm 库，面向 React、Vue 3 和原生 JavaScript。项目参考了 `jit-viewer` 与 `react-doc-viewer` 的产品能力边界，但预览内核由本库自己实现。

## 特性

- 支持 React、Vue 3、原生 JS 调用。
- 内置 PDF、Excel、Word、Markdown、代码、纯文本、HTML、图片、音视频预览。
- 统一中文工具栏：图标按钮、放大、缩小、适应宽度、旋转、重置、打印、下载、全屏/退出全屏。
- Excel 支持底部工作表切换、内容自适应列宽、自动换行、手动拖拽列宽/行高、最大行列限制。
- Word 使用浏览器端 `.docx` 转 HTML；PDF 使用 pdf.js；Excel/CSV/TSV 使用 SheetJS。
- Markdown 与 Word 转换后的 HTML 会经过 DOMPurify 净化。
- 支持远程链接加载配置：headers、CORS mode、credentials、cache、referrerPolicy。
- 加载或渲染失败时会展示具体错误内容，便于排查文件地址、CORS、格式或解析问题。
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
  toolbar: true
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
  height: 640
});

viewer.zoomIn();
```

## 远程链接与跨域

如果 `file` 是远程 URL，本库会使用 `fetch` 拉取文件。跨域能否成功最终取决于文件服务器是否返回正确的 CORS 响应头，例如 `Access-Control-Allow-Origin`。

```ts
createViewer('#viewer', {
  file: {
    source: 'https://example.com/files/report.pdf',
    name: 'report.pdf'
  },
  requestMode: 'cors',
  requestCredentials: 'include',
  requestHeaders: {
    Authorization: 'Bearer token'
  },
  referrerPolicy: 'strict-origin-when-cross-origin'
});
```

常见配置：

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `requestHeaders` | `HeadersInit` | `{}` | 请求远程文件时附加的 headers。 |
| `requestMode` | `RequestMode` | `'cors'` | fetch mode，可设为 `'cors'`、`'same-origin'`、`'no-cors'`。预览文件通常不要用 `'no-cors'`，否则响应不可读。 |
| `requestCredentials` | `RequestCredentials` | `'same-origin'` 或 `'include'` | fetch credentials。需要 cookie 鉴权时设为 `'include'`。 |
| `requestCache` | `RequestCache` | `'default'` | fetch cache 策略。 |
| `referrerPolicy` | `ReferrerPolicy` | `'strict-origin-when-cross-origin'` | 远程请求 referrer 策略。 |
| `crossOrigin` | `'anonymous' \| 'use-credentials'` | `'anonymous'` | 便捷选项，`'use-credentials'` 会让默认 credentials 变为 `'include'`。 |
| `withCredentials` | `boolean` | `false` | 兼容旧配置，设为 `true` 时默认使用 `credentials: 'include'`。 |

加载失败或渲染失败时，组件会在预览区域显示错误信息和 stack，便于直接看到 CORS、HTTP 状态码、格式解析等问题。

## 支持格式

| 类型 | 扩展名 |
| --- | --- |
| PDF | `.pdf` |
| Word | `.docx`，`.doc` 会显示转换提示 |
| Excel | `.xlsx` `.xls` `.xlsm` `.csv` `.tsv` |
| Markdown | `.md` `.markdown` `.mdx` |
| 代码 | `.js` `.jsx` `.ts` `.tsx` `.json` `.css` `.py` `.go` `.rs` `.java` `.sql` 等 |
| 文本 | `.txt` `.log` |
| HTML | `.html` `.htm` |
| 图片 | `.jpg` `.png` `.gif` `.webp` `.svg` `.bmp` `.tiff` 等 |
| 音视频 | `.mp4` `.webm` `.mov` `.mp3` `.wav` 等 |

## 配置总览

```ts
type MultiFileViewerOptions = {
  file?: ViewerFile | FileSource;
  filename?: string;
  type?: FileKind;
  className?: string;
  style?: Record<string, string | number>;
  width?: string | number;
  height?: string | number;
  theme?: ViewerTheme;
  toolbar?: boolean | ToolbarConfig;
  locale?: ViewerLocale;
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
  requestMode?: RequestMode;
  requestCredentials?: RequestCredentials;
  requestCache?: RequestCache;
  referrerPolicy?: ReferrerPolicy;
  crossOrigin?: 'anonymous' | 'use-credentials';
  withCredentials?: boolean;
  renderers?: ViewerRenderer[];
  onReady?: (api: ViewerApi) => void;
  onLoad?: (state: ViewerState) => void;
  onError?: (error: Error) => void;
  onZoomChange?: (zoom: number) => void;
  onRotateChange?: (rotate: number) => void;
  onSheetChange?: (sheetName: string) => void;
};
```

## 复合类型参数

### ViewerFile

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `source` | `FileSource` | 必填 | 文件来源，支持 URL、`File`、`Blob`、`ArrayBuffer`、`Uint8Array`。 |
| `name` | `string` | 自动推断 | 展示名和下载名。URL 文件建议显式传入。 |
| `type` | `FileKind` | 自动推断 | 文件类型，自动识别不准时可手动指定。 |
| `mimeType` | `string` | 自动推断 | MIME 类型。 |

### ToolbarConfig

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `visible` | `boolean` | `true` | 是否显示工具栏。 |
| `zoom` | `boolean` | `true` | 是否显示放大/缩小与缩放百分比。 |
| `rotate` | `boolean` | `true` | 是否显示旋转按钮。 |
| `download` | `boolean` | `true` | 是否显示下载按钮。 |
| `print` | `boolean` | `true` | 是否显示打印按钮。 |
| `fullscreen` | `boolean` | `true` | 是否显示全屏/退出全屏按钮。 |
| `fitWidth` | `boolean` | `true` | 是否显示适应宽度按钮。 |
| `reset` | `boolean` | `true` | 是否显示重置按钮。 |

### ViewerTheme

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `background` | `string` | `#f6f7f9` | 预览区域背景色。 |
| `surface` | `string` | `#ffffff` | 文档面板背景色。 |
| `border` | `string` | `#dfe3ea` | 边框颜色。 |
| `text` | `string` | `#172033` | 主文本颜色。 |
| `mutedText` | `string` | `#687386` | 次级文本颜色。 |
| `primary` | `string` | `#235ee8` | 主色。 |
| `toolbarBackground` | `string` | `#ffffff` | 工具栏背景色。 |
| `toolbarText` | `string` | `#172033` | 工具栏文字/图标颜色。 |
| `accent` | `string` | `#eef3ff` | 按钮 hover 等强调色。 |

### ViewerLocale

| 参数 | 默认中文 | 说明 |
| --- | --- | --- |
| `loading` | `正在加载预览...` | 加载提示。 |
| `unsupported` | `暂不支持预览该文件类型。` | 不支持格式提示。 |
| `zoomIn` | `放大` | 放大按钮 tooltip。 |
| `zoomOut` | `缩小` | 缩小按钮 tooltip。 |
| `rotate` | `旋转` | 旋转按钮 tooltip。 |
| `download` | `下载` | 下载按钮 tooltip。 |
| `print` | `打印` | 打印按钮 tooltip。 |
| `fullscreen` | `全屏` | 进入全屏 tooltip。 |
| `exitFullscreen` | `退出全屏` | 退出全屏 tooltip。 |
| `fitWidth` | `适应宽度` | 适应宽度按钮 tooltip。 |
| `reset` | `重置` | 重置按钮 tooltip。 |
| `sheet` | `工作表` | Excel sheet 标签 title 前缀。 |
| `page` | `页` | 页码文案。 |
| `error` | `预览失败` | 错误标题。 |

### ExcelOptions

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `sheetName` | `string` | 第一个 sheet | 初始显示的工作表名称。 |
| `maxRows` | `number` | `10000` | 最大渲染行数，避免超大表格卡顿。 |
| `maxColumns` | `number` | `200` | 最大渲染列数。 |
| `autoFit` | `boolean` | `true` | 是否根据内容估算列宽。 |
| `wrapText` | `boolean` | `true` | 是否自动换行。 |
| `minColumnWidth` | `number` | `72` | 自动列宽和拖拽列宽的最小值。 |
| `maxColumnWidth` | `number` | `360` | 自动列宽最大值；手动拖拽最大值为该值的 2 倍。 |
| `rowHeight` | `number \| 'auto'` | `'auto'` | 行高，`auto` 会根据文本长度估算。 |
| `allowManualResize` | `boolean` | `true` | 是否允许拖拽调整列宽和行高。 |

### PdfOptions

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `pageGap` | `number` | `16` | PDF 页面之间的间距。 |
| `renderTextLayer` | `boolean` | `false` | 预留选项，后续可用于 PDF 文本层。 |

### CodeOptions

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `language` | `string` | 根据扩展名推断 | Prism 语言名，例如 `tsx`、`typescript`、`json`。 |
| `showLineNumbers` | `boolean` | `true` | 是否显示行号。 |

### WordOptions

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `includeDefaultStyleMap` | `boolean` | `true` | 传给 mammoth，用于控制 `.docx` 默认样式映射。 |

### ViewerRenderer

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `kind` | `FileKind \| FileKind[]` | renderer 匹配的文件类型。 |
| `render` | `(container, context) => void \| Promise<void>` | 渲染函数。 |
| `destroy` | `() => void` | 可选清理函数。 |

### RendererContext

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `file` | `LoadedFile` | 已加载并规范化后的文件。 |
| `state` | `ViewerState` | 当前缩放、旋转、sheet 等状态。 |
| `options` | `RequiredViewerOptions` | 合并默认值后的配置。 |
| `setState` | `(patch) => void` | 更新内部状态。 |
| `setSheet` | `(sheetName) => void` | 切换 Excel 工作表。 |

## API

`createViewer`、React ref、Vue expose 都返回同一组 API。

| 方法 | 说明 |
| --- | --- |
| `setFile(file, options?)` | 切换文件。 |
| `getState()` | 获取当前状态。 |
| `zoomIn()` / `zoomOut()` | 放大或缩小。 |
| `setZoom(zoom)` | 设置缩放比例。 |
| `rotate(degrees?)` | 旋转，默认 90 度。 |
| `reset()` | 重置缩放和旋转。 |
| `fitWidth()` | 适应容器宽度。 |
| `fullscreen(enabled?)` | 进入或退出全屏。 |
| `download(filename?)` | 下载当前文件。 |
| `print()` | 打印当前预览。 |
| `setSheet(sheetName)` | 切换 Excel 工作表。 |
| `destroy()` | 销毁实例。 |

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
- 远程文件跨域预览必须由文件服务器允许 CORS；前端配置无法绕过服务端 CORS 策略。
- 超大 Excel 建议配置 `maxRows`、`maxColumns` 或在服务端做分页/切片。

## 本地开发

```bash
npm install
npm run typecheck
npm run build
```
