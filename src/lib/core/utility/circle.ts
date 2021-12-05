import { SelectionOrTransition } from './selection';
import { Position } from './position';
import { Rect, rectCenter } from './rect';

export interface Circle {
  center: Position;
  radius: number;
}

export function circleToAttrs(selectionOrTransition: SelectionOrTransition, circle: Circle): void {
  selectionOrTransition
    .attr('cx', circle.center.x)
    .attr('cy', circle.center.y)
    .attr('r', circle.radius);
}

export function circleMinimized(circle: Circle): Circle {
  return { center: circle.center, radius: 0 };
}

export function circleInsideRect(rect: Rect): Circle {
  return { center: rectCenter(rect), radius: Math.min(rect.width, rect.height) / 2 };
}
