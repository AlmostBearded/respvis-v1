import { ValueFn } from 'd3-selection';
import { isTransition, SelectionOrTransition } from '../selection';

export interface Position {
  x: number;
  y: number;
}

export function positionToXYAttrs(
  selectionOrTransition: SelectionOrTransition,
  position: Position
): void {
  position = positionRound(position);
  selectionOrTransition.attr('x', position.x).attr('y', position.y);
}

export function positionFromXYAttrs(selectionOrTransition: SelectionOrTransition): Position {
  const s = isTransition(selectionOrTransition)
    ? selectionOrTransition.selection()
    : selectionOrTransition;
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

export function positionRound(position: Position, decimals: number = 0): Position {
  const e = Math.pow(10, decimals);
  return {
    x: Math.round(position.x * e) / e,
    y: Math.round(position.y * e) / e,
  };
}

export function positionToString(position: Position, decimals: number = 1): string {
  position = positionRound(position, decimals);
  return `${position.x}, ${position.y}`;
}
