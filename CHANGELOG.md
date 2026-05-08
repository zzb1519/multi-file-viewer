# Changelog

All notable changes to this project will be documented in this file.

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
