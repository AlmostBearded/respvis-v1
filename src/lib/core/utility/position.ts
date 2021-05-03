import { ValueFn } from 'd3-selection';
import { Rect } from '../rect';
import { SelectionOrTransition } from '../selection';

export interface Position {
  x: number;
  y: number;
}

export function positionAttrs<D>(
  selection: SelectionOrTransition<Element, D>,
  position: Position | ValueFn<Element, D, Position>
): void {
  // todo: comment this function
  const positions: Position[] = new Array(selection.size());
  if (position instanceof Function)
    selection.each((d, i, groups) => (positions[i] = position.call(this, d, i, groups)));
  else positions.map(() => position);
  // note: TS can't handle method chaining when working with SelectionOrTransition
  selection.attr('x', (d, i) => positions[i].x);
  selection.attr('y', (d, i) => positions[i].y);
}
