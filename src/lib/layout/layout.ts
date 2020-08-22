import { Component, nullComponent } from '../component';
import { select, Selection, BaseType } from 'd3-selection';
import { nullFunction, getComputedStyleWithoutDefaults, PrimitiveObject } from '../utils';
import { computeLayout as faberComputeLayout } from './faberjs';

export interface Layout {
  (selection: Selection<SVGElement, unknown, BaseType, unknown>): void;
  components(components?: Component[]): Component[] | Layout;
  resize(): void;
  layoutOfElement(element: SVGElement): DOMRect | null;
}

export function layout(): Layout {
  let _components: Component[] = [nullComponent()];
  let _updateComponents = nullFunction;
  let _resize = nullFunction;
  let _layoutOfElement: (element: SVGElement) => DOMRect | null;

  const renderedLayout = function renderedLayout(
    selection: Selection<SVGElement, unknown, HTMLElement, unknown>
  ) {
    for (let i = 0; i < _components.length; ++i) {
      _components[i](selection);
    }

    let { laidOutElements, layoutHierarchyNodes } = parseDOMHierarchy(selection.node()!);
    const layoutGroupElements = createLayoutGroups(laidOutElements);

    _resize = function (): void {
      let boundingRect = selection.node()!.getBoundingClientRect();
      computeLayout(laidOutElements, layoutHierarchyNodes, boundingRect);
      applyLayout(layoutGroupElements, layoutHierarchyNodes, false);

      for (let i = 0; i < _components.length; ++i) {
        _components[i].resize(renderedLayout);
      }
    };

    _layoutOfElement = function (element: SVGElement): DOMRect | null {
      const index = laidOutElements.indexOf(element);
      if (index < 0) {
        return null;
      }
      return layoutHierarchyNodes[index].layout;
    };

    _updateComponents = function (): void {};
  };

  renderedLayout.resize = function resize(): void {
    _resize();
  };

  renderedLayout.components = function (components?: Component[]): Component[] | Layout {
    if (!arguments.length) return _components;
    _components = components || [nullComponent()];
    _updateComponents();
    return renderedLayout;
  };

  renderedLayout.layoutOfElement = function (element: SVGElement): DOMRect | null {
    return _layoutOfElement(element);
  };

  return renderedLayout;
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
export function parseLayoutStyle(element: SVGElement): PrimitiveObject | null {
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
  layout: DOMRect;
  children: LayoutHierarchyNode[];
};

function parseDOMHierarchy(
  element: SVGElement
): { laidOutElements: SVGElement[]; layoutHierarchyNodes: LayoutHierarchyNode[] } {
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
    layout: new DOMRect(),
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
  layoutHierarchyNodes: LayoutHierarchyNode[],
  transition: boolean
) {
  for (let i = 1; i < layoutHierarchyNodes.length; ++i) {
    select(layoutGroupElements[i])
      .classed('transition', transition)
      .style(
        'transform',
        `translate(${layoutHierarchyNodes[i].layout.x}px, ${layoutHierarchyNodes[i].layout.y}px)`
      );

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
