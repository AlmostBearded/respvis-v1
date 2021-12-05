import { Selection, ValueFn } from 'd3-selection';
import { SelectionOrTransition } from './selection';
import { Position, positionRound, positionToXYAttrs } from './position';
import { sizeRound, sizeToAttrs } from './size';

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

export function rectToString(rect: Rect, decimals: number = 0): string {
  rect = rectRound(rect, decimals);
  return `${rect.x}, ${rect.y}, ${rect.width}, ${rect.height}`;
}

export function rectToAttrs(selectionOrTransition: SelectionOrTransition, rect: Rect): void {
  selectionOrTransition
    .call((s: SelectionOrTransition) => positionToXYAttrs(s, rect))
    .call((s: SelectionOrTransition) => sizeToAttrs(s, rect));
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

export function rectBottomLeft(rect: Rect): Position {
  return { x: rect.x, y: rect.y + rect.height };
}

export function rectBottomRight(rect: Rect): Position {
  return { x: rect.x + rect.width, y: rect.y + rect.height };
}

export function rectTopRight(rect: Rect): Position {
  return { x: rect.x + rect.width, y: rect.y };
}

export function rectTopLeft(rect: Rect): Position {
  return { x: rect.x, y: rect.y };
}

export function rectMinimized(rect: Rect): Rect {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, width: 0, height: 0 };
}

export function rectRound(rect: Rect, decimals: number = 0): Rect {
  return {
    ...positionRound(rect, decimals),
    ...sizeRound(rect, decimals),
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
