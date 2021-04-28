import { Size } from '../utils';
import { computeLayout as faberComputeLayout } from './faberjs';
import { Rect, rectToString } from '../rect';
import { select, Selection } from 'd3-selection';

type FaberNode = {
  style: FaberStyle;
  layout: Rect<number>;
  children: FaberNode[];
};

export interface FaberStyle {
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

export function computeLayout(selection: Selection<Element, any, any, any>, size: Size) {
  // 1st Phase
  const root = parseHierarchy(selection)!;
  root.style.width = size.width;
  root.style.height = size.height;
  faberComputeLayout(root);

  // 2nd Phase
  setCalculatedDimensions(root);
  faberComputeLayout(root);

  setLayoutAttributes(selection, root);
}

function parseHierarchy(
  selection: Selection<Element, any, any, any>,
  rowModifier?: (row: number) => number,
  rowSpanModifier?: (span: number) => number,
  columnModifier?: (column: number) => number,
  columnSpanModifier?: (span: number) => number
): FaberNode | null {
  const style = parseLayout(selection);

  // todo: get rid of laid out attribute?
  if (!style) {
    selection.attr('laidOut', null);
    return null;
  }
  selection.attr('laidOut', '');

  if (rowModifier && rowSpanModifier && style.gridRowStart && style.gridRowEnd) {
    const start = style.gridRowStart,
      end = style.gridRowEnd;
    style.gridRowStart = rowModifier(start);
    style.gridRowEnd = style.gridRowStart + rowSpanModifier(end - start);
    // console.log('row', start, layoutStyle.gridRowStart, end, layoutStyle.gridRowEnd);
  }

  if (columnModifier && columnSpanModifier && style.gridColumnStart && style.gridColumnEnd) {
    const start = style.gridColumnStart,
      end = style.gridColumnEnd;
    style.gridColumnStart = columnModifier(start);
    style.gridColumnEnd = style.gridColumnStart + columnSpanModifier(end - start);
    // console.log('col', start, layoutStyle.gridColumnStart, end, layoutStyle.gridColumnEnd);
  }

  let node: FaberNode = {
    style: style,
    layout: { x: 0, y: 0, width: 0, height: 0 },
    children: [],
  };

  const contentPlacement = parseContentPlacement(selection);

  for (let i = 0; i < selection.node()!.children.length; ++i) {
    const childElement = selection.node()!.children[i];
    const childLayoutNode = parseHierarchy(
      select(childElement),
      getPositionModifier(contentPlacement.align),
      getSpanModifier(contentPlacement.align),
      getPositionModifier(contentPlacement.justify),
      getSpanModifier(contentPlacement.justify)
    );
    if (childLayoutNode) node.children.push(childLayoutNode);
  }

  if (contentPlacement.align !== 'stretch' || contentPlacement.justify !== 'stretch') {
    const style = node.style,
      rows = style.gridTemplateRows!,
      columns = style.gridTemplateColumns!,
      align = contentPlacement.align,
      justify = contentPlacement.justify;
    style.gridTemplateRows = applyContentPlacementToGridTemplate(align, rows);
    style.gridTemplateColumns = applyContentPlacementToGridTemplate(justify, columns);
  }

  const margin = parseMargin(selection);
  if (margin.left > 0 || margin.right > 0 || margin.top > 0 || margin.bottom > 0) {
    const marginLayoutNode: FaberNode = {
      style: {
        ...node.style,
        gridTemplateRows: `${margin.top} 1fr ${margin.bottom}`,
        gridTemplateColumns: `${margin.left} 1fr ${margin.right}`,
        display: 'grid',
      },
      layout: { x: 0, y: 0, width: 0, height: 0 },
      children: [node],
    };
    delete marginLayoutNode.style.width;
    delete marginLayoutNode.style.height;
    node.style.gridRowStart = 2;
    node.style.gridRowEnd = 3;
    node.style.gridColumnStart = 2;
    node.style.gridColumnEnd = 3;

    node = marginLayoutNode;
  }

  return node;
}

function parseLayout(selection: Selection<Element, any, any, any>): FaberStyle | null {
  const get = selection.attr.bind(selection);

  // todo: enable toggling of debug attributes
  // for (let key in element.__layout) {
  //   if (key === 'getBounds') continue;
  //   element.setAttribute(`layout-${key}`, element.__layout[key]);
  // }

  const trim = (s: string) => s.trim();
  const template = get('grid-template')?.split('/').map(trim),
    area = get('grid-area')?.split('/').map(trim),
    row = get('grid-row')?.split('/').map(trim),
    column = get('grid-column')?.split('/').map(trim),
    placeItems = get('place-items')?.split(' '),
    placeSelf = get('place-self')?.split(' ');

  const bbox = selection.node()!.getBoundingClientRect();

  const style: FaberStyle = {
    gridTemplateRows: get('grid-template-rows') || template?.[0],
    gridTemplateColumns: get('grid-template-columns') || template?.[1],

    gridRowStart: parseInt(get('grid-row-start') || row?.[0] || area?.[0]) || undefined,
    gridRowEnd: parseInt(get('grid-row-end') || row?.[1] || area?.[2]) || undefined,
    gridColumnStart: parseInt(get('grid-column-start') || column?.[0] || area?.[1]) || undefined,
    gridColumnEnd: parseInt(get('grid-column-end') || column?.[1] || area?.[3]) || undefined,

    alignItems: get('align-items') || placeItems?.[0],
    justifyItems: get('justify-items') || placeItems?.[1] || placeItems?.[0],
    alignSelf: get('align-self') || placeSelf?.[0],
    justifySelf: get('justify-self') || placeSelf?.[1] || placeSelf?.[0],

    width: (get('grid-width') === 'fit' ? bbox!.width : get('grid-width')) || undefined,
    height: (get('grid-height') === 'fit' ? bbox!.height : get('grid-height')) || undefined,
  };

  if (style.gridTemplateRows || style.gridTemplateColumns) style.display = 'grid';

  // delete undefined properties
  Object.keys(style).forEach((key) => style[key] === undefined && delete style[key]);
  if (Object.keys(style).length === 0) return null;

  return style;
}

function parseMargin(
  selection: Selection<Element, any, any, any>
): { left: number; right: number; top: number; bottom: number } {
  const get = selection.attr.bind(selection);
  return {
    left: parseFloat(get('margin-left') || get('margin-horizontal') || get('margin') || '0'),
    right: parseFloat(get('margin-right') || get('margin-horizontal') || get('margin') || '0'),
    top: parseFloat(get('margin-top') || get('margin-vertical') || get('margin') || '0'),
    bottom: parseFloat(get('margin-bottom') || get('margin-vertical') || get('margin') || '0'),
  };
}

function parseContentPlacement(
  selection: Selection<Element, any, any, any>
): { justify: string; align: string } {
  const get = selection.attr.bind(selection);
  return {
    align: get('align-content') || get('place-content')?.split(' ')[0] || 'stretch',
    justify: get('justify-content') || get('place-content')?.split(' ')[1] || 'stretch',
  };
}

function getPositionModifier(placement: string): (position: number) => number {
  const p = placement;
  if (p === 'start' || p === 'stretch') return (position) => position;
  if (p === 'center' || p === 'end') return (position) => position + 1;
  if (p === 'space-around') return (position) => 2 + (position - 1) * 3;
  if (p === 'space-between') return (position) => 1 + (position - 1) * 2;
  if (p === 'space-evenly') return (position) => position * 2;

  console.assert(false, 'should never reach this location');
  return (position) => position;
}

function getSpanModifier(placement: string): (span: number) => number {
  const p = placement;
  if (p === 'start' || p === 'center' || p === 'end' || p === 'stretch') return (span) => span;
  if (p === 'space-around') return (span) => span + (span - 1) * 2;
  if (p === 'space-between' || p === 'space-evenly') return (span) => span + (span - 1);

  console.assert(false, 'should never reach this location');
  return (span) => span;
}

function applyContentPlacementToGridTemplate(contentPlacement: string, template: string): string {
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

function setCalculatedDimensions(layoutNode: FaberNode) {
  layoutNode.style.width = layoutNode.layout.width;
  layoutNode.style.height = layoutNode.layout.height;
  for (let i = 0; i < layoutNode.children.length; ++i) {
    setCalculatedDimensions(layoutNode.children[i]);
  }
}

function setLayoutAttributes(
  selection: Selection<Element, any, any, any>,
  node: FaberNode
): boolean {
  if (selection.attr('laidOut') === null) return false;

  const layout = node.layout;

  const margin = parseMargin(selection);
  if (margin.left > 0 || margin.right > 0 || margin.top > 0 || margin.bottom > 0) {
    node = node.children[0];
    const childRect = node.layout;
    layout.x += childRect.x;
    layout.y += childRect.y;
  }

  Object.keys(layout).forEach((k) => (layout[k] = Math.round(layout[k] * 100) / 100));

  selection.attr('layout', rectToString(layout));

  let notLaidOutChildCount = 0;
  for (let i = 0; i < selection.node()!.children.length; ++i) {
    const childElement = selection.node()!.children[i];
    let childNode = node.children[i - notLaidOutChildCount];

    const childLaidOut = setLayoutAttributes(select(childElement), childNode);
    notLaidOutChildCount += childLaidOut ? 0 : 1;
  }

  return true;
}
