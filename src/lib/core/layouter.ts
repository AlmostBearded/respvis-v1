import { easeCubicOut } from 'd3-ease';
import { BaseType, select, selectAll, Selection } from 'd3-selection';
import { eventBroadcast } from './event';
import { debug, log, nodeToString } from './log';
import { renderQueueEnqueue, renderQueueRender } from './render-queue';
import { relativeBounds } from './utility/bounds';
import { positionToTransformAttr } from './utility/position';
import { rectEquals, rectFromString, rectToAttrs, rectToString } from './utility/rect';

export interface DataLayouter {
  layoutNodeResizeObserver: ResizeObserver;
  svgNodeResizeObserver: ResizeObserver;
  layoutAttrMutationObserver: MutationObserver;
}

export function dataLayouter(layouter: HTMLDivElement): DataLayouter {
  const layoutNodeResizeObserver = new ResizeObserver((entries) => {
    const changedNodePaths: number[][] = [];

    select(layouter)
      .selectAll<HTMLDivElement, SVGElement>('.layout')
      .call((s) => layoutNodeObserveResize(s, layoutNodeResizeObserver))
      .call((s) => layoutNodeStyleAttr(s))
      .each((d, i, g) => layoutNodeBounds(select(g[i])) && renderQueueEnqueue(d));

    select(layouter)
      .selectChildren('[layout]')
      .call((s) => {
        const bounds = s.bounds()!;
        s.style('left', bounds.x).style('top', bounds.y).attr('x', null).attr('y', null);
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
    .join('div')
    .each((d) => select(d).layout('grid-area', 'chart / chart').style('position', 'absolute'));
}

function layoutNodeStyleAttr(selection: Selection<HTMLDivElement, SVGElement>): void {
  selection
    .attr('style', (d) =>
      d
        .getAttribute('layout')!
        // replace width/height: 'fit' with bbox width/height
        .replace(
          /(width|height): fit;/g,
          (_, captureGroup) => `${captureGroup}: ${d.getBoundingClientRect()[captureGroup]}px;`
        )
    )
    .style('pointer-events', 'none');
}

function layoutNodeClassAttr(selection: Selection<HTMLDivElement, SVGElement>): void {
  selection.attr('class', (d) => d.getAttribute('class')).classed('layout', true);
}

function layoutNodeBounds(selection: Selection<HTMLDivElement, SVGElement>): boolean {
  let anyChanged = false;
  selection.each((d, i, g) => {
    const svg = select(d);
    const prevBounds = rectFromString(svg.attr('bounds') || '0, 0, 0, 0');
    const bounds = relativeBounds(g[i]);
    const changed = !rectEquals(prevBounds, bounds);
    anyChanged = anyChanged || changed;
    if (changed) {
      debug(
        `bounds change on ${nodeToString(svg.node()!)} from (${rectToString(
          prevBounds
        )}) to (${rectToString(bounds)})`
      );
      svg.attr('bounds', rectToString(bounds));
      // const svgTransition = svg.transition('layout').duration(250).ease(easeCubicOut);
      switch (d.tagName) {
        case 'svg':
        case 'rect':
          svg.call((s) => rectToAttrs(s, bounds));
          // if (!svg.attr('x')) svg.call((s) => rectToAttrs(s, bounds));
          // else svgTransition.call((t) => rectToAttrs(t, bounds));
          break;
        default:
          svg.call((s) => positionToTransformAttr(s, bounds));
        // if (!svg.attr('transform')) svg.call((s) => positionToTransformAttr(s, bounds));
        // else svgTransition.call((t) => positionToTransformAttr(t, bounds));
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
  return select(parent).selectChildren<SVGElement, unknown>('[layout]').nodes();
}

export function layouter<Datum, PElement extends BaseType, PDatum>(
  selection: Selection<HTMLDivElement, Datum, PElement, PDatum>
): Selection<HTMLDivElement, Datum & DataLayouter, PElement, PDatum> {
  return selection
    .classed('layouter', true)
    .style('display', 'grid')
    .style('grid-template', '[chart] 1fr / [chart] 1fr')
    .style('width', '100%')
    .style('height', '100%')
    .style('position', 'relative')
    .datum((d, i, g) => Object.assign(d, dataLayouter(g[i])))
    .each((d, i, g) => {
      d.layoutNodeResizeObserver.observe(g[i]);
      d.layoutAttrMutationObserver.observe(g[i], {
        attributes: true,
        attributeFilter: ['layout', 'class'],
        attributeOldValue: true,
        subtree: true,
      });
    });
}
