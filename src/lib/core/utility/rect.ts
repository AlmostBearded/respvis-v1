import { Selection, ValueFn } from 'd3-selection';
import { SelectionOrTransition } from './selection';
import {
  Position,
  positionEquals,
  positionFromAttrs,
  positionRound,
  positionToAttrs,
  positionToString,
} from './position';
import { Size, sizeEquals, sizeFromAttrs, sizeRound, sizeToAttrs, sizeToString } from './size';

export interface Rect extends Position, Size {}

export function rectRound(rect: Rect, decimals: number = 0): Rect {
  return {
    ...positionRound(rect, decimals),
    ...sizeRound(rect, decimals),
  };
}

export function rectEquals(rectA: Rect, rectB: Rect, epsilon: number = 0.001): boolean {
  return positionEquals(rectA, rectB, epsilon) && sizeEquals(rectA, rectB, epsilon);
}

export function rectMinimized(rect: Rect): Rect {
  return { ...rectCenter(rect), width: 0, height: 0 };
}

export function rectFitStroke(rect: Rect, stroke: number): Rect {
  return {
    x: rect.x + stroke / 2,
    y: rect.y + stroke / 2,
    width: Math.max(0, rect.width - stroke),
    height: Math.max(0, rect.height - stroke),
  };
}

export function rectPosition(rect: Rect, sizePercentageFromTopLeft: Position): Position {
  return {
    x: rect.x + rect.width * sizePercentageFromTopLeft.x,
    y: rect.y + rect.height * sizePercentageFromTopLeft.y,
  };
}

export function rectCenter(rect: Rect): Position {
  return rectPosition(rect, { x: 0.5, y: 0.5 });
}

export function rectTop(rect: Rect): Position {
  return rectPosition(rect, { x: 0.5, y: 0 });
}

export function rectBottom(rect: Rect): Position {
  return rectPosition(rect, { x: 0.5, y: 1 });
}

export function rectLeft(rect: Rect): Position {
  return rectPosition(rect, { x: 0, y: 0.5 });
}

export function rectRight(rect: Rect): Position {
  return rectPosition(rect, { x: 1, y: 0.5 });
}

export function rectBottomLeft(rect: Rect): Position {
  return rectPosition(rect, { x: 0, y: 1 });
}

export function rectBottomRight(rect: Rect): Position {
  return rectPosition(rect, { x: 1, y: 1 });
}

export function rectTopRight(rect: Rect): Position {
  return rectPosition(rect, { x: 1, y: 0 });
}

export function rectTopLeft(rect: Rect): Position {
  return rectPosition(rect, { x: 0, y: 0 });
}

export function rectToString(rect: Rect, decimals: number = 0): string {
  return `${positionToString(rect, decimals)}, ${sizeToString(rect, decimals)}`;
}

export function rectFromString(str: string): Rect {
  const parts = str.split(',').map((s) => parseFloat(s.trim()));
  return { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
}

export function rectToAttrs(selectionOrTransition: SelectionOrTransition, rect: Rect): void {
  selectionOrTransition
    .call((s: SelectionOrTransition) => positionToAttrs(s, rect))
    .call((s: SelectionOrTransition) => sizeToAttrs(s, rect));
}

export function rectFromAttrs(selectionOrTransition: SelectionOrTransition): Rect {
  return { ...positionFromAttrs(selectionOrTransition), ...sizeFromAttrs(selectionOrTransition) };
}
