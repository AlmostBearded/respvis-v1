import { Rect, rectRound } from './rect';

export function relativeBounds(element: Element): Rect {
  console.assert(element.isConnected, 'Element needs to be attached to the DOM.');
  const bounds = element.getBoundingClientRect();
  const parentBounds = element.parentElement!.getBoundingClientRect();
  return rectRound(
    {
      x: bounds.x - parentBounds.x,
      y: bounds.y - parentBounds.y,
      width: bounds.width,
      height: bounds.height,
    },
    2
  );
}
