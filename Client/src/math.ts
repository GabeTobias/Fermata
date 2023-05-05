export type Bounds = { x: number, y: number, w: number, h: number };
export type Position = { x: number, y: number };

export function Clamp(value: number, min: number, max: number) : number {
  return Math.min(Math.max(value, min),max);
}

export function Contains(pos: Position, bounds: Bounds) : boolean {
  return (
    pos.x > bounds.x && 
    pos.x < bounds.x + bounds.w &&
    pos.y > bounds.y &&
    pos.y < bounds.y + bounds.h
  );
}