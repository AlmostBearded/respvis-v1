import { SelectionOrTransition } from '../selection';
import { Circle } from './circle';
import { Rect } from './rect';
import { Size } from './size';

export function pathRect(selectionOrTransition: SelectionOrTransition, size: Size): void {
  selectionOrTransition.attr('d', `M 0 0 h ${size.width} v ${size.height} h ${-size.width} L 0 0`);
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
