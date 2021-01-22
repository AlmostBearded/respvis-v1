import { ISize } from '../utils';
import { computeLayout as faberComputeLayout } from './faberjs';
import { IRect, Rect } from '../rect';
import { BaseType, selection, Selection } from 'd3-selection';

type LayoutNode = {
  style: LayoutStyle;
  layout: IRect<number>;
  children: LayoutNode[];
};

export interface LayoutStyle {
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

export interface LayoutProperties {
  'grid-template-rows'?: string;
  'grid-template-columns'?: string;
  'grid-template'?: string;
  'grid-row-start'?: number;
  'grid-row-end'?: number;
  'grid-column-start'?: number;
  'grid-column-end'?: number;
  'grid-row'?: string;
  'grid-column'?: string;
  'grid-area'?: string;
  'place-items'?: string;
  'justify-items'?: string;
  'align-items'?: string;
  'place-self'?: string;
  'justify-self'?: string;
  'align-self'?: string;
  width?: number | string;
  height?: number | string;
  display?: 'grid';
}

export interface LayoutData extends LayoutProperties {
  getBounds?: (element: Element) => ISize;
}

export interface LaidOutElement extends Element {
  __layout?: LayoutData;
}

// ---
// # extend d3 selection with layout methods
// ---

declare module 'd3-selection' {
  export interface Selection<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {
    layout(name: keyof LayoutData): string | number | undefined;
    layout(name: keyof LayoutData, value: string | number): this;
    layout(name: keyof LayoutData, value: null): this;
    layoutBoundsCalculator(): ((element: Element) => ISize) | undefined;
    layoutBoundsCalculator(callback: null): this;
    layoutBoundsCalculator(callback: (element: Element) => ISize): this;
  }
}

selection.prototype.layout = function (
  this: Selection<BaseType & LaidOutElement, any, any, any>,
  name: keyof LayoutProperties,
  value?: string | number | null
): string | number | undefined | Selection<any, any, any, any> {
  if (value === undefined) return this.node()?.__layout?.[name];
  this.each((d, i, groups) => {
    let layout = groups[i].__layout;
    if (!layout) layout = groups[i].__layout = {};
    if (value === null) delete layout[name];
    else layout[name] = value;
  });
  return this;
};

selection.prototype.layoutBoundsCalculator = function (
  this: Selection<BaseType & LaidOutElement, any, any, any>,
  callback?: ((element: Element) => ISize) | null
): ((element: Element) => ISize) | undefined | Selection<BaseType & LaidOutElement, any, any, any> {
  if (callback === undefined) return this.node()?.__layout?.getBounds;
  this.each((d, i, groups) => {
    let layout = groups[i].__layout;
    if (!layout) layout = groups[i].__layout = {};
    if (callback === null) delete layout.getBounds;
    else layout.getBounds = callback;
  });

  return this;
};

export function computeLayout(element: LaidOutElement, size: ISize) {
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

function parseLayoutStyle(element: LaidOutElement): LayoutStyle | null {
  if (element.__layout === undefined) return null;
  const data = element.__layout;

  const trim = (s: string) => s.trim();
  const parse = (s: string) => parseInt(s);
  const template = data['grid-template']?.split('/').map(trim),
    templateRows = data['grid-template-rows'],
    templateColumns = data['grid-template-columns'],
    area = data['grid-area']?.split('/').map(trim).map(parse),
    row = data['grid-row']?.split('/').map(trim).map(parse),
    column = data['grid-column']?.split('/').map(trim).map(parse),
    rowStart = data['grid-row-start'],
    rowEnd = data['grid-row-end'],
    columnStart = data['grid-column-start'],
    columnEnd = data['grid-column-end'],
    placeItems = data['place-items']?.split(' '),
    alignItems = data['align-items'],
    justifyItems = data['justify-items'],
    placeSelf = data['place-self']?.split(' '),
    alignSelf = data['align-self'],
    justifySelf = data['justify-self'],
    width = data.width,
    height = data.height;

  let bbox: ISize | undefined = undefined;
  if (width === 'min-content' || height === 'min-content')
    bbox = data.getBounds?.(element) || element.getBoundingClientRect();

  const style: LayoutStyle = {
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

    width: (width === 'min-content' ? bbox!.width : width) || undefined,
    height: (height === 'min-content' ? bbox!.height : height) || undefined,
  };

  if (style.gridTemplateRows || style.gridTemplateColumns) style.display = 'grid';

  // delete undefined properties
  Object.keys(style).forEach((key) => style[key] === undefined && delete style[key]);
  if (Object.keys(style).length === 0) return null;

  return style;
}

function parseElementHierarchy(element: LaidOutElement): LayoutNode | null {
  const layoutStyle = parseLayoutStyle(element);

  if (layoutStyle === null) {
    element.removeAttribute('laidOut');
    return null;
  }

  element.setAttribute('laidOut', '');

  const layoutNode: LayoutNode = {
    style: layoutStyle,
    layout: { x: 0, y: 0, width: 0, height: 0 },
    children: [],
  };

  for (var i = 0; i < element.children.length; ++i) {
    const childElement = element.children[i] as LaidOutElement;
    const childLayoutNode = parseElementHierarchy(childElement);
    if (childLayoutNode) layoutNode.children.push(childLayoutNode);
  }

  return layoutNode;
}

function setCalculatedDimensions(layoutNode: LayoutNode) {
  layoutNode.style.width = layoutNode.layout.width;
  layoutNode.style.height = layoutNode.layout.height;
  for (let i = 0; i < layoutNode.children.length; ++i) {
    setCalculatedDimensions(layoutNode.children[i]);
  }
}

function setLayoutAttributes(element: LaidOutElement, layoutNode: LayoutNode): boolean {
  if (element.getAttribute('laidOut') === null) return false;

  // todo: set layout as __layout property
  element.setAttribute('layout', Rect.fromRect(layoutNode.layout).toString());

  let notLaidOutChildCount = 0;
  for (let i = 0; i < element.children.length; ++i) {
    notLaidOutChildCount += setLayoutAttributes(
      element.children[i] as LaidOutElement,
      layoutNode.children[i - notLaidOutChildCount]
    )
      ? 0
      : 1;
  }
  return true;
}
