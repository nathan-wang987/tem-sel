/**
 * 测试用软件光栅化 Canvas：实现游戏渲染真正用到的那部分 2D API，
 * 并能把结果导出成 PNG，便于在无浏览器环境里检查像素 3D 画面。
 */

import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

export interface MockContext {
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  imageSmoothingEnabled: boolean;
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  closePath(): void;
  fill(): void;
  stroke(): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  clearRect(x: number, y: number, w: number, h: number): void;
  save(): void;
  restore(): void;
  setTransform(): void;
  translate(): void;
}

export interface MockCanvas {
  width: number;
  height: number;
  getContext(kind: string, options?: unknown): unknown;
  readonly pixels: Uint8ClampedArray;
  readonly ctx: MockContext;
  readonly drawnPixels: number;
}

function parseColor(value: string): [number, number, number, number] {
  if (value.startsWith('#')) {
    const hex = value.slice(1);
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16), 1];
  }
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) return [255, 0, 255, 1];
  const parts = match[1].split(',').map((part) => Number(part.trim()));
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts[3] === undefined ? 1 : parts[3]];
}

export function createMockCanvas(initialWidth: number, initialHeight: number): MockCanvas {
  let bufferWidth = initialWidth;
  let bufferHeight = initialHeight;
  let pixels = new Uint8ClampedArray(bufferWidth * bufferHeight * 4);
  let drawn = 0;
  let fillStyle = 'rgb(0,0,0)';
  let strokeStyle = 'rgb(0,0,0)';
  let lineWidth = 1;
  let pathPoints: Array<[number, number]> = [];

  const blend = (x: number, y: number, color: [number, number, number, number]) => {
    if (x < 0 || y < 0 || x >= bufferWidth || y >= bufferHeight) return;
    const index = (y * bufferWidth + x) * 4;
    const alpha = color[3];
    if (alpha >= 1) {
      pixels[index] = color[0];
      pixels[index + 1] = color[1];
      pixels[index + 2] = color[2];
    } else {
      pixels[index] = pixels[index] * (1 - alpha) + color[0] * alpha;
      pixels[index + 1] = pixels[index + 1] * (1 - alpha) + color[1] * alpha;
      pixels[index + 2] = pixels[index + 2] * (1 - alpha) + color[2] * alpha;
    }
    pixels[index + 3] = 255;
    drawn++;
  };

  const fillPolygon = () => {
    if (pathPoints.length < 3) return;
    const color = parseColor(fillStyle);
    let minY = Infinity;
    let maxY = -Infinity;
    for (const point of pathPoints) {
      if (point[1] < minY) minY = point[1];
      if (point[1] > maxY) maxY = point[1];
    }
    const startY = Math.max(0, Math.floor(minY));
    const endY = Math.min(bufferHeight - 1, Math.ceil(maxY));
    const crossings: number[] = [];
    for (let y = startY; y <= endY; y++) {
      crossings.length = 0;
      const scanY = y + 0.5;
      for (let i = 0; i < pathPoints.length; i++) {
        const a = pathPoints[i];
        const b = pathPoints[(i + 1) % pathPoints.length];
        if (a[1] === b[1]) continue;
        if (scanY >= Math.min(a[1], b[1]) && scanY < Math.max(a[1], b[1])) {
          const t = (scanY - a[1]) / (b[1] - a[1]);
          crossings.push(a[0] + t * (b[0] - a[0]));
        }
      }
      crossings.sort((p, q) => p - q);
      for (let i = 0; i + 1 < crossings.length; i += 2) {
        const xStart = Math.max(0, Math.round(crossings[i]));
        const xEnd = Math.min(bufferWidth - 1, Math.round(crossings[i + 1]) - 1);
        for (let x = xStart; x <= xEnd; x++) blend(x, y, color);
      }
    }
  };

  const strokePath = () => {
    const color = parseColor(strokeStyle);
    const width = Math.max(1, Math.round(lineWidth));
    for (let i = 0; i < pathPoints.length; i++) {
      const a = pathPoints[i];
      const b = pathPoints[(i + 1) % pathPoints.length];
      const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = Math.round(a[0] + (b[0] - a[0]) * t);
        const y = Math.round(a[1] + (b[1] - a[1]) * t);
        for (let oy = 0; oy < width; oy++) {
          for (let ox = 0; ox < width; ox++) blend(x + ox, y + oy, color);
        }
      }
    }
  };

  const ctx: MockContext = {
    get fillStyle() {
      return fillStyle;
    },
    set fillStyle(value: string) {
      fillStyle = value;
    },
    get strokeStyle() {
      return strokeStyle;
    },
    set strokeStyle(value: string) {
      strokeStyle = value;
    },
    get lineWidth() {
      return lineWidth;
    },
    set lineWidth(value: number) {
      lineWidth = value;
    },
    imageSmoothingEnabled: false,
    beginPath() {
      pathPoints = [];
    },
    moveTo(x: number, y: number) {
      pathPoints.push([x, y]);
    },
    lineTo(x: number, y: number) {
      pathPoints.push([x, y]);
    },
    closePath() {},
    fill() {
      fillPolygon();
    },
    stroke() {
      strokePath();
    },
    fillRect(x: number, y: number, w: number, h: number) {
      const color = parseColor(fillStyle);
      const x0 = Math.round(x);
      const y0 = Math.round(y);
      const x1 = Math.round(x + w);
      const y1 = Math.round(y + h);
      for (let py = y0; py < y1; py++) {
        for (let px = x0; px < x1; px++) blend(px, py, color);
      }
    },
    clearRect(x: number, y: number, w: number, h: number) {
      const x0 = Math.max(0, Math.round(x));
      const y0 = Math.max(0, Math.round(y));
      const x1 = Math.min(bufferWidth, Math.round(x + w));
      const y1 = Math.min(bufferHeight, Math.round(y + h));
      for (let py = y0; py < y1; py++) {
        for (let px = x0; px < x1; px++) {
          const index = (py * bufferWidth + px) * 4;
          pixels[index] = 0;
          pixels[index + 1] = 0;
          pixels[index + 2] = 0;
          pixels[index + 3] = 255;
        }
      }
    },
    save() {},
    restore() {},
    setTransform() {},
    translate() {},
  };

  const ensureBuffer = () => {
    if (pixels.length !== bufferWidth * bufferHeight * 4) {
      pixels = new Uint8ClampedArray(bufferWidth * bufferHeight * 4);
      drawn = 0;
    }
  };

  return {
    get width() {
      return bufferWidth;
    },
    set width(value: number) {
      bufferWidth = Math.max(1, Math.floor(value));
      ensureBuffer();
    },
    get height() {
      return bufferHeight;
    },
    set height(value: number) {
      bufferHeight = Math.max(1, Math.floor(value));
      ensureBuffer();
    },
    getContext(kind: string) {
      if (kind !== '2d') throw new Error('mock canvas 只支持 2d 上下文');
      return ctx;
    },
    get pixels() {
      return pixels;
    },
    get ctx() {
      return ctx;
    },
    get drawnPixels() {
      return drawn;
    },
  };
}

