# multi-file-viewer

[中文文档](./README.zh-CN.md) | [GitHub](https://github.com/zzb1519/multi-file-viewer)


## Features

- React, Vue 3, and vanilla JavaScript adapters.
- Framework-safe entry points: React projects do not need Vue, and Vue projects do not need React.
- Native PDF, Excel/CSV/TSV, Word `.docx`, Markdown, code, text, HTML, image, video, and audio preview.
- Toolbar with Lucide icons: zoom, fit width, rotate, reset, download, fullscreen, and exit fullscreen. Print is available but disabled by default.
- Internationalization support. The default UI language is Chinese; English can be enabled with `locale: 'en-US'`.
- Excel-like preview with bottom sheet tabs, sticky headers, auto-fit columns, wrapped text, manual column width resizing, manual row height resizing, and partial cell style mapping.
- Remote URL loading options for headers, CORS mode, credentials, cache, referrer policy, and cross-origin behavior.
- Detailed inline error output when file loading or rendering fails.
- Custom theme, CSS overrides, and custom renderer extension.

## Installation

```bash
npm install multi-file-viewer
```

```bash
yarn add multi-file-viewer
```

## Import Paths

Use the framework-specific subpath in framework projects.

| Use case | Import path | Notes |
| --- | --- | --- |
| React | `multi-file-viewer/react` | Does not import Vue. |
| Vue 3 | `multi-file-viewer/vue` | Does not import React. |
| Vanilla/core API | `multi-file-viewer` | Exports only the core viewer, renderers, and types. |
| Styles | `multi-file-viewer/style.css` | Import once in your app. |

Do not import `MultiFileViewerReact` or `MultiFileViewerVue` from the root package. The root package is intentionally framework-neutral.

## React Usage

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
      locale="en-US"
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

## Vue 3 Usage

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
  locale: 'en-US'
};

function onReady(api: ViewerApi) {
  api.fitWidth();
}
</script>
```

## Vanilla JavaScript Usage

```ts
import { createViewer } from 'multi-file-viewer';
import 'multi-file-viewer/style.css';

const viewer = createViewer('#viewer', {
  file: '/files/readme.md',
  height: 640,
  locale: 'en-US'
});

viewer.zoomIn();
```

## Internationalization

The default UI language is Chinese.

```ts
createViewer('#viewer', {
  file: '/files/report.pdf'
});
```

Use English:

```ts
createViewer('#viewer', {
  file: '/files/report.pdf',
  locale: 'en-US'
});
```

Override selected labels:

```ts
createViewer('#viewer', {
  file: '/files/report.pdf',
  locale: {
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    fullscreen: 'Enter fullscreen',
    exitFullscreen: 'Exit fullscreen'
  }
});
```

You can also use `language: 'en-US'` or `language: 'zh-CN'`. If both `language` and `locale` are provided, string `locale` wins as a language selector, while object `locale` is merged into the selected language.

## Remote URLs and CORS

When `file` is a remote URL, the library loads it with `fetch`. Cross-origin preview only works if the file server returns proper CORS headers such as `Access-Control-Allow-Origin`.

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

## Supported Formats

| Type | Extensions |
| --- | --- |
| PDF | `.pdf` |
| Word | `.docx`; `.doc` shows a conversion notice |
| Excel | `.xlsx` `.xls` `.xlsm` `.csv` `.tsv` |
| Markdown | `.md` `.markdown` `.mdx` |
| Code | `.js` `.jsx` `.ts` `.tsx` `.json` `.css` `.py` `.go` `.rs` `.java` `.sql` and more |
| Text | `.txt` `.log` |
| HTML | `.html` `.htm` |
| Images | `.jpg` `.png` `.gif` `.webp` `.svg` `.bmp` `.tiff` and more |
| Media | `.mp4` `.webm` `.mov` `.mp3` `.wav` and more |

## Options

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

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `visible` | `boolean` | `true` | Show or hide the toolbar. |
| `zoom` | `boolean` | `true` | Show zoom controls and zoom percentage. |
| `rotate` | `boolean` | `true` | Show rotate button. |
| `download` | `boolean` | `true` | Show download button. |
| `print` | `boolean` | `false` | Show print button. |
| `fullscreen` | `boolean` | `true` | Show fullscreen/exit fullscreen button. |
| `fitWidth` | `boolean` | `true` | Show fit-width button. |
| `reset` | `boolean` | `true` | Show reset button. |

### ExcelOptions

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `sheetName` | `string` | first sheet | Initial sheet name. |
| `maxRows` | `number` | `10000` | Maximum rendered row count. |
| `maxColumns` | `number` | `200` | Maximum rendered column count. |
| `autoFit` | `boolean` | `true` | Estimate column width from content. |
| `wrapText` | `boolean` | `true` | Wrap cell text. |
| `minColumnWidth` | `number` | `72` | Minimum column width. |
| `maxColumnWidth` | `number` | `360` | Maximum auto-fit column width. |
| `rowHeight` | `number \| 'auto'` | `'auto'` | Fixed or auto-estimated row height. |
| `allowManualResize` | `boolean` | `true` | Allow manual column and row resizing. |

### Other Compound Options

The package also exposes `ViewerFile`, `ViewerTheme`, `ViewerLocale`, `PdfOptions`, `CodeOptions`, `WordOptions`, `ViewerRenderer`, and `RendererContext` as TypeScript types. See [README.zh-CN.md](./README.zh-CN.md) for the full detailed table, or use editor IntelliSense from the exported declarations.

## API

| Method | Description |
| --- | --- |
| `setFile(file, options?)` | Replace the current file. |
| `getState()` | Get viewer state. |
| `zoomIn()` / `zoomOut()` | Zoom in or out. |
| `setZoom(zoom)` | Set zoom ratio. |
| `rotate(degrees?)` | Rotate content, default `90`. |
| `reset()` | Reset zoom and rotation. |
| `fitWidth()` | Fit content width to the viewport. |
| `fullscreen(enabled?)` | Enter or exit fullscreen. |
| `download(filename?)` | Download the current file. |
| `print()` | Print current preview. |
| `setSheet(sheetName)` | Switch Excel sheet. |
| `destroy()` | Destroy viewer instance. |

To enable printing:

```ts
createViewer('#viewer', {
  file: '/files/report.pdf',
  printable: true,
  toolbar: {
    print: true
  }
});
```

## Notes

- Legacy `.doc` files are not parsed in-browser. Convert them to `.docx`, PDF, or a server-generated preview.
- Remote URL preview requires server-side CORS support.
- Very large Excel files should use `maxRows`, `maxColumns`, or server-side pagination/chunking.

## Development

```bash
npm install
npm run typecheck
npm run build
```
