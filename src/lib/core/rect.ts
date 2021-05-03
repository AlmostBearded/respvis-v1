import { select, Selection } from 'd3-selection';
import { Position } from './utility/position';

export interface Rect<T extends number | string = number> {
  x: T;
  y: T;
  width: T;
  height: T;
}

export function rectFromString(str: string): Rect {
  const parts = str.split(',').map((s) => parseFloat(s.trim()));
  return { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
}

export function rectFromAttrs(selection: Selection<Element>): Rect {
  return {
    x: parseFloat(selection.attr('x') || '0'),
    y: parseFloat(selection.attr('y') || '0'),
    width: parseFloat(selection.attr('width') || '0'),
    height: parseFloat(selection.attr('height') || '0'),
  };
}

export function rectsFromAttrs(selection: Selection<Element>): Rect[] {
  const rects: Rect[] = [];
  selection.each((d, i, g) => ({
    x: parseFloat(g[i].getAttribute('x') || '0'),
    y: parseFloat(g[i].getAttribute('y') || '0'),
    width: parseFloat(g[i].getAttribute('width') || '0'),
    height: parseFloat(g[i].getAttribute('height') || '0'),
  }));

  return rects;
}

export function rectToString<T extends number | string>(rect: Rect<T>): string {
  return `${rect.x}, ${rect.y}, ${rect.width}, ${rect.height}`;
}

export function rectCenter(rect: Rect): Position {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}
