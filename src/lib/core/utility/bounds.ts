import { Rect } from './rect';

export function relativeBounds(element: Element, parent?: Element): Rect {
  console.assert(element.parentElement, 'Element needs to be attached to the DOM.');
  if (parent === undefined) parent = element.parentElement!;
  const bounds = element.getBoundingClientRect();
  const parentBounds = parent.getBoundingClientRect();
  return {
    x: bounds.x - parentBounds.x,
    y: bounds.y - parentBounds.y,
    width: bounds.width,
    height: bounds.height,
  };
}
