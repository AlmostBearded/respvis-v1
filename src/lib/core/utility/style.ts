// extracted from the SVG specification
export const presentationAttributes = [
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

const dummyTag = 'style-dummy-tag';

// inspired by https://stackoverflow.com/a/22909984
export function computedStyleWithoutDefaults(
  element: Element,
  properties: string[]
): Record<string, string> {
  const dummy = document.createElement(dummyTag);
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
