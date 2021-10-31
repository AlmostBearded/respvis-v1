import { easeCubicOut } from 'd3-ease';
import { BaseType, select, selectAll, Selection } from 'd3-selection';
import { eventBroadcast } from './event';
import { debug, log, nodeToString } from './log';
import { renderQueueEnqueue, renderQueueRender } from './render-queue';
import { relativeBounds } from './utility/bounds';
import { positionToTransformAttr } from './utility/position';
import { rectEquals, rectFromString, rectToAttrs, rectToString } from './utility/rect';

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
    const layoutHeight = svgS.layout('height');
    const computedStyle = window.getComputedStyle(g[i]);
    const fitWidth = propTrue(computedStyle.getPropertyValue('--fit-width')) || layoutFitWidth;
    const fitHeight = propTrue(computedStyle.getPropertyValue('--fit-height')) || layoutFitHeight;
    // get layout string without width and height properties
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
  selection.each(function (svgE) {
    const svgS = select(svgE);
    const prevBounds = rectFromString(svgS.attr('bounds') || '0, 0, 0, 0');
    const bounds = relativeBounds(this);
    const changed = !rectEquals(prevBounds, bounds, 0.1);
    anyChanged = anyChanged || changed;
    if (changed) {
      debug(
        `bounds change on ${nodeToString(svgE)} from (${rectToString(
          prevBounds
        )}) to (${rectToString(bounds)})`
      );
      svgS.attr('bounds', rectToString(bounds));
      switch (svgE.tagName) {
        case 'svg':
        case 'rect':
          svgS.call((s) => rectToAttrs(s, bounds));
          break;
        default:
          svgS.call((s) => positionToTransformAttr(s, bounds));
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

function layedOutChildren(parent: Element): SVGElement[] {
  return select(parent)
    .filter(':not([ignore-layout-children])')
    .selectChildren<SVGElement, unknown>(':not([ignore-layout]):not(.layout)')
    .nodes();
}

export function layouter(selection: Selection<HTMLDivElement>): void {
  selection.classed('layouter', true);
}

export function layouterCompute(selection: Selection<HTMLDivElement>): void {
  selection.each(function () {
    const layouterS = select(this);
    const layoutRootS = layoutNodeRoot(this);

    let layoutS = layoutRootS;
    while (!layoutS.empty()) {
      layoutNodeClassAttr(layoutS);
      layoutNodeStyleAttr(layoutS);
      layoutS = layoutNodeChildren(layoutS);
    }

    let anyBoundsChanged = false;
    layouterS.selectAll<HTMLDivElement, SVGElement>('.layout').each(function () {
      const layoutS = select<HTMLDivElement, SVGElement>(this);
      const boundsChanged = layoutNodeBounds(layoutS);
      anyBoundsChanged = anyBoundsChanged || boundsChanged;
    });

    if (anyBoundsChanged) {
      const bounds = select(layoutRootS.datum()).bounds()!;
      layoutRootS
        .style('left', bounds.x)
        .style('top', bounds.y)
        .attr('x', null)
        .attr('y', null)
        .attr('width', null)
        .attr('height', null)
        .attr('viewBox', rectToString({ ...bounds, x: 0, y: 0 }));

      layouterS.dispatch('boundschange');
    }
  });
}
