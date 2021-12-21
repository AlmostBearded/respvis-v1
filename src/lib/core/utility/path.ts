import { SelectionOrTransition } from './selection';
import { Circle } from './circle';
import { Rect } from './rect';

export function pathRect(selectionOrTransition: SelectionOrTransition, rect: Rect): void {
  const { x, y, width: w, height: h } = rect;
  selectionOrTransition.attr('d', `M ${x} ${y} h ${w} v ${h} h ${-w} v ${-h}`);
}

export function pathCircle(selectionOrTransition: SelectionOrTransition, circle: Circle): void {
  const {
    center: { x: cx, y: cy },
    radius: r,
  } = circle;

  selectionOrTransition.attr(
    'd',
    `M ${cx - r} ${cy} 
    a ${r},${r} 0 1,0 ${r * 2},0 
    a ${r},${r} 0 1,0 -${r * 2},0`
  );
}
