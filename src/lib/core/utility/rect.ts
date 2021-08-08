import { select, Selection, ValueFn } from 'd3-selection';
import { SelectionOrTransition } from '../selection';
import { Position } from './position';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
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

export function rectToAttrs<D>(
  selection: SelectionOrTransition<Element, D>,
  rect: Rect | ValueFn<Element, D, Rect>
): void {
  // todo: comment this function
  const rects: Rect[] = new Array(selection.size());
  selection.each(function (d, i, groups) {
    rects[i] = rectRound(rect instanceof Function ? rect.call(this, d, i, groups) : rect);
  });
  // note: TS can't handle method chaining when working with SelectionOrTransition
  selection.attr('x', (d, i) => rects[i].x);
  selection.attr('y', (d, i) => rects[i].y);
  selection.attr('width', (d, i) => rects[i].width);
  selection.attr('height', (d, i) => rects[i].height);
}

export function rectToString(rect: Rect, decimals: number = 1): string {
  rect = rectRound(rect, decimals);
  return `${rect.x}, ${rect.y}, ${rect.width}, ${rect.height}`;
}

export function rectPosition(rect: Rect, percentage: Position): Position {
  return { x: rect.x + rect.width * percentage.x, y: rect.y + rect.height * percentage.y };
}

export function rectCenter(rect: Rect): Position {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

export function rectTop(rect: Rect): Position {
  return { x: rect.x + rect.width / 2, y: rect.y };
}

export function rectBottom(rect: Rect): Position {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height };
}

export function rectLeft(rect: Rect): Position {
  return { x: rect.x, y: rect.y + rect.height / 2 };
}

export function rectRight(rect: Rect): Position {
  return { x: rect.x + rect.width, y: rect.y + rect.height / 2 };
}

export function rectMinimized(rect: Rect): Rect {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, width: 0, height: 0 };
}

export function rectRound(rect: Rect, decimals: number = 1): Rect {
  const e = Math.pow(10, decimals);
  return {
    x: Math.round(rect.x * e) / e,
    y: Math.round(rect.y * e) / e,
    width: Math.round(rect.width * e) / e,
    height: Math.round(rect.height * e) / e,
  };
}

export function rectEquals(rectA: Rect, rectB: Rect, epsilon: number = 0.001): boolean {
  return (
    Math.abs(rectA.x - rectB.x) < epsilon &&
    Math.abs(rectA.y - rectB.y) < epsilon &&
    Math.abs(rectA.width - rectB.width) < epsilon &&
    Math.abs(rectA.height - rectB.height) < epsilon
  );
}

export function rectFitStroke(rect: Rect, stroke: number): Rect {
  return {
    x: rect.x + stroke / 2,
    y: rect.y + stroke / 2,
    width: Math.max(0, rect.width - stroke),
    height: Math.max(0, rect.height - stroke),
  };
}
