import { ValueFn } from 'd3';
import { Circle } from './circle';
import { Rect } from './rect';
import { isTransition, SelectionOrTransition } from './selection';

export interface Position {
  x: number;
  y: number;
}

export function positionRound(position: Position, decimals: number = 0): Position {
  const e = Math.pow(10, decimals);
  return {
    x: Math.round(position.x * e) / e,
    y: Math.round(position.y * e) / e,
  };
}

export function positionEquals(
  positionA: Position,
  positionB: Position,
  epsilon: number = 0.001
): boolean {
  return (
    Math.abs(positionA.x - positionB.x) < epsilon && Math.abs(positionA.y - positionB.y) < epsilon
  );
}

export function positionToString(position: Position, decimals: number = 1): string {
  position = positionRound(position, decimals);
  return `${position.x}, ${position.y}`;
}

export function positionFromString(str: string): Position {
  const parts = str.split(',').map((s) => parseFloat(s.trim()));
  return { x: parts[0], y: parts[1] };
}

export function positionToAttrs(
  selectionOrTransition: SelectionOrTransition,
  position: Position
): void {
  position = positionRound(position);
  selectionOrTransition.attr('x', position.x);
  selectionOrTransition.attr('y', position.y);
}

export function positionFromAttrs(selectionOrTransition: SelectionOrTransition): Position {
  const s = selectionOrTransition.selection();
  return { x: parseFloat(s.attr('x') || '0'), y: parseFloat(s.attr('y') || '0') };
}

export function positionToTransformAttr(
  selectionOrTransition: SelectionOrTransition,
  position: Position
): void {
  selectionOrTransition.attr(
    'transform',
    `translate(${positionToString(positionRound(position))})`
  );
}
