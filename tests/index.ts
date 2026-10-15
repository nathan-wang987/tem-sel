/**
 * 测试入口：运行全部用例（需求逐条验证 + 渲染出图）。
 */

import { run } from './harness';

console.log('像素守卫 · 引擎与渲染测试\n');

await import('./engine.spec');
await import('./session.spec');
await import('./render.spec');
await import('./ui.spec');

await run();
