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
  // note: TS can't handle method chaining when working with SelectionOrTransition
  selection.attr('x', (d, i) => positions[i].x);
  selection.attr('y', (d, i) => positions[i].y);
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

  selection.attr('transform', (d, i) => `translate(${positions[i].x}, ${positions[i].y})`);
}
