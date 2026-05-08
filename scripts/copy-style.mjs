import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const from = resolve('src/style.css');
const to = resolve('dist/style.css');

await mkdir(dirname(to), { recursive: true });
await copyFile(from, to);
