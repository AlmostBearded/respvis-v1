import { select, selectAll, Selection } from 'd3-selection';
import { debug, nodeToString } from './utility/log';
import { renderQueueEnqueue, renderQueueRender } from './render-queue';
import { relativeBounds } from './utility/bounds';
import { positionToTransformAttr } from './utility/position';
import {
  rectCenter,
  rectBottomLeft,
  rectEquals,
  rectFromString,
  rectToAttrs,
  rectToString,
  rectTopRight,
} from './utility/rect';
import { circleInsideRect, circleToAttrs } from './utility/circle';

export interface Layouter {
  layoutNodeResizeObserver: ResizeObserver;
  svgNodeResizeObserver: ResizeObserver;
  layoutAttrMutationObserver: MutationObserver;
}

export function layouterData(layouter: HTMLDivElement): Layouter {
  const layoutNodeResizeObserver = new ResizeObserver((entries) => {
    select(layouter)
      .selectAll<HTMLDivElement, SVGElement>('.layout')
      .each((d, i, g) => {
        if (!d.isConnected) return;
        const layoutS = select<HTMLDivElement, SVGElement>(g[i]);
        layoutNodeObserveResize(layoutS, layoutNodeResizeObserver);
        layoutNodeStyleAttr(layoutS);
        layoutNodeBounds(layoutS) && renderQueueEnqueue(d);
      });

    selectAll(layedOutChildren(layouter)).call((s) => {
      const bounds = s.bounds()!;
      s.style('left', bounds.x)
        .style('top', bounds.y)
        .attr('x', null)
        .attr('y', null)
        .attr('width', null)
        .attr('height', null)
        .attr('viewBox', rectToString({ ...bounds, x: 0, y: 0 }));
    });

    renderQueueRender();
  });

  const svgNodeResizeObserver = new ResizeObserver((entries) => {
    select(layouter)
      .selectAll<HTMLDivElement, SVGElement>('.layout')
      .call((s) => layoutNodeStyleAttr(s));
  });

  const layoutAttrMutationObserver = new MutationObserver((mutations) => {
    let attrChanged = false;

    const uniqueMutationsByTargetAttribute = mutations.filter(
      (v, i, array) =>
        array.findIndex((v2) => v2.target === v.target && v2.attributeName === v.attributeName) ===
        i
    );

    for (let mutation of uniqueMutationsByTargetAttribute) {
      const target = mutation.target as Element;
      const value = target.getAttribute(mutation.attributeName!);
      if (mutation.oldValue !== value) {
        const fitRegex = /(width|height): fit;/;
        const oldFit = mutation.oldValue?.match(fitRegex) || false;
        const fit = target.getAttribute(mutation.attributeName!)?.match(fitRegex) || false;
        if (!oldFit && fit) svgNodeResizeObserver.observe(target);
        else if (oldFit && !fit) svgNodeResizeObserver.unobserve(target);
        attrChanged = true;
      }
    }

    if (attrChanged) {
      let layoutNodes = layoutNodeRoot(layouter);
      while (!layoutNodes.empty()) {
        layoutNodes = layoutNodeChildren(
          layoutNodes.call((s) => layoutNodeStyleAttr(s)).call((s) => layoutNodeClassAttr(s))
        );
      }
    }
  });

  return {
    layoutNodeResizeObserver: layoutNodeResizeObserver,
    svgNodeResizeObserver: svgNodeResizeObserver,
    layoutAttrMutationObserver: layoutAttrMutationObserver,
  };
}

function layoutNodeRoot(layouter: HTMLDivElement): Selection<HTMLDivElement, SVGElement> {
  return select(layouter)
    .selectChildren<HTMLDivElement, SVGElement>('.layout')
    .data(layedOutChildren(layouter))
    .join('div');
}

