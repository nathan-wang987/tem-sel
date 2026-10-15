/**
 * 引擎层 · 均匀网格空间哈希（宽阶段碰撞查询）。
 *
 * 每帧 clear + 重新插入，内部数组全部复用，避免长跑时产生垃圾。
 */

const CELL_HASH_X = 73856093;
const CELL_HASH_Y = 19349663;

interface Cell {
  ids: number[];
}

export class SpatialGrid {
  private cells = new Map<number, Cell>();
  private scratch: Cell = { ids: [] };

  constructor(readonly cellSize: number) {}

  clear(): void {
    // 不删除 Map 条目，只清空内部数组：Map 结构在多帧之间保持稳定。
    this.cells.forEach((cell) => {
      cell.ids.length = 0;
    });
  }

  private keyFor(cx: number, cy: number): number {
    return (Math.imul(cx, CELL_HASH_X) ^ Math.imul(cy, CELL_HASH_Y)) | 0;
  }

  private cellAt(cx: number, cy: number): Cell {
    const key = this.keyFor(cx, cy);
    let cell = this.cells.get(key);
    if (!cell) {
      cell = { ids: [] };
      this.cells.set(key, cell);
    }
    return cell;
  }

  insert(id: number, centerX: number, centerY: number, halfW: number, halfH: number): void {
    const size = this.cellSize;
    const minX = Math.floor((centerX - halfW) / size);
    const maxX = Math.floor((centerX + halfW) / size);
    const minY = Math.floor((centerY - halfH) / size);
    const maxY = Math.floor((centerY + halfH) / size);
    for (let cy = minY; cy <= maxY; cy++) {
      for (let cx = minX; cx <= maxX; cx++) {
        const cell = this.cellAt(cx, cy);
        if (cell.ids.length < 64) cell.ids.push(id);
      }
    }
  }

  /** 查询矩形范围内的 id，写入调用方提供的复用数组，返回数量。 */
  query(minX: number, minY: number, maxX: number, maxY: number, out: number[]): number {
    const size = this.cellSize;
    let count = 0;
    const cellMinX = Math.floor(minX / size);
    const cellMaxX = Math.floor(maxX / size);
    const cellMinY = Math.floor(minY / size);
    const cellMaxY = Math.floor(maxY / size);
    for (let cy = cellMinY; cy <= cellMaxY; cy++) {
      for (let cx = cellMinX; cx <= cellMaxX; cx++) {
        const cell = this.cells.get(this.keyFor(cx, cy));
        if (!cell) continue;
        const ids = cell.ids;
        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];
          let duplicate = false;
          for (let j = 0; j < count; j++) {
            if (out[j] === id) {
              duplicate = true;
              break;
            }
          }
          if (!duplicate) out[count++] = id;
        }
      }
    }
    out.length = Math.max(out.length, count);
    return count;
  }

  queryCircle(cx: number, cy: number, radius: number, out: number[]): number {
    return this.query(cx - radius, cy - radius, cx + radius, cy + radius, out);
  }

  get cellCount(): number {
    return this.cells.size;
  }

  /** 长时间运行后地图会稳定下来；这里仅在极端情况（如切关卡）时清理。 */
  reset(): void {
    this.cells.clear();
  }

  /** 预留接口：确保 scratch 不会被 tree-shaking 掉（调试用）。 */
  get debugScratch(): Cell {
    return this.scratch;
  }
}
