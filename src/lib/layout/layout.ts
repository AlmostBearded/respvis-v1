import { IComponent, NullComponent } from '../component';
import { select, Selection, BaseType } from 'd3-selection';
import { nullFunction, getComputedStyleWithoutDefaults, PrimitiveObject } from '../utils';
import { computeLayout as faberComputeLayout } from './faberjs';
import { Bar } from '../bars/bar-positioner';

export interface ILayout {
  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this;
  layout(layout: IComponent): this;
  layout(): IComponent;
  resize(): this;
  transition(): this;
  layoutOfElement(element: SVGElement): Bar | null;
}

export class Layout implements ILayout {
  private _layout: IComponent;
  private _onTransition = nullFunction;

  private _selection: Selection<SVGElement, unknown, BaseType, unknown>;
  private _laidOutElements: SVGElement[] = [];
  private _layoutHierarchyNodes: LayoutHierarchyNode[] = [];
  private _layoutGroupElements: SVGElement[] = [];

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    this._selection = selection;
    this._layout.mount(this._selection);
    ({
      laidOutElements: this._laidOutElements,
      layoutHierarchyNodes: this._layoutHierarchyNodes,
    } = parseDOMHierarchy(this._layout.selection().node()!));

    this._layoutGroupElements = createLayoutGroups(this._laidOutElements);

    return this;
  }

  resize(): this {
    console.assert(this._selection, 'Method must only be called on mounted component!');
    let boundingRect = this._selection.node()!.getBoundingClientRect();
    computeLayout(this._laidOutElements, this._layoutHierarchyNodes, boundingRect);
    applyLayout(this._layoutGroupElements, this._layoutHierarchyNodes);

    this._layout.fitInLayout(this).render(0);

    return this;
  }

  transition(): this {
    console.assert(this._selection, 'Method must only be called on mounted component!');

    let boundingRect = this._selection.node()!.getBoundingClientRect();
    computeLayout(this._laidOutElements, this._layoutHierarchyNodes, boundingRect);
    applyLayout(this._layoutGroupElements, this._layoutHierarchyNodes);

    this._layout.fitInLayout(this).render(1000);

    return this;
  }

  layout(layout?: IComponent): any {
    if (layout === undefined) return this._layout;
    this._layout = layout;
    // TODO: update components if called after mount
    return this;
  }

  layoutOfElement(element: SVGElement): Bar | null {
    console.assert(this._selection, 'Method must only be called on mounted component!');
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

// The CSS properties that are needed for layouting
var layoutProperties = [
  'width',
  'height',
  'display',
  'gridTemplateColumns',
  'gridTemplateRows',
  'gridColumnStart',
  'gridColumnEnd',
  'gridRowStart',
  'gridRowEnd',
  'justifyItems',
  'alignItems',
  'justifySelf',
  'alignSelf',
];

// Parse the required CSS properties for layouting from the elements computed style
function parseLayoutStyle(element: SVGElement): PrimitiveObject | null {
  // Get the computed style for the needed properties
  var computedStyle = getComputedStyleWithoutDefaults(element, layoutProperties);

  // Post-process the computed styles for FaberJS
  for (var i = 0; i < layoutProperties.length; ++i) {
    var value = computedStyle[layoutProperties[i]];
    if (value && typeof value === 'string') {
      // For some reason FaberJS behaves VERY oddly when some values (especially inside gridTemplateColumns/Rows)
      // have a specified absolute unit so we just remove all units.
      value = value.replace(/px/g, '');

      computedStyle[layoutProperties[i]] = value;
    }
  }

  // For some reason some browsers (confirmed with Firefox 79.0) report the width and height of some elements
  // (maybe it relates to the 'display: grid' property) as 0 which messes up the layouting. For now, there's
  // no known use case where an actual set width/height is useful so we just delete all of them that are 0.
  if (computedStyle.height == 0) delete computedStyle.height;
  if (computedStyle.width == 0) delete computedStyle.width;

  if (Object.keys(computedStyle).length === 0) {
    return null;
  }

  return computedStyle;
}

type LayoutHierarchyNode = {
  style: PrimitiveObject;
  layout: Bar;
  children: LayoutHierarchyNode[];
};

function parseDOMHierarchy(
  element: SVGElement
): {
  laidOutElements: SVGElement[];
  layoutHierarchyNodes: LayoutHierarchyNode[];
} {
  var laidOutElements: SVGElement[] = [];
  var layoutHierarchyNodes: LayoutHierarchyNode[] = [];
  parseDOMHierarchyRecursive(element, laidOutElements, layoutHierarchyNodes);
  return { laidOutElements, layoutHierarchyNodes };
}

// Parse the DOM hierarchy recursively and create the layout hierarchy needed for FaberJS
function parseDOMHierarchyRecursive(
  element: SVGElement,
  laidOutElements: SVGElement[],
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
    var childElement = element.children[i] as SVGElement;
    if (!parseLayoutStyle(childElement)) break;
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
function createLayoutGroups(laidOutElements: SVGElement[]): SVGElement[] {
  // The root element does not to be laid out so we don't need to create a group for it.
  var groupElements: SVGElement[] = [laidOutElements[0]];

  for (var i = 1; i < laidOutElements.length; ++i) {
    var groupElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    groupElement.setAttribute('class', 'layout-group');
    laidOutElements[i].parentNode!.append(groupElement);
    groupElement.append(laidOutElements[i]);
    groupElements.push(groupElement);
  }
  return groupElements;
}

// Cache CSS layout properties in the FaberJS layout hierarchy
function cacheLayoutStyles(
  laidOutElements: SVGElement[],
  layoutHierarchyNodes: LayoutHierarchyNode[]
) {
  for (var i = 0; i < laidOutElements.length; ++i) {
    layoutHierarchyNodes[i].style = parseLayoutStyle(laidOutElements[i])!;
  }
}

// Set dimensions of layout nodes whose CSS dimensions property is specified as 'min-content'
function setMinContentDimensions(
  laidOutElements: SVGElement[],
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
      layoutHierarchyNodes[i].style.width = layoutHierarchyNodes[i].layout.width;
    }

    if (!layoutHierarchyNodes[i].style.height) {
      layoutHierarchyNodes[i].style.height = layoutHierarchyNodes[i].layout.height;
    }
  }
}

// Compute the layout to fit into the specified size
function computeLayout(
  laidOutElements: SVGElement[],
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
  layoutGroupElements: SVGElement[],
  layoutHierarchyNodes: LayoutHierarchyNode[]
) {
  for (let i = 0; i < layoutHierarchyNodes.length; ++i) {
    const newTransform = `translate(${Math.round(layoutHierarchyNodes[i].layout.x * 10) / 10}px, ${
      Math.round(layoutHierarchyNodes[i].layout.y * 10) / 10
    }px)`;

    const groupSelection = select(layoutGroupElements[i]);
    groupSelection.style('transform', newTransform);

    layoutGroupElements[i].setAttribute(
      'debugLayout',
      `${layoutHierarchyNodes[i].layout.x}, ${layoutHierarchyNodes[i].layout.y}, ${layoutHierarchyNodes[i].layout.width}, ${layoutHierarchyNodes[i].layout.height}`
    );

    layoutGroupElements[i].setAttribute(
      'debugLayoutStyle',
      `${JSON.stringify(layoutHierarchyNodes[i].style)
        .replace(/\"/g, '')
        .replace(/,/g, ', ')
        .replace(/:/g, ': ')}`
    );
  }
}