function layoutNodeStyleAttr(selection: Selection<HTMLDivElement, SVGElement>): void {
  selection.each((d, i, g) => {
    const svgS = select(d);
    const propTrue = (p: string) => p.trim() === 'true';
    const layoutFitWidth = propTrue(svgS.layout('--fit-width') || '');
    const layoutFitHeight = propTrue(svgS.layout('--fit-height') || '');
    const layoutWidth = svgS.layout('width');
    const layoutHeight = svgS.layout('width');
    const computedStyle = window.getComputedStyle(g[i]);
    const fitWidth = propTrue(computedStyle.getPropertyValue('--fit-width')) || layoutFitWidth;
    const fitHeight = propTrue(computedStyle.getPropertyValue('--fit-height')) || layoutFitHeight;
    const layout = (d.getAttribute('layout') || '')
      .replace(/(?<![-a-zA-Z])(width|height):.*?;/g, '')
      .trim();

    let style = '';
    let width = layoutWidth;
    let height = layoutHeight;
    if ((!width && fitWidth) || (!height && fitHeight)) {
      const bbox = d.getBoundingClientRect();
      if (fitWidth) width = `${bbox.width}px`;
      if (fitHeight) height = `${bbox.height}px`;
    }
    if (width) {
      style += `width: ${width};`;
    }
    if (height) {
      style += `height: ${height};`;
    }
    style += layout;
    g[i].setAttribute('style', style);
  });
}

function layoutNodeClassAttr(selection: Selection<HTMLDivElement, SVGElement>): void {
  selection
    .attr('class', (d) => d.getAttribute('class'))
    .each((d, i, g) => select(g[i]).classed(d.tagName, true))
    .classed('layout', true);
}

function layoutNodeBounds(selection: Selection<HTMLDivElement, SVGElement>): boolean {
  let anyChanged = false;
  selection.each((d, i, g) => {
    const svg = select(d);
    const prevBounds = rectFromString(svg.attr('bounds') || '0, 0, 0, 0');
    const bounds = relativeBounds(g[i]);
    const changed = !rectEquals(prevBounds, bounds, 0.1);
    anyChanged = anyChanged || changed;
    if (changed) {
      debug(
        `bounds change on ${nodeToString(svg.node()!)} from (${rectToString(
          prevBounds
        )}) to (${rectToString(bounds)})`
      );
      svg.attr('bounds', rectToString(bounds));
      switch (d.tagName) {
        case 'svg':
        case 'rect':
          svg.call((s) => rectToAttrs(s, bounds));
          break;
        case 'circle':
          svg.call((s) => circleToAttrs(s, circleInsideRect(bounds)));
          break;
        case 'line':
          const bottomLeft = rectBottomLeft(bounds);
          const topRight = rectTopRight(bounds);
          svg
            .attr('x1', bottomLeft.x)
            .attr('y1', bottomLeft.y)
            .attr('x2', topRight.x)
            .attr('y2', topRight.y);
          break;
        default:
          svg.call((s) => positionToTransformAttr(s, bounds));
      }
    }
  });
  return anyChanged;
}

function layoutNodeChildren(
  selection: Selection<HTMLDivElement, SVGElement>
): Selection<HTMLDivElement, SVGElement> {
  return selection
    .selectChildren<HTMLDivElement, SVGElement>('.layout')
    .data((d) => layedOutChildren(d))
    .join('div');
}

function layoutNodeObserveResize(
  selection: Selection<HTMLDivElement, SVGElement>,
  observer: ResizeObserver
): void {
  selection.each((d, i, g) => observer.observe(g[i]));
}

function layedOutChildren(parent: Element): SVGElement[] {
  return select(parent)
    .filter(':not([ignore-layout-children])')
    .selectChildren<SVGElement, unknown>(':not([ignore-layout]):not(.layout)')
    .nodes();
}

export function layouter(selection: Selection<HTMLDivElement, Layouter>): void {
  selection.classed('layouter', true).each((d, i, g) => {
    d.layoutNodeResizeObserver.observe(g[i]);
    d.layoutAttrMutationObserver.observe(g[i], {
      attributes: true,
      attributeFilter: ['layout', 'class'],
      attributeOldValue: true,
      subtree: true,
      childList: true,
    });
  });
}