export function countNonBlack(canvas: MockCanvas): number {
  let count = 0;
  const pixels = canvas.pixels;
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i] > 8 || pixels[i + 1] > 8 || pixels[i + 2] > 8) count++;
  }
  return count;
}

export function distinctColors(canvas: MockCanvas): number {
  const seen = new Set<number>();
  const pixels = canvas.pixels;
  for (let i = 0; i < pixels.length; i += 4) {
    seen.add((pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2]);
  }
  return seen.size;
}

/** 统计相邻像素的颜色跳变次数：用来确认画面确实有内容。 */
export function edgeDensity(canvas: MockCanvas): number {
  const pixels = canvas.pixels;
  let edges = 0;
  for (let y = 1; y < canvas.height - 1; y++) {
    for (let x = 1; x < canvas.width - 1; x++) {
      const index = (y * canvas.width + x) * 4;
      const right = index + 4;
      const down = index + canvas.width * 4;
      if (Math.abs(pixels[index] - pixels[right]) > 12 || Math.abs(pixels[index] - pixels[down]) > 12) edges++;
    }
  }
  return edges;
}

/** 把像素缓冲写成 PNG（最小实现：IHDR + IDAT + IEND）。 */
export function writePng(canvas: MockCanvas, filePath: string): void {
  const width = canvas.width;
  const height = canvas.height;
  const pixels = canvas.pixels;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    for (let x = 0; x < width * 4; x++) {
      raw[y * (width * 4 + 1) + 1 + x] = pixels[y * width * 4 + x];
    }
  }
  const idat = deflateSync(raw, { level: 9 });

  const chunk = (type: string, data: Buffer) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcInput = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcInput), 0);
    return Buffer.concat([length, typeBuf, data, crc]);
  };

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  writeFileSync(filePath, png);
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
