import { IComponent, IComponentConfig } from '../component';
import { select, Selection, BaseType } from 'd3-selection';
import {
  nullFunction,
  getComputedStyleWithoutDefaults,
  PrimitiveObject,
} from '../utils';
import { computeLayout as faberComputeLayout } from './faberjs';
import { Bar } from '../bars/bar-positioner';
import { stringify } from 'uuid';

export interface ILayout {
  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this;
  layout(layout: IComponent<IComponentConfig>): this;
  layout(): IComponent<IComponentConfig>;
  resize(): this;
  transition(): this;
  layoutOfElement(element: SVGElement): Bar | null;
}

export class Layout implements ILayout {
  private _layout: IComponent<IComponentConfig>;
  private _onTransition = nullFunction;

  private _selection: Selection<SVGElement, unknown, BaseType, unknown>;
  private _laidOutElements: Element[] = [];
  private _layoutHierarchyNodes: LayoutHierarchyNode[] = [];
  // private _layoutGroupElements: Element[] = [];

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    this._selection = selection;
    this._layout.mount(this._selection);
    ({
      laidOutElements: this._laidOutElements,
      layoutHierarchyNodes: this._layoutHierarchyNodes,
    } = parseDOMHierarchy(this._layout.selection().node()!));

    // this._layoutGroupElements = createLayoutGroups(this._laidOutElements);

    return this;
  }

  resize(): this {
    console.assert(
      this._selection,
      'Method must only be called on mounted component!'
    );
    let boundingRect = this._selection.node()!.getBoundingClientRect();
    computeLayout(
      this._laidOutElements,
      this._layoutHierarchyNodes,
      boundingRect
    );
    // applyLayout(this._layoutGroupElements, this._layoutHierarchyNodes);

    this._layout.fitInLayout(this).render();

    applyLayout(this._laidOutElements, this._layoutHierarchyNodes);

    return this;
  }

  transition(): this {
    console.assert(
      this._selection,
      'Method must only be called on mounted component!'
    );

    let boundingRect = this._selection.node()!.getBoundingClientRect();
    computeLayout(
      this._laidOutElements,
      this._layoutHierarchyNodes,
      boundingRect
    );
    // applyLayout(this._layoutGroupElements, this._layoutHierarchyNodes);

    this._layout.fitInLayout(this).render();

    applyLayout(this._laidOutElements, this._layoutHierarchyNodes);

    return this;
  }

  layout(layout?: IComponent<IComponentConfig>): any {
    if (layout === undefined) return this._layout;
    this._layout = layout;
    // TODO: update components if called after mount
    return this;
  }

  layoutOfElement(element: SVGElement): Bar | null {
    console.assert(
      this._selection,
      'Method must only be called on mounted component!'
    );
    const index = this._laidOutElements.indexOf(element);
    if (index < 0) {
      return null;
    }
    return this._layoutHierarchyNodes[index].layout;
  }
}

export function layout(): Layout {
  return new Layout();
}

type LayoutHierarchyNode = {
  style: ILayoutStyle;
  layout: Bar;
  children: LayoutHierarchyNode[];
};

function parseLayoutStyle(element: Element): ILayoutStyle | null {
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
    height = attr('height');

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

    width: width || undefined,
    height: height || undefined,
  };

  if (style.gridTemplateRows || style.gridTemplateColumns)
    style.display = 'grid';

  if (!style.display && !style.gridRowStart && !style.gridColumnStart)
    return null;

  return style;
}

function parseDOMHierarchy(
  element: Element
): {
  laidOutElements: Element[];
  layoutHierarchyNodes: LayoutHierarchyNode[];
} {
  var laidOutElements: Element[] = [];
  var layoutHierarchyNodes: LayoutHierarchyNode[] = [];
  parseDOMHierarchyRecursive(element, laidOutElements, layoutHierarchyNodes);
  return { laidOutElements, layoutHierarchyNodes };
}

// Parse the DOM hierarchy recursively and create the layout hierarchy needed for FaberJS
function parseDOMHierarchyRecursive(
  element: Element,
  laidOutElements: Element[],
  layoutHierarchyNodes: LayoutHierarchyNode[]
) {
  var hierarchyNode: LayoutHierarchyNode = {
    style: {},
    layout: { x: 0, y: 0, width: 0, height: 0 },
    children: [],
  };

  layoutHierarchyNodes.push(hierarchyNode);
  laidOutElements.push(element);

  for (var i = 0; i < element.children.length; ++i) {
    var childElement = element.children[i];
    if (!parseLayoutStyle(childElement)) continue;
    var childHierarchyNode = parseDOMHierarchyRecursive(
      childElement,
      laidOutElements,
      layoutHierarchyNodes
    );
    hierarchyNode.children.push(childHierarchyNode);
  }

  return hierarchyNode;
}

