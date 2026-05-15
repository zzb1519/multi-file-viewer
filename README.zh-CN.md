# multi-file-viewer

[English](./README.md) | [GitHub](https://github.com/zzb1519/multi-file-viewer)


## 特性

- 支持 React、Vue 3、原生 JS 调用。
- 框架安全的子路径入口：React 项目不需要安装/解析 Vue，Vue 项目不需要安装/解析 React。
- 内置 PDF、Excel/CSV/TSV、Word `.docx`、Markdown、代码、纯文本、HTML、图片、音视频预览。
- 工具栏使用 Lucide 图标：放大、缩小、适应宽度、旋转、重置、下载、全屏/退出全屏。打印能力保留，但默认关闭。
- 支持国际化，默认中文；可通过 `locale: 'en-US'` 切换英文，也可传对象覆盖按钮 tooltip。
- Excel 支持底部工作表切换、内容自适应列宽、自动换行、手动拖拽列宽/行高、最大行列限制。
- 支持远程链接加载配置：headers、CORS mode、credentials、cache、referrerPolicy。
- 加载或渲染失败时会展示具体错误内容。

## 安装

```bash
npm install multi-file-viewer
```

```bash
yarn add multi-file-viewer
```

## 引用路径

| 场景 | 引用路径 | 说明 |
| --- | --- | --- |
| React | `multi-file-viewer/react` | 不会导入 Vue。 |
| Vue 3 | `multi-file-viewer/vue` | 不会导入 React。 |
| 原生 JS / 核心 API | `multi-file-viewer` | 只导出核心 viewer、renderers 和类型。 |
| 样式 | `multi-file-viewer/style.css` | 在应用中导入一次。 |

不要从根入口导入 `MultiFileViewerReact` 或 `MultiFileViewerVue`。根入口现在刻意保持框架无关，避免 React 项目因为误用根入口而解析 Vue。

## TypeScript 模块解析

`multi-file-viewer` 会为 `multi-file-viewer/react` 和 `multi-file-viewer/vue` 发布子路径类型声明。`0.1.3` 起也补充了 `typesVersions` 兜底，兼容仍在使用旧版 `node` 模块解析的项目。

对于 Vite、React、Vue 等现代打包项目，仍然推荐在引用项目的 `tsconfig.json` 中使用：

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "module": "ESNext"
  }
}
```

如果项目使用 Node 风格 ESM 解析，可以使用：

```json
{
  "compilerOptions": {
    "moduleResolution": "node16",
    "module": "Node16"
  }
}
```

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
        allowManualResize: true
      }}
    />
  );
}
```

## Vue 3 使用

```vue
<template>
  <MultiFileViewerVue :options="options" />
</template>

<script setup lang="ts">
import { MultiFileViewerVue, type MultiFileViewerOptions } from 'multi-file-viewer/vue';
import 'multi-file-viewer/style.css';

const options: MultiFileViewerOptions = {
  file: { source: '/files/spec.docx', name: 'spec.docx' },
  height: 680
};
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
```

## 国际化

默认中文：

```ts
createViewer('#viewer', {
  file: '/files/report.pdf'
});
```

英文：

```ts
createViewer('#viewer', {
  file: '/files/report.pdf',
  locale: 'en-US'
});
```

自定义部分 tooltip：

```ts
createViewer('#viewer', {
  file: '/files/report.pdf',
  locale: {
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit fullscreen'
  }
});
```

也可以使用 `language: 'zh-CN' | 'en-US' | 'en'`。如果 `locale` 是字符串，它会作为语言选择；如果 `locale` 是对象，它会覆盖当前语言里的部分文案。

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
  language?: 'zh-CN' | 'en-US' | 'en';
  locale?: 'zh-CN' | 'en-US' | 'en' | ViewerLocale;
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

### ToolbarConfig

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `visible` | `boolean` | `true` | 是否显示工具栏。 |
| `zoom` | `boolean` | `true` | 是否显示放大/缩小与缩放百分比。 |
| `rotate` | `boolean` | `true` | 是否显示旋转按钮。 |
| `download` | `boolean` | `true` | 是否显示下载按钮。 |
| `print` | `boolean` | `false` | 是否显示打印按钮。 |
| `fullscreen` | `boolean` | `true` | 是否显示全屏/退出全屏按钮。 |
| `fitWidth` | `boolean` | `true` | 是否显示适应宽度按钮。 |
| `reset` | `boolean` | `true` | 是否显示重置按钮。 |

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
| `maxRows` | `number` | `10000` | 最大渲染行数。 |
| `maxColumns` | `number` | `200` | 最大渲染列数。 |
| `autoFit` | `boolean` | `true` | 是否根据内容估算列宽。 |
| `wrapText` | `boolean` | `true` | 是否自动换行。 |
| `minColumnWidth` | `number` | `72` | 最小列宽。 |
| `maxColumnWidth` | `number` | `360` | 自动列宽最大值。 |
| `rowHeight` | `number \| 'auto'` | `'auto'` | 行高。 |
| `allowManualResize` | `boolean` | `true` | 是否允许拖拽调整列宽和行高。 |

## API

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

如需开启打印：

```ts
createViewer('#viewer', {
  file: '/files/report.pdf',
  printable: true,
  toolbar: {
    print: true
  }
});
```

## 本地开发

```bash
npm install
npm run typecheck
npm run build
```
