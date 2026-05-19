# Changelog

All notable changes to this project will be documented in this file.

## 0.1.5 - 2026-05-19

### Fixed

- Stabilized the toolbar title area so narrow toolbars no longer push or cover the file name.
- Added native title tooltip support for long file names in the toolbar.
- Adjusted Excel preview sizing so internal scrollbars no longer consume table width or height.
- Let Excel use the outer viewport for natural-size overflow while keeping hidden internal scrollbars for sticky headers.

## 0.1.4 - 2026-05-19

### Added

- Added `layout.fit` with `natural`, `width`, and `contain` strategies.
- Added `layout.documentMaxWidth` and `layout.contentPadding` for document width and preview padding control.
- Added responsive toolbar overflow handling. Extra toolbar actions collapse into a more menu when the toolbar is too narrow.

### Fixed

- Fixed `.ts`, `.tsx`, `.mts`, `.cts`, `.mjs`, and `.cjs` file detection so code files are not misclassified by server MIME types such as media content types.

## 0.1.3 - 2026-05-15

### Changed

- Added `typesVersions` fallbacks for `multi-file-viewer/react`, `multi-file-viewer/vue`, and `multi-file-viewer/style.css`.
- Improved compatibility for projects still using older TypeScript `moduleResolution` settings.
- Documented recommended TypeScript module resolution settings in English and Chinese READMEs.

## 0.1.2 - 2026-05-15

### Changed

- Disabled the print toolbar button by default.
- Set `printable` default to `false`; enable printing explicitly with `printable: true` and `toolbar.print: true`.
- Updated README and README.zh-CN with print enablement examples.
- Made the root entry framework-neutral. React components must be imported from `multi-file-viewer/react`, Vue components from `multi-file-viewer/vue`, and vanilla/core APIs from `multi-file-viewer`.
- Added package metadata for the GitHub repository: `https://github.com/zzb1519/multi-file-viewer`.
- Reworked documentation with an English default README and a separate Chinese README.
- Added npm and yarn installation examples.

### Added

- Added internationalization support through `language` and `locale`.
- Added built-in locale presets for `zh-CN`, `en-US`, and `en`.
- Added documentation for framework-specific import paths to avoid React projects resolving Vue and Vue projects resolving React.

## 0.1.0 - 2026-05-08

### Added

- Initial npm library structure with ESM, CJS, CSS, and TypeScript declaration outputs.
- Framework adapters for React, Vue 3, and vanilla JavaScript.
- Native renderers for PDF, Excel/CSV/TSV, Word `.docx`, Markdown, code, text, HTML, images, video, and audio.
- Chinese icon toolbar powered by Lucide icons, including zoom, fit width, rotate, reset, print, download, fullscreen, and exit fullscreen.
- Runtime API for setting files, zooming, rotating, fitting width, fullscreen, downloading, printing, sheet switching, and destroying the viewer.
- Excel-like preview with bottom sheet tabs, sticky row/column headers, autofit columns, wrapped text, manual column width resizing, manual row height resizing, and partial cell style mapping.
- Code highlighting with Prism and stable left-aligned line numbers for JSX/TSX and other code files.
- DOMPurify sanitization for Markdown and Word-generated HTML.
- Remote file loading options for headers, CORS mode, credentials, cache, referrer policy, and cross-origin behavior.
- Inline error display with detailed message/stack output when file loading or rendering fails.
- Detailed README documentation covering all compound option types and API methods.

### Notes

- Legacy `.doc` files are not parsed in-browser; convert to `.docx`, PDF, or a server-generated preview format.
- Remote URL preview still requires the file server to allow CORS.
