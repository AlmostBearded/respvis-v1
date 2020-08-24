import { Primitive } from 'd3-array';

export function nullFunction<P1>(a?: P1) {}

// Code inspired by https://stackoverflow.com/a/22909984
export function getComputedStyleWithoutDefaults(
  element: SVGElement,
  properties: string[]
): PrimitiveObject {
  // creating an empty dummy object to compare with
  var dummy = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'element-' + new Date().getTime()
  );
  element.parentNode!.appendChild(dummy);

  // getting computed styles for both elements
  var defaultStyles = getComputedStyle(dummy);
  var elementStyles = getComputedStyle(element);

  // calculating the difference
  var diffObj = {};
  for (var i = 0; i < properties.length; ++i) {
    if (defaultStyles[properties[i]] !== elementStyles[properties[i]]) {
      diffObj[properties[i]] = elementStyles[properties[i]];
    }
  }

  // clear dom
  dummy.remove();

  return diffObj;
}

export type PrimitiveObject = { [key: string]: Primitive };