// Create group elements to encapsulate laid out elements
function createLayoutGroups(laidOutElements: Element[]): Element[] {
  // The root element does not to be laid out so we don't need to create a group for it.
  var groupElements: Element[] = [laidOutElements[0]];

  for (var i = 1; i < laidOutElements.length; ++i) {
    var groupElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'g'
    );
    groupElement.setAttribute('class', 'layout-group');
    laidOutElements[i].parentNode!.append(groupElement);
    groupElement.append(laidOutElements[i]);
    groupElements.push(groupElement);
  }
  return groupElements;
}

// Cache CSS layout properties in the FaberJS layout hierarchy
function cacheLayoutStyles(
  laidOutElements: Element[],
  layoutHierarchyNodes: LayoutHierarchyNode[]
) {
  for (var i = 0; i < laidOutElements.length; ++i) {
    layoutHierarchyNodes[i].style = parseLayoutStyle(laidOutElements[i])!;
  }
}

// Set dimensions of layout nodes whose CSS dimensions property is specified as 'min-content'
function setMinContentDimensions(
  laidOutElements: Element[],
  layoutHierarchyNodes: LayoutHierarchyNode[]
) {
  for (var i = 0; i < laidOutElements.length; ++i) {
    var boundingRect = laidOutElements[i].getBoundingClientRect();

    if (layoutHierarchyNodes[i].style.width === 'min-content') {
      layoutHierarchyNodes[i].style.width = boundingRect.width;
    }

    if (layoutHierarchyNodes[i].style.height === 'min-content') {
      layoutHierarchyNodes[i].style.height = boundingRect.height;
    }
  }
}

// Set dimensions of all layout nodes which were unspecified before layouting
function setLayoutDimensions(layoutHierarchyNodes: LayoutHierarchyNode[]) {
  for (var i = 0; i < layoutHierarchyNodes.length; ++i) {
    if (!layoutHierarchyNodes[i].style.width) {
      layoutHierarchyNodes[i].style.width =
        layoutHierarchyNodes[i].layout.width;
    }

    if (!layoutHierarchyNodes[i].style.height) {
      layoutHierarchyNodes[i].style.height =
        layoutHierarchyNodes[i].layout.height;
    }
  }
}

// Compute the layout to fit into the specified size
function computeLayout(
  laidOutElements: Element[],
  layoutHierarchyNodes: LayoutHierarchyNode[],
  size: { width: number; height: number }
) {
  cacheLayoutStyles(laidOutElements, layoutHierarchyNodes);

  layoutHierarchyNodes[0].style.width = size.width;
  layoutHierarchyNodes[0].style.height = size.height;

  setMinContentDimensions(laidOutElements, layoutHierarchyNodes);

  faberComputeLayout(layoutHierarchyNodes[0]);

  setLayoutDimensions(layoutHierarchyNodes);

  faberComputeLayout(layoutHierarchyNodes[0]);
}

// Apply the computed layout on the layout group elements
function applyLayout(
  // layoutGroupElements: Element[],
  laidOutElements: Element[],
  layoutHierarchyNodes: LayoutHierarchyNode[]
) {
  for (let i = 0; i < layoutHierarchyNodes.length; ++i) {
    const layoutTransform = `translate(${
      Math.round(layoutHierarchyNodes[i].layout.x * 10) / 10
    }, ${Math.round(layoutHierarchyNodes[i].layout.y * 10) / 10})`;

    const previousTransform =
      laidOutElements[i].getAttribute('previous-transform') || '';

    let transform = laidOutElements[i].getAttribute('transform') || '';

    if (previousTransform === transform) {
      transform = transform.substring(transform.indexOf(')') + 1);
    }

    transform = layoutTransform.concat(transform);

    laidOutElements[i].setAttribute('transform', transform);
    laidOutElements[i].setAttribute('previous-transform', transform);

    // layoutGroupElements[i].setAttribute(
    //   'debugLayout',
    //   `${layoutHierarchyNodes[i].layout.x}, ${layoutHierarchyNodes[i].layout.y}, ${layoutHierarchyNodes[i].layout.width}, ${layoutHierarchyNodes[i].layout.height}`
    // );

    // layoutGroupElements[i].setAttribute(
    //   'debugLayoutStyle',
    //   `${JSON.stringify(layoutHierarchyNodes[i].style)
    //     .replace(/\"/g, '')
    //     .replace(/,/g, ', ')
    //     .replace(/:/g, ': ')}`
    // );
  }
}

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

export enum Alignment {
  Start = 'start',
  Center = 'center',
  End = 'end',
  Stretch = 'stretch',
}
