/**
 * 界面层 · 操作说明。
 */

const CONTROLS: ReadonlyArray<readonly [string, string]> = [
  ['← → / A D', '左右走动'],
  ['空格 / ↑', '跳跃（空中可再跳一次）'],
  ['J / Z / 鼠标左键', '挥剑斩击（三段连击）'],
  ['K / 1', '旋风斩：原地转一圈砍周围'],
  ['L / 2', '影袭冲刺：冲刺期间不会被打到'],
  ['H / 3', '生命回复'],
  ['P / Esc', '暂停 / 继续'],
  ['M', '音效开关'],
];

export function ControlsHelp() {
  return (
    <div className="controls">
      <div className="controls-title">操作</div>
      <ul>
        {CONTROLS.map(([keys, desc]) => (
          <li key={keys}>
            <kbd>{keys}</kbd>
            <span>{desc}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
