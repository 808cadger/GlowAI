import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'README.md',
  'BENCHMARKS.md',
  'ROADMAP.md',
  'PRD.md',
  'LICENSE',
  'package.json',
  'netlify.toml',
  'capacitor.config.json',
  'www/index.html',
  'www/owner.html',
  'www/download.html',
  'www/manifest.json',
  'www/sw.js',
  'www/scan.bundle.js',
  'www/payments.bundle.js',
  'www/push.bundle.js',
  'www/sw-bundled.js',
  'backend/Dockerfile',
  'backend/.env.example',
  'reports/skin-eval.json',
  'reports/benchmark-summary.json',
];

const failures = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    failures.push(`missing required file: ${file}`);
  }
}

const readme = readText('README.md');
for (const marker of ['## Download Links', '<!-- INSTALL-START -->', 'https://808cadger.github.io/GlowAI/']) {
  if (!readme.includes(marker)) failures.push(`README missing marker: ${marker}`);
}

const manifest = readJson('www/manifest.json');
if (manifest.name !== 'GlowAI') failures.push('manifest name must be GlowAI');
if (manifest.display !== 'standalone') failures.push('manifest display must be standalone');
if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) failures.push('manifest must define icons');

const netlify = readText('netlify.toml');
if (!netlify.includes('publish = "www"')) failures.push('netlify.toml must publish www');
if (!netlify.includes('npm ci && npm run build')) failures.push('netlify.toml must run npm ci && npm run build');

const html = readText('www/index.html') + readText('www/owner.html');
for (const bundle of ['scan.bundle.js', 'payments.bundle.js', 'push.bundle.js']) {
  if (!html.includes(bundle)) failures.push(`HTML does not reference built bundle: ${bundle}`);
}

const evalData = readJson('reports/skin-eval.json');
if (!Array.isArray(evalData) || evalData.length === 0) {
  failures.push('reports/skin-eval.json must contain at least one eval case');
}

const benchmarkSummary = readJson('reports/benchmark-summary.json');
if ((benchmarkSummary.case_count || 0) < 50) {
  failures.push('benchmark summary must include at least 50 cases');
}
if ((benchmarkSummary.weighted_score || 0) < 0.95) {
  failures.push('benchmark weighted score must stay >= 95%');
}
if (benchmarkSummary.dataset_type !== 'synthetic_demo' && benchmarkSummary.dataset_type !== 'external_cases') {
  failures.push('benchmark summary dataset_type is invalid');
}

if (failures.length) {
  console.error('GlowAI audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('GlowAI audit passed');

function readText(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function readJson(file) {
  return JSON.parse(readText(file));
}
