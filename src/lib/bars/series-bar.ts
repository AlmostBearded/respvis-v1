import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { select, Selection } from 'd3-selection';
import {
  arrayIs,
  COLORS_CATEGORICAL,
  debug,
  findByDataProperty,
  findByKey,
  nodeToString,
} from '../core';
import { Rect, rectFitStroke, rectMinimized, rectToAttrs } from '../core/utility/rect';
import { Transition } from 'd3-transition';
import { easeCubicOut } from 'd3-ease';
import { filterBrightness } from '../filters';
import { Size } from '../core/utils';
import {
  SeriesConfigTooltips,
  seriesConfigTooltipsData,
  seriesConfigTooltipsHandleEvents,
} from '../tooltip';
import toPX from 'to-px';

export interface Bar extends Rect {
  category: string;
  categoryIndex: number;
  value: number;
  key: string;
}

export interface SeriesBar extends SeriesConfigTooltips<SVGRectElement, Bar> {
  categories: any[];
  categoryScale: ScaleBand<any>;
  values: number[];
  valueScale: ScaleContinuousNumeric<number, number>;
  keys: string[];
  categoryIndices?: number[];
  flipped: boolean;
  bounds: Size;
}

export function seriesBarData(data: Partial<SeriesBar>): SeriesBar {
  const categories = data.categories || [];
  return {
    bounds: data.bounds || { width: 600, height: 400 },
    categories: categories,
    categoryIndices: data.categoryIndices,
    categoryScale: data.categoryScale || scaleBand().domain(categories).padding(0.1),
    values: data.values || [],
    valueScale:
      data.valueScale ||
      scaleLinear()
        .domain([0, Math.max(...(data.values || []))])
        .nice(),
    flipped: data.flipped || false,
    keys: data.keys || categories,
    ...seriesConfigTooltipsData<SVGRectElement, Bar>(data),
    tooltipsEnabled: data.tooltipsEnabled || true,
    tooltips:
      data.tooltips || ((element, data) => `Category: ${data.category}<br/>Value: ${data.value}`),
  };
}

export function seriesBarCreateBars(seriesData: SeriesBar): Bar[] {
  const { categories, categoryScale, values, valueScale, keys, categoryIndices, flipped, bounds } =
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
        key: keys?.[i] || i.toString(),
        categoryIndex: categoryIndices === undefined ? i : categoryIndices[i],
        ...(flipped ? flippedRect : rect),
      };
    data.push(bar);
  }
  return data;
}

export function seriesBar(selection: Selection<Element, SeriesBar>): void {
  selection
    .classed('series-bar', true)
    .attr('ignore-layout-children', true)
    .on('datachange.seriesbar', function () {
      debug(`data change on ${nodeToString(this)}`);
      select(this).dispatch('render');
    })
    .on('render.seriesbar', function (e, d) {
      const series = select<Element, SeriesBar>(this);
      const bounds = series.bounds();
      if (!bounds) return;
      debug(`render bar series on ${nodeToString(this)}`);
      d.bounds = bounds;
      series
        .selectAll<SVGRectElement, Bar>('rect')
        .data(seriesBarCreateBars(d), (d) => d.key)
        .call((s) => seriesBarJoin(series, s));
    })
    .on('mouseover.seriesbarhighlight mouseout.seriesbarhighlight', (e: MouseEvent) =>
      (<Element>e.target).classList.toggle('highlight', e.type.endsWith('over'))
    )
    .call((s) => seriesConfigTooltipsHandleEvents(s));
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
  key: string
): Selection<SVGRectElement, Data> {
  return findByKey<SVGRectElement, Data>(container, '.bar', key);
}

export function barFindByCategory<Data extends Bar>(
  container: Selection,
  category: string
): Selection<SVGRectElement, Data> {
  return findByDataProperty<SVGRectElement, Data>(container, '.bar', 'category', category);
}
