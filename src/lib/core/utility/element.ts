import { Rect, rectRound } from './rect';

export function elementRelativeBounds(element: Element): Rect {
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

// inspired by https://stackoverflow.com/a/22909984
export function elementComputedStyleWithoutDefaults(
  element: Element,
  properties: string[]
): Record<string, string> {
  const dummy = document.createElement('style-dummy-tag');
  element.parentElement!.appendChild(dummy);

  const defaultStyle = window.getComputedStyle(dummy);
  const style = window.getComputedStyle(element);

  const diff = {};
  properties.forEach((p) => {
    const defaultValue = defaultStyle.getPropertyValue(p);
    const value = style.getPropertyValue(p);
    if (defaultValue !== value) {
      diff[p] = value;
    }
  });

  dummy.remove();

  return diff;
}

// extracted from the SVG specification
export const elementSVGPresentationAttrs = [
  'fill',
  'alignment-baseline',
  'baseline-shift',
  'clip-path',
  'clip-rule',
  'color',
  'color-interpolation',
  'color-interpolation-filters',
  'color-rendering',
  'cursor',
  'direction',
  'display',
  'dominant-baseline',
  'fill-opacity',
  'fill-rule',
  'filter',
  'flood-color',
  'flood-opacity',
  'font-family',
  'font-size',
  'font-size-adjust',
  'font-stretch',
  'font-style',
  'font-variant',
  'font-weight',
  'glyph-orientation-horizontal',
  'glyph-orientation-vertical',
  'image-rendering',
  'letter-spacing',
  'lighting-color',
  'marker-end',
  'marker-mid',
  'marker-start',
  'mask',
  'opacity',
  'overflow',
  'paint-order',
  'pointer-events',
  'shape-rendering',
  'stop-color',
  'stop-opacity',
  'stroke',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke-width',
  'text-anchor',
  'text-decoration',
  'text-overflow',
  'text-rendering',
  'unicode-bidi',
  'vector-effect',
  'visibility',
  'white-space',
  'word-spacing',
  'writing-mode',
  'transform',
];
