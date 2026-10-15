/**
 * 测试脚本：把 tests/ 下的 TypeScript 测试打成 Node 可执行文件并运行。
 * 引擎层（World / 系统 / 渲染器）完全不依赖浏览器，所以可以在这里直接跑。
 */

import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const cache = path.join(here, '.cache');
mkdirSync(cache, { recursive: true });

const outfile = path.join(cache, 'tests.mjs');
await build({
  entryPoints: [path.join(root, 'tests/index.ts')],
  outfile,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: ['node20'],
  sourcemap: false,
  logLevel: 'warning',
  banner: {
    // react-dom/server 是 CJS，内部会 require('util') 等内置模块；
    // 给它一个真实的 require，避免 esbuild 的动态 require 报错。
    js: "import { createRequire as __createRequire } from 'node:module';\nconst require = __createRequire(import.meta.url);",
  },
});

const result = spawnSync(process.execPath, [outfile], { stdio: 'inherit' });
process.exitCode = result.status ?? 1;
