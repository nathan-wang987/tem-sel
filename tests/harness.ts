/**
 * 极简测试框架（不引入任何依赖）。
 */

type TestFn = () => void | Promise<void>;

interface TestCase {
  name: string;
  fn: TestFn;
}

const cases: TestCase[] = [];

export function test(name: string, fn: TestFn): void {
  cases.push({ name, fn });
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}（实际 ${String(actual)}，期望 ${String(expected)}）`);
  }
}

export function assertClose(actual: number, expected: number, tolerance: number, message: string): void {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${message}（实际 ${actual}，期望 ${expected} ±${tolerance}）`);
  }
}

export async function run(): Promise<void> {
  let passed = 0;
  const failures: Array<{ name: string; error: unknown }> = [];
  for (const item of cases) {
    try {
      await item.fn();
      passed++;
      console.log(`  ✓ ${item.name}`);
    } catch (error) {
      failures.push({ name: item.name, error });
      console.log(`  ✗ ${item.name}`);
    }
  }
  console.log('');
  if (failures.length === 0) {
    console.log(`全部通过：${passed} 项`);
    return;
  }
  console.log(`通过 ${passed} 项，失败 ${failures.length} 项：`);
  for (const failure of failures) {
    console.log(`\n[${failure.name}]`);
    console.log(failure.error instanceof Error ? failure.error.stack ?? failure.error.message : String(failure.error));
  }
  process.exitCode = 1;
}
