# 更新日志

本文档记录该项目的重要变更。

## 0.1.4 - 2026-05-19

### 新增

- 新增 `layout.fit` 布局策略，支持 `natural`、`width`、`contain`。
- 新增 `layout.documentMaxWidth` 与 `layout.contentPadding`，可控制文档最大阅读宽度和文件显示区内边距。
- 新增响应式工具栏收纳能力，宽度不足时会把剩余按钮放入“更多操作”菜单。

### 修复

- 修复 `.ts`、`.tsx`、`.mts`、`.cts`、`.mjs`、`.cjs` 文件可能被服务端 MIME 类型误判为音视频的问题，现在会优先根据明确文件后缀识别为代码文件。

## 0.1.3 - 2026-05-15

### 变更

- 为 `multi-file-viewer/react`、`multi-file-viewer/vue` 和 `multi-file-viewer/style.css` 增加 `typesVersions` 兜底映射。
- 提升仍使用旧版 TypeScript `moduleResolution` 配置项目的类型解析兼容性。
- 在英文和中文 README 中补充推荐的 TypeScript 模块解析配置。

## 0.1.2 - 2026-05-15

### 变更

- 默认关闭打印工具栏按钮。
- 将 `printable` 默认值设为 `false`，如需打印需显式设置 `printable: true` 和 `toolbar.print: true`。
- 在 README 和 README.zh-CN 中补充打印开启示例。

## 0.1.1 - 2026-05-15

### 新增

- 新增国际化能力，支持 `language` 和 `locale`。
- 新增 `zh-CN`、`en-US`、`en` 内置语言。
- 新增框架专用导入路径说明，避免 React 项目解析 Vue，或 Vue 项目解析 React。

### 变更

- 根入口保持框架无关。React 组件需从 `multi-file-viewer/react` 导入，Vue 组件需从 `multi-file-viewer/vue` 导入，原生/核心 API 从 `multi-file-viewer` 导入。
- 增加 GitHub 仓库元信息：`https://github.com/zzb1519/multi-file-viewer`。
- 文档调整为默认英文 README，并增加独立中文 README。
- 增加 npm 和 yarn 安装示例。

## 0.1.0 - 2026-05-08

### 新增

- 初始化 npm 库结构，输出 ESM、CJS、CSS 和 TypeScript 声明文件。
- 支持 React、Vue 3 和原生 JavaScript 适配器。
- 内置 PDF、Excel/CSV/TSV、Word `.docx`、Markdown、代码、纯文本、HTML、图片、视频、音频渲染器。
- 基于 Lucide 图标的中文工具栏，支持缩放、适应宽度、旋转、重置、打印、下载、全屏和退出全屏。
- 提供设置文件、缩放、旋转、适应宽度、全屏、下载、打印、切换 sheet、销毁 viewer 的运行时 API。
- Excel 风格预览，支持底部 sheet 标签、冻结行列头、自适应列宽、自动换行、拖拽列宽/行高和部分单元格样式映射。
- 使用 Prism 进行代码高亮，并提供稳定左侧行号。
- 对 Markdown 和 Word 生成的 HTML 进行 DOMPurify 清理。
- 支持远程文件加载配置，包括 headers、CORS mode、credentials、cache、referrerPolicy 和跨域行为。
- 加载或渲染失败时展示详细错误内容。
- README 覆盖复合配置类型和 API 方法。

### 说明

- 浏览器内暂不解析旧版 `.doc` 文件，建议转换为 `.docx`、PDF 或服务端生成的预览格式。
- 远程 URL 预览仍要求文件服务端允许 CORS。
