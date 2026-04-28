import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { build } from 'esbuild';

const wwwRoot = 'www';
const bundledWorker = 'www/sw-bundled.js';
const finalWorker = 'www/sw.js';
const allowed = new Set(['.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.wasm', '.tflite', '.binarypb', '.data']);
const ignored = new Set(['sw-source.js', 'sw-bundled.js', 'sw.js']);

await build({
  entryPoints: ['www/sw-source.js'],
  outfile: bundledWorker,
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  minify: true,
});

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(path));
      continue;
    }
    const rel = relative(wwwRoot, path).replaceAll('\\', '/');
    const dot = entry.name.includes('.') ? entry.name.slice(entry.name.lastIndexOf('.')).toLowerCase() : '';
    if (!ignored.has(rel) && allowed.has(dot)) files.push(path);
  }
  return files;
}

const files = await listFiles(wwwRoot);
const manifest = [];
let size = 0;
for (const file of files) {
  const data = await readFile(file);
  size += data.byteLength;
  manifest.push({
    revision: createHash('md5').update(data).digest('hex'),
    url: relative(wwwRoot, file).replaceAll('\\', '/'),
  });
}

const bundled = await readFile(bundledWorker, 'utf8');
await writeFile(finalWorker, bundled.replace('self.__WB_MANIFEST', JSON.stringify(manifest)));
console.log(`Workbox precached ${manifest.length} files (${size} bytes).`);
