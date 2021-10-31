import { ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { select, Selection } from 'd3-selection';
import { debug, findByDataProperty, nodeToString } from '../core';
import { Rect, rectFitStroke, rectMinimized, rectToAttrs } from '../core/utility/rect';
import { Transition } from 'd3-transition';
import { easeCubicOut } from 'd3-ease';
import { Size } from '../core/utils';
import {
  ScaleBandConfig,
  ScaleContinuousConfig,
  ScaleContinuousType,
  d3ScaleBand,
  d3ScaleContinuous,
} from '../core/scale';
import {
  TooltipPositionConfig,
  tooltipContent,
  tooltipShow,
  tooltipHide,
  tooltipPosition,
} from '../tooltip';
import toPX from 'to-px';
import { DataHydrateFn } from '../core/utility/data';
import { scaleBand } from 'd3-scale';

export interface Bar extends Rect {
  category: string;
  categoryIndex: number;
  value: number;
  key: string;
}

export interface SeriesBar {
  categories: string[];
  values: number[];
  categoryScale: ScaleBand<string>;
  valueScale: ScaleContinuousNumeric<number, number>;
  categoryIndices: number[];
  flipped: boolean;
  tooltipsEnabled: boolean;
  tooltips: (item: SVGRectElement, data: Bar) => string | Element;
  tooltipPosition: (
    item: SVGRectElement,
    data: Bar,
    mouseEvent: MouseEvent
  ) => TooltipPositionConfig;

  bounds: Size;
}

export function seriesBarDataHydrate(data: Partial<SeriesBar>): SeriesBar {
  const categories = data.categories || [];
  const values = data.values || [];
  const categoryScale = data.categoryScale || scaleBand().domain(categories).padding(0.1);
  const valueScale =
    data.valueScale ||
    scaleLinear()
      .domain([0, Math.max(...values)])
      .nice();
  const flipped = data.flipped ?? false;
  const bounds = data.bounds || { width: 600, height: 400 };

  return {
    bounds: bounds,
    categories,
    categoryIndices: data.categoryIndices || categories.map((_, i) => i),
    categoryScale: categoryScale,
    values,
    valueScale: valueScale,
    flipped: flipped,
    tooltipsEnabled: data.tooltipsEnabled ?? true,
    tooltips: data.tooltips || ((e, d) => `Category: ${d.category}<br/>Value: ${d.value}`),
    tooltipPosition:
      data.tooltipPosition ||
      ((e, d, mouseEvent) => ({ position: { x: mouseEvent.clientX, y: mouseEvent.clientY } })),
  };
}

export function seriesBarCreateBars(seriesData: SeriesBar): Bar[] {
  const { categories, categoryScale, values, valueScale, categoryIndices, flipped, bounds } =
    seriesData;

  if (!flipped) {
    categoryScale.range([0, bounds.width]);
    valueScale.range([bounds.height, 0]);
  } else {
    categoryScale.range([0, bounds.height]);
    valueScale.range([0, bounds.width]);
  }

  const data: Bar[] = [];

  for (let i = 0; i < values.length; ++i) {
    const c = categories[i],
      v = values[i],
      rect: Rect = {
        x: categoryScale(c)!,
        y: Math.min(valueScale(0)!, valueScale(v)!),
        width: categoryScale.bandwidth(),
        height: Math.abs(valueScale(0)! - valueScale(v)!),
      },
      flippedRect: Rect = {
        x: Math.min(valueScale(0)!, valueScale(v)!),
        y: categoryScale(c)!,
        width: Math.abs(valueScale(0)! - valueScale(v)!),
        height: categoryScale.bandwidth(),
      },
      bar: Bar = {
        category: c,
        value: v,
        categoryIndex: categoryIndices[i],
        key: c,
        ...(flipped ? flippedRect : rect),
      };
    data.push(bar);
  }
  return data;
}

export function seriesBar(
  selection: Selection<Element, Partial<SeriesBar>>,
  dataHydrate: DataHydrateFn<SeriesBar> = seriesBarDataHydrate
): void {
  selection
    .classed('series-bar', true)
    .attr('ignore-layout-children', true)
    .each(function (d) {
      debug(`render bar series on ${nodeToString(this)}`);
      const seriesD = dataHydrate(d);
      const seriesS = select(this);
      const bounds = seriesS.bounds();
      if (!bounds) return;
      seriesD.bounds = bounds;
      seriesS
        .selectAll<SVGRectElement, Bar>('rect')
        .data(seriesBarCreateBars(seriesD), (d) => d.category)
        .call((s) => seriesBarJoin(seriesS, s));
    })
    .on('mouseover.highlight mouseout.highlight', (e: MouseEvent) =>
      (<Element>e.target).classList.toggle('highlight', e.type.endsWith('over'))
    )
    .on('mouseover.tooltip', (e, d) => {
      const { tooltips, tooltipsEnabled } = dataHydrate(d);
      const item = <SVGRectElement>e.target;
      if (!tooltipsEnabled || !item) return;
      const data = select<SVGRectElement, Bar>(item).datum();
      tooltipShow(null);
      tooltipContent(null, tooltips(item, data));
    })
    .on('mousemove.tooltip', (e: MouseEvent, d) => {
      const { tooltipsEnabled, tooltipPosition: position } = dataHydrate(d);
      const item = <SVGRectElement>e.target;
      if (!tooltipsEnabled || !item) return;
      const data = select<SVGRectElement, Bar>(item).datum();
      tooltipPosition(null, position(item, data, e));
    })
    .on('mouseout.tooltip', (e: MouseEvent, d) => {
      const { tooltipsEnabled } = dataHydrate(d);
      if (tooltipsEnabled) tooltipHide(null);
    });
}

export interface JoinEvent<GElement extends Element, Datum>
  extends CustomEvent<{ selection: Selection<GElement, Datum> }> {}

export interface JoinTransitionEvent<GElement extends Element, Datum>
  extends CustomEvent<{ transition: Transition<GElement, Datum> }> {}

export function seriesBarJoin(
  seriesSelection: Selection,
  joinSelection: Selection<SVGRectElement, Bar>
): void {
  joinSelection
    .join(
      (enter) =>
        enter
          .append('rect')
          .classed('bar', true)
          .call((s) => rectToAttrs(s, (d) => rectMinimized(d)))
          .call((s) => seriesSelection.dispatch('enter', { detail: { selection: s } })),
      undefined,
      (exit) =>
        exit
          .classed('exiting', true)
          .call((s) =>
            s
              .transition('minimize')
              .duration(250)
              .call((t) => rectToAttrs(t, (d) => rectMinimized(d)))
              .remove()
          )
          .call((s) => seriesSelection.dispatch('exit', { detail: { selection: s } }))
    )
    .call((s) =>
      s
        .transition('position')
        .duration(250)
        .ease(easeCubicOut)
        .call((t) =>
          rectToAttrs(t, (d, i, g) => rectFitStroke(d, toPX(select(g[i]).style('stroke-width'))!))
        )
    )
    .attr('category-index', (d) => d.categoryIndex)
    .attr('category', (d) => d.category)
    .call((s) => seriesSelection.dispatch('update', { detail: { selection: s } }));
}

export function barFind<Data extends Bar>(
  container: Selection,
  category: string
): Selection<SVGRectElement, Data> {
  return findByDataProperty<SVGRectElement, Data>(container, '.bar', 'category', category);
}
