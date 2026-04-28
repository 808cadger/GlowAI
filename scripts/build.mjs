import { build } from 'esbuild';
import { spawn } from 'node:child_process';

const minify = process.argv.includes('--minify');
const target = 'es2020';
const platform = 'browser';

const bundles = [
  ['www/scan.js', 'www/scan.bundle.js'],
  ['www/payments.js', 'www/payments.bundle.js'],
  ['www/push.js', 'www/push.bundle.js'],
];

for (const [entryPoint, outfile] of bundles) {
  await build({
    entryPoints: [entryPoint],
    outfile,
    bundle: true,
    platform,
    target,
    minify,
  });
}

await run('node', ['scripts/build-sw.mjs']);

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with ${code}`));
    });
  });
}
