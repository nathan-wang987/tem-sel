/**
 * 构建脚本：把 TypeScript + React 打包成 dist/game.js 与 dist/game.css。
 *
 * 用法：
 *   node tools/build.mjs              一次性构建
 *   node tools/build.mjs --watch      监听改动自动重建
 *   node tools/build.mjs --serve      构建后启动本地静态服务器
 *   node tools/build.mjs --watch --serve
 */

import { build, context } from 'esbuild';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outdir = path.join(root, 'dist');

const options = {
  entryPoints: [path.join(root, 'src/ui/main.tsx')],
  outfile: path.join(outdir, 'game.js'),
  bundle: true,
  format: 'iife',
  target: ['chrome100', 'firefox100', 'safari15'],
  platform: 'browser',
  jsx: 'automatic',
  // 保留中文原文（不转义成 \uXXXX），方便直接阅读构建产物
  charset: 'utf8',
  minify: false,
  sourcemap: false,
  legalComments: 'none',
  logLevel: 'info',
  define: {
    'process.env.NODE_ENV': '"production"',
  },
};

const watch = process.argv.includes('--watch');
const serve = process.argv.includes('--serve');

mkdirSync(outdir, { recursive: true });

if (watch) {
  const ctx = await context(options);
  await ctx.watch();
  console.log('[build] 监听中… 修改 src/ 下的文件会自动重新构建');
} else {
  await build(options);
  console.log('[build] 已生成 dist/game.js 与 dist/game.css');
}

if (serve) {
  await startServer({ root, port: Number(process.env.PORT ?? 5173) });
}
