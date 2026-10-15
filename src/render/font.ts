/**
 * 渲染层 · 4x6 像素字体。
 * 只包含战斗飘字需要的字符（数字与几个符号），直接画在低分辨率画布上，
 * 保证和像素画面同一种颗粒度。
 */

const GLYPHS: Record<string, readonly string[]> = {
  '0': ['.##.', '#..#', '#..#', '#..#', '#..#', '.##.'],
  '1': ['..#.', '.##.', '..#.', '..#.', '..#.', '.###'],
  '2': ['.##.', '#..#', '...#', '..#.', '.#..', '####'],
  '3': ['###.', '...#', '.##.', '...#', '#..#', '.##.'],
  '4': ['..#.', '.##.', '#.#.', '####', '..#.', '..#.'],
  '5': ['####', '#...', '###.', '...#', '#..#', '###.'],
  '6': ['.##.', '#...', '###.', '#..#', '#..#', '.##.'],
  '7': ['####', '...#', '..#.', '.#..', '.#..', '.#..'],
  '8': ['.##.', '#..#', '.##.', '#..#', '#..#', '.##.'],
  '9': ['.##.', '#..#', '#..#', '.###', '...#', '.##.'],
  '+': ['....', '.#..', '###.', '.#..', '....', '....'],
  '-': ['....', '....', '####', '....', '....', '....'],
  '!': ['.#..', '.#..', '.#..', '.#..', '....', '.#..'],
  'x': ['....', '#..#', '.##.', '.##.', '#..#', '....'],
  ' ': ['....', '....', '....', '....', '....', '....'],
};

export const GLYPH_W = 4;
export const GLYPH_H = 6;

export function textWidth(text: string, scale: number, spacing = 1): number {
  return text.length * (GLYPH_W + spacing) * scale;
}

/** 以 (x, y) 为左上角绘制像素文字。 */
export function drawPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  scale = 1,
): void {
  ctx.fillStyle = color;
  let cursor = Math.round(x);
  const top = Math.round(y);
  for (let i = 0; i < text.length; i++) {
    const glyph = GLYPHS[text[i]] ?? GLYPHS[' '];
    for (let row = 0; row < GLYPH_H; row++) {
      const line = glyph[row];
      for (let col = 0; col < GLYPH_W; col++) {
        if (line.charCodeAt(col) !== 35) continue;
        ctx.fillRect(cursor + col * scale, top + row * scale, scale, scale);
      }
    }
    cursor += (GLYPH_W + 1) * scale;
  }
}
