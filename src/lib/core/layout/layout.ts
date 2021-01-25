import { ISize } from '../utils';
import { computeLayout as faberComputeLayout } from './faberjs';
import { Rect, rectFromString, rectToString } from '../rect';
import { BaseType, selection, Selection } from 'd3-selection';
import { ChildrenMixin } from '../mixins/children-mixin';

type LayoutNode = {
  style: LayoutStyle;
  layout: Rect<number>;
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

type ContentPlacement =
  | 'start'
  | 'center'
  | 'end'
  | 'stretch'
  | 'space-around'
  | 'space-between'
  | 'space-evenly';

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
  'padding-left'?: number;
  'padding-right'?: number;
  'padding-top'?: number;
  'padding-bottom'?: number;
  'padding-horizontal'?: number;
  'padding-vertical'?: number;
  padding?: number;
  'justify-content'?: ContentPlacement;
  'align-content'?: ContentPlacement;
  'place-content'?: string;
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
  // applyPadding(element, rootLayoutNode);
  faberComputeLayout(rootLayoutNode);

  setLayoutAttributes(element, rootLayoutNode);
}

export function applyLayoutTransforms(element: Element) {
  const layoutAttribute = element.getAttribute('layout');
  if (layoutAttribute) {
    const layoutRect = rectFromString(layoutAttribute);
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

  // todo: enable toggling of debug attributes
  for (let key in element.__layout) {
    if (key === 'getBounds') continue;
    element.setAttribute(`layout-${key}`, element.__layout[key]);
  }

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

function parsePadding(
  element: LaidOutElement
): { left: number; right: number; top: number; bottom: number } {
  return {
    left:
      element.__layout?.['padding-left'] ||
      element.__layout?.['padding-horizontal'] ||
      element.__layout?.['padding'] ||
      0,
    right:
      element.__layout?.['padding-right'] ||
      element.__layout?.['padding-horizontal'] ||
      element.__layout?.['padding'] ||
      0,
    top:
      element.__layout?.['padding-top'] ||
      element.__layout?.['padding-vertical'] ||
      element.__layout?.['padding'] ||
      0,
    bottom:
      element.__layout?.['padding-bottom'] ||
      element.__layout?.['padding-vertical'] ||
      element.__layout?.['padding'] ||
      0,
  };
}

function parseContentPlacement(
  element: LaidOutElement
): { justify: ContentPlacement; align: ContentPlacement } {
  return {
    align:
      element.__layout?.['align-content'] ||
      (element.__layout?.['place-content']?.split(' ')[0] as ContentPlacement) ||
      'stretch',
    justify:
      element.__layout?.['justify-content'] ||
      (element.__layout?.['place-content']?.split(' ')[1] as ContentPlacement) ||
      'stretch',
  };
}

function getPositionModifier(placement: ContentPlacement): (position: number) => number {
  const p = placement;
  if (p === 'start' || p === 'stretch') return (position) => position;
  if (p === 'center' || p === 'end') return (position) => position + 1;
  if (p === 'space-around') return (position) => 2 + (position - 1) * 3;
  if (p === 'space-between') return (position) => 1 + (position - 1) * 2;
  if (p === 'space-evenly') return (position) => position * 2;

  console.assert(false, 'should never reach this location');
  return (position) => position;
}

function getSpanModifier(placement: ContentPlacement): (span: number) => number {
  const p = placement;
  if (p === 'start' || p === 'center' || p === 'end' || p === 'stretch') return (span) => span;
  if (p === 'space-around') return (span) => span + (span - 1) * 2;
  if (p === 'space-between' || p === 'space-evenly') return (span) => span + (span - 1);

  console.assert(false, 'should never reach this location');
  return (span) => span;
}

function applyContentPlacementToGridTemplate(
  contentPlacement: ContentPlacement,
  template: string
): string {
  const cells = template.split(' ');
  const result: string[] = [];
  if (contentPlacement === 'start') result.push(...cells, '1fr');
  if (contentPlacement === 'center') result.push('1fr', ...cells, '1fr');
  if (contentPlacement === 'end') result.push('1fr', ...cells);
  if (contentPlacement === 'stretch') result.push(...cells);
  if (contentPlacement === 'space-around') cells.forEach((c) => result.push('1fr', c, '1fr'));
  if (contentPlacement === 'space-between') result.push(...cells.join(' 1fr ').split(' '));
  if (contentPlacement === 'space-evenly') {
    result.push('1fr');
    cells.forEach((c) => result.push(c, '1fr'));
  }
  return result.join(' ');
}

function parseElementHierarchy(
  element: LaidOutElement,
  rowModifier?: (row: number) => number,
  rowSpanModifier?: (span: number) => number,
  columnModifier?: (column: number) => number,
  columnSpanModifier?: (span: number) => number
): LayoutNode | null {
  const layoutStyle = parseLayoutStyle(element);

  if (layoutStyle === null) {
    element.removeAttribute('laidOut');
    return null;
  }

  element.setAttribute('laidOut', '');

  if (rowModifier && rowSpanModifier && layoutStyle.gridRowStart && layoutStyle.gridRowEnd) {
    const start = layoutStyle.gridRowStart,
      end = layoutStyle.gridRowEnd;
    layoutStyle.gridRowStart = rowModifier(start);
    layoutStyle.gridRowEnd = layoutStyle.gridRowStart + rowSpanModifier(end - start);
    // console.log('row', start, layoutStyle.gridRowStart, end, layoutStyle.gridRowEnd);
  }

  if (
    columnModifier &&
    columnSpanModifier &&
    layoutStyle.gridColumnStart &&
    layoutStyle.gridColumnEnd
  ) {
    const start = layoutStyle.gridColumnStart,
      end = layoutStyle.gridColumnEnd;
    layoutStyle.gridColumnStart = columnModifier(start);
    layoutStyle.gridColumnEnd = layoutStyle.gridColumnStart + columnSpanModifier(end - start);
    // console.log('col', start, layoutStyle.gridColumnStart, end, layoutStyle.gridColumnEnd);
  }

  let layoutNode: LayoutNode = {
    style: layoutStyle,
    layout: { x: 0, y: 0, width: 0, height: 0 },
    children: [],
  };

  const contentPlacement = parseContentPlacement(element);

  for (var i = 0; i < element.children.length; ++i) {
    const childElement = element.children[i] as LaidOutElement;
    const childLayoutNode = parseElementHierarchy(
      childElement,
      getPositionModifier(contentPlacement.align),
      getSpanModifier(contentPlacement.align),
      getPositionModifier(contentPlacement.justify),
      getSpanModifier(contentPlacement.justify)
    );
    if (childLayoutNode) layoutNode.children.push(childLayoutNode);
  }

  if (contentPlacement.align !== 'stretch' || contentPlacement.justify !== 'stretch') {
    const style = layoutNode.style,
      rows = style.gridTemplateRows!,
      columns = style.gridTemplateColumns!,
      align = contentPlacement.align,
      justify = contentPlacement.justify;
    style.gridTemplateRows = applyContentPlacementToGridTemplate(align, rows);
    style.gridTemplateColumns = applyContentPlacementToGridTemplate(justify, columns);
  }

  const padding = parsePadding(element);
  if (padding.left > 0 || padding.right > 0 || padding.top > 0 || padding.bottom > 0) {
    const paddingLayoutNode: LayoutNode = {
      style: {
        ...layoutNode.style,
        gridTemplateRows: `${padding.top} 1fr ${padding.bottom}`,
        gridTemplateColumns: `${padding.left} 1fr ${padding.right}`,
        display: 'grid',
      },
      layout: { x: 0, y: 0, width: 0, height: 0 },
      children: [layoutNode],
    };
    delete paddingLayoutNode.style.width;
    delete paddingLayoutNode.style.height;
    layoutNode.style.gridRowStart = 2;
    layoutNode.style.gridRowEnd = 3;
    layoutNode.style.gridColumnStart = 2;
    layoutNode.style.gridColumnEnd = 3;

    layoutNode = paddingLayoutNode;
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
  const rect = layoutNode.layout;

  const padding = parsePadding(element);
  if (padding.left > 0 || padding.right > 0 || padding.top > 0 || padding.bottom > 0) {
    layoutNode = layoutNode.children[0];
    const childRect = layoutNode.layout;
    rect.x += childRect.x;
    rect.y += childRect.y;
  }

  element.setAttribute('layout', rectToString(rect));

  let notLaidOutChildCount = 0;
  for (let i = 0; i < element.children.length; ++i) {
    const childElement = element.children[i] as LaidOutElement;
    let childLayoutNode = layoutNode.children[i - notLaidOutChildCount];

    const childLaidOut = setLayoutAttributes(childElement, childLayoutNode);
    notLaidOutChildCount += childLaidOut ? 0 : 1;
  }

  return true;
}
