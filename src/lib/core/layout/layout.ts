import { ISize } from '../utils';
import { computeLayout as faberComputeLayout } from './faberjs';
import { IRect, Rect } from '../rect';

type ILayoutNode = {
  style: ILayoutStyle;
  layout: IRect;
  children: ILayoutNode[];
};

export interface ILayoutStyle {
  width?: number | string;
  height?: number | string;
  display?: 'grid';
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridRowStart?: number;
  gridRowEnd?: number;
  gridColumnStart?: number;
  gridColumnEnd?: number;
  justifyItems?: string;
  alignItems?: string;
  justifySelf?: string;
  alignSelf?: string;
}

export function computeLayout(element: Element, size: ISize) {
  // 1st Phase
  const rootLayoutNode = parseElementHierarchy(element)!;
  rootLayoutNode.style.width = size.width;
  rootLayoutNode.style.height = size.height;
  faberComputeLayout(rootLayoutNode);

  // 2nd Phase
  setCalculatedDimensions(rootLayoutNode);
  faberComputeLayout(rootLayoutNode);

  setLayoutAttributes(element, rootLayoutNode);
}

export function applyLayoutTransforms(element: Element) {
  const layoutAttribute = element.getAttribute('layout');
  if (layoutAttribute) {
    const layoutRect = Rect.fromString(layoutAttribute);
    const layoutTransform = `translate(${layoutRect.x}, ${layoutRect.y})`;

    const previousTransform = element.getAttribute('previous-transform') || '';

    let transform = element.getAttribute('transform') || '';

    if (previousTransform === transform) {
      transform = transform.substring(transform.indexOf(')') + 1);
    }

    transform = layoutTransform.concat(transform);

    element.setAttribute('transform', transform);
    element.setAttribute('previous-transform', transform);
  }

  for (let i = 0; i < element.children.length; ++i) {
    applyLayoutTransforms(element.children[i]);
  }
}

function parseLayoutStyle(element: Element): ILayoutStyle {
  const attr = element.getAttribute.bind(element);
  const trim = (s: string) => s.trim();
  const template = attr('grid-template')?.split('/').map(trim),
    templateRows = attr('grid-template-rows'),
    templateColumns = attr('grid-template-columns'),
    area = attr('grid-area')?.split('/').map(trim),
    row = attr('grid-row')?.split('/').map(trim),
    column = attr('grid-column')?.split('/').map(trim),
    rowStart = attr('grid-row-start'),
    rowEnd = attr('grid-row-end'),
    columnStart = attr('grid-column-start'),
    columnEnd = attr('grid-column-end'),
    placeItems = attr('place-items')?.split(' '),
    alignItems = attr('align-items'),
    justifyItems = attr('justify-items'),
    placeSelf = attr('place-self')?.split(' '),
    alignSelf = attr('align-self'),
    justifySelf = attr('justify-self'),
    width = attr('width'),
    height = attr('height'),
    bbox = element.getBoundingClientRect();

  const style: ILayoutStyle = {
    gridTemplateRows: templateRows || template?.[0],
    gridTemplateColumns: templateColumns || template?.[1],

    gridRowStart: rowStart || row?.[0] || area?.[0],
    gridRowEnd: rowEnd || row?.[1] || area?.[2],
    gridColumnStart: columnStart || column?.[0] || area?.[1],
    gridColumnEnd: columnEnd || column?.[1] || area?.[3],

    alignItems: alignItems || placeItems?.[0],
    justifyItems: justifyItems || placeItems?.[1] || placeItems?.[0],
    alignSelf: alignSelf || placeSelf?.[0],
    justifySelf: justifySelf || placeSelf?.[1] || placeSelf?.[0],

    width: (width === 'min-content' ? bbox.width : width) || undefined,
    height: (height === 'min-content' ? bbox.height : height) || undefined,
  };

  if (style.gridTemplateRows || style.gridTemplateColumns) style.display = 'grid';

  // delete undefined properties
  Object.keys(style).forEach((key) => style[key] === undefined && delete style[key]);

  return style;
}

function parseElementHierarchy(element: Element): ILayoutNode | null {
  const layoutStyle = parseLayoutStyle(element);

  if (Object.keys(layoutStyle).length === 0) {
    element.removeAttribute('laidOut');
    return null;
  }

  element.setAttribute('laidOut', '');

  const layoutNode: ILayoutNode = {
    style: layoutStyle,
    layout: { x: 0, y: 0, width: 0, height: 0 },
    children: [],
  };

  for (var i = 0; i < element.children.length; ++i) {
    const childElement = element.children[i];
    const childLayoutNode = parseElementHierarchy(childElement);
    if (childLayoutNode) layoutNode.children.push(childLayoutNode);
  }

  return layoutNode;
}

function setCalculatedDimensions(layoutNode: ILayoutNode) {
  layoutNode.style.width = layoutNode.layout.width;
  layoutNode.style.height = layoutNode.layout.height;
  for (let i = 0; i < layoutNode.children.length; ++i) {
    setCalculatedDimensions(layoutNode.children[i]);
  }
}

function setLayoutAttributes(element: Element, layoutNode: ILayoutNode): boolean {
  if (element.getAttribute('laidOut') === null) return false;

  element.setAttribute('layout', Rect.fromRect(layoutNode.layout).toString());

  let notLaidOutChildCount = 0;
  for (let i = 0; i < element.children.length; ++i) {
    notLaidOutChildCount += setLayoutAttributes(
      element.children[i],
      layoutNode.children[i - notLaidOutChildCount]
    )
      ? 0
      : 1;
  }
  return true;
}
