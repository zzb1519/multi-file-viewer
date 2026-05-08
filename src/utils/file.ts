import type { FileKind, FileSource, LoadedFile, NormalizedFile, ViewerFile } from '../types';

export interface LoadFileOptions {
  headers?: HeadersInit;
  mode?: RequestMode;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  referrerPolicy?: ReferrerPolicy;
  withCredentials?: boolean;
}

const EXTENSION_KIND_MAP: Record<string, FileKind> = {
  pdf: 'pdf',
  doc: 'word',
  docx: 'word',
  xls: 'excel',
  xlsx: 'excel',
  xlsm: 'excel',
  csv: 'excel',
  tsv: 'excel',
  md: 'markdown',
  markdown: 'markdown',
  mdx: 'markdown',
  txt: 'text',
  log: 'text',
  html: 'html',
  htm: 'html',
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  bmp: 'image',
  tif: 'image',
  tiff: 'image',
  ico: 'image',
  mp4: 'video',
  webm: 'video',
  ogg: 'video',
  ogv: 'video',
  mov: 'video',
  m4v: 'video',
  mp3: 'audio',
  wav: 'audio',
  flac: 'audio',
  m4a: 'audio',
  aac: 'audio'
};

const CODE_EXTENSIONS = new Set([
  'js',
  'jsx',
  'ts',
  'tsx',
  'json',
  'css',
  'scss',
  'less',
  'xml',
  'yaml',
  'yml',
  'java',
  'py',
  'go',
  'rs',
  'c',
  'cpp',
  'h',
  'hpp',
  'cs',
  'php',
  'rb',
  'sh',
  'bat',
  'ps1',
  'sql',
  'vue',
  'svelte'
]);

const MIME_KIND_MAP: Record<string, FileKind> = {
  'application/pdf': 'pdf',
  'application/msword': 'word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
  'application/vnd.ms-excel': 'excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
  'text/csv': 'excel',
  'text/tab-separated-values': 'excel',
  'text/markdown': 'markdown',
  'text/plain': 'text',
  'text/html': 'html'
};

