/**
 * 界面层 · 像素图标。
 * 直接把 8x9 的字符位图翻译成 CSS box-shadow，和 Canvas 里的像素风保持一致。
 */

import { useMemo } from 'react';

export interface PixelIconProps {
  pixels: readonly string[];
  color: string;
  accentColor?: string;
  size?: number;
  className?: string;
  title?: string;
}

export function PixelIcon({
  pixels,
  color,
  accentColor = '#ffffff',
  size = 3,
  className,
  title,
}: PixelIconProps) {
  const { shadow, width, height } = useMemo(() => {
    const parts: string[] = [];
    let cols = 0;
    for (let y = 0; y < pixels.length; y++) {
      const row = pixels[y];
      if (row.length > cols) cols = row.length;
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === '.' || ch === ' ') continue;
        parts.push(`${x * size}px ${y * size}px 0 0 ${ch === '+' ? accentColor : color}`);
      }
    }
    return { shadow: parts.join(','), width: cols * size, height: pixels.length * size };
  }, [pixels, color, accentColor, size]);

  return (
    <span
      className={className}
      title={title}
      aria-hidden={title ? undefined : true}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        marginRight: width - size,
        marginBottom: height - size,
        boxShadow: shadow,
        background: 'transparent',
      }}
    />
  );
}
