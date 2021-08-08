import { ValueFn } from 'd3-selection';
import { SelectionOrTransition } from '../selection';

export interface Position {
  x: number;
  y: number;
}

export function positionToXYAttrs<D>(
  selection: SelectionOrTransition<Element, D>,
  position: Position | ValueFn<Element, D, Position>
): void {
  const positions: Position[] = new Array(selection.size());
  if (position instanceof Function)
    selection.each((d, i, groups) => (positions[i] = position.call(this, d, i, groups)));
  else selection.each((d, i, groups) => (positions[i] = position));
  const roundedPositions = positions.map((p) => positionRound(p));
  selection.attr('x', (d, i) => roundedPositions[i].x);
  selection.attr('y', (d, i) => roundedPositions[i].y);
}

export function positionFromXYAttrs<D>(selection: SelectionOrTransition<Element, D>): Position {
  // @ts-ignore TS behaves weirdly with the SelectionOrTransition interface
  return { x: parseFloat(selection.attr('x') || '0'), y: parseFloat(selection.attr('y') || '0') };
}

export function positionToTransformAttr<D>(
  selection: SelectionOrTransition<Element, D>,
  position: Position | ValueFn<Element, D, Position>
): void {
  const positions: Position[] = new Array(selection.size());
  if (position instanceof Function)
    selection.each((d, i, groups) => (positions[i] = position.call(this, d, i, groups)));
  else selection.each((d, i, groups) => (positions[i] = position));

  selection.attr(
    'transform',
    (d, i) => `translate(${positionToString(positionRound(positions[i]))})`
  );
}

export function positionRound(position: Position, decimals: number = 1): Position {
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