export function isFileLike(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

export function isBlobLike(value: unknown): value is Blob {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}

export function getExtension(name = ''): string {
  const clean = name.split('?')[0]?.split('#')[0] ?? '';
  const basename = clean.substring(clean.lastIndexOf('/') + 1);
  const index = basename.lastIndexOf('.');
  return index >= 0 ? basename.substring(index + 1).toLowerCase() : '';
}

export function inferKind(name?: string, mimeType?: string, explicit?: FileKind): FileKind {
  if (explicit && explicit !== 'unknown') {
    return explicit;
  }

  const normalizedMime = mimeType?.split(';')[0]?.trim().toLowerCase();
  if (normalizedMime) {
    if (MIME_KIND_MAP[normalizedMime]) {
      return MIME_KIND_MAP[normalizedMime];
    }
    if (normalizedMime.startsWith('image/')) {
      return 'image';
    }
    if (normalizedMime.startsWith('video/')) {
      return 'video';
    }
    if (normalizedMime.startsWith('audio/')) {
      return 'audio';
    }
  }

  const extension = getExtension(name);
  if (CODE_EXTENSIONS.has(extension)) {
    return 'code';
  }

  return EXTENSION_KIND_MAP[extension] ?? 'unknown';
}

export function normalizeFile(input: ViewerFile | FileSource, fallback?: { filename?: string; type?: FileKind }): NormalizedFile {
  const candidate = isViewerFile(input) ? input : { source: input };
  const source = candidate.source;
  const name = candidate.name ?? fallback?.filename ?? getSourceName(source) ?? 'preview-file';
  const mimeType = candidate.mimeType ?? getSourceMime(source);
  const extension = getExtension(name);
  const kind = inferKind(name, mimeType, candidate.type ?? fallback?.type);

  return {
    source,
    name,
    extension,
    mimeType,
    kind
  };
}

export async function loadFile(normalized: NormalizedFile, options: LoadFileOptions = {}): Promise<LoadedFile> {
  if (typeof normalized.source === 'string') {
    let response: Response;
    try {
      response = await fetch(normalized.source, {
        headers: options.headers,
        mode: options.mode,
        credentials: options.credentials ?? (options.withCredentials ? 'include' : 'same-origin'),
        cache: options.cache,
        referrerPolicy: options.referrerPolicy
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load remote file "${normalized.source}". ${message}. If this is a cross-origin URL, ensure the server allows CORS and configure requestMode/requestCredentials as needed.`);
    }

    if (!response.ok) {
      throw new Error(`Failed to load remote file "${normalized.source}": ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const mimeType = normalized.mimeType || blob.type || response.headers.get('content-type') || undefined;
    const name = normalized.name || getFilenameFromDisposition(response.headers.get('content-disposition')) || getSourceName(normalized.source) || 'preview-file';
    const arrayBuffer = await blob.arrayBuffer();
    const url = URL.createObjectURL(blob);

    return {
      ...normalized,
      name,
      mimeType,
      extension: normalized.extension || getExtension(name),
      kind: normalized.kind === 'unknown' ? inferKind(name, mimeType) : normalized.kind,
      blob,
      arrayBuffer,
      url,
      revokeUrl: true,
      text: shouldReadText(normalized.kind, name, mimeType) ? decodeText(arrayBuffer) : undefined
    };
  }

  if (isFileLike(normalized.source) || isBlobLike(normalized.source)) {
    const blob = normalized.source;
    const arrayBuffer = await blob.arrayBuffer();
    const url = URL.createObjectURL(blob);
    const mimeType = normalized.mimeType || blob.type || undefined;
    const name = normalized.name || getSourceName(blob) || 'preview-file';

    return {
      ...normalized,
      name,
      mimeType,
      extension: normalized.extension || getExtension(name),
      kind: normalized.kind === 'unknown' ? inferKind(name, mimeType) : normalized.kind,
      blob,
      arrayBuffer,
      url,
      revokeUrl: true,
      text: shouldReadText(normalized.kind, name, mimeType) ? decodeText(arrayBuffer) : undefined
    };
  }

  const arrayBuffer = normalized.source instanceof Uint8Array
    ? normalized.source.slice().buffer
    : normalized.source;
  const blob = new Blob([arrayBuffer], normalized.mimeType ? { type: normalized.mimeType } : undefined);
  const url = URL.createObjectURL(blob);

  return {
    ...normalized,
    blob,
    arrayBuffer,
    url,
    revokeUrl: true,
    text: shouldReadText(normalized.kind, normalized.name, normalized.mimeType) ? decodeText(arrayBuffer) : undefined
  };
}

export function releaseLoadedFile(file?: LoadedFile | NormalizedFile): void {
  if (file?.revokeUrl && file.url) {
    URL.revokeObjectURL(file.url);
  }
}

export function downloadUrl(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function isViewerFile(value: unknown): value is ViewerFile {
  return Boolean(value && typeof value === 'object' && 'source' in value);
}

function getSourceName(source: FileSource | Blob): string | undefined {
  if (typeof source === 'string') {
    try {
      return decodeURIComponent(source.split('?')[0]?.split('#')[0]?.split('/').pop() || '');
    } catch {
      return source.split('?')[0]?.split('#')[0]?.split('/').pop();
    }
  }

  if (isFileLike(source)) {
    return source.name;
  }

  return undefined;
}

function getSourceMime(source: FileSource): string | undefined {
  return isBlobLike(source) && source.type ? source.type : undefined;
}

function getFilenameFromDisposition(disposition: string | null): string | undefined {
  if (!disposition) {
    return undefined;
  }

  const filenameStar = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (filenameStar?.[1]) {
    return decodeURIComponent(filenameStar[1]);
  }

  const filename = /filename="?([^"]+)"?/i.exec(disposition);
  return filename?.[1];
}

function shouldReadText(kind: FileKind, name: string, mimeType?: string): boolean {
  return kind === 'markdown'
    || kind === 'code'
    || kind === 'text'
    || kind === 'html'
    || kind === 'excel' && ['csv', 'tsv'].includes(getExtension(name))
    || Boolean(mimeType?.startsWith('text/'));
}

function decodeText(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(bytes.subarray(3));
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(bytes.subarray(2));
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(bytes.subarray(2));
  }
  return new TextDecoder('utf-8').decode(bytes);
}
