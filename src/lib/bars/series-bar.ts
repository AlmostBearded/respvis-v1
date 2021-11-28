import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { select, Selection, style } from 'd3-selection';
import { arrayIs, debug, nodeToString } from '../core';
import { Rect, rectFitStroke, rectMinimized, rectToAttrs } from '../core/utility/rect';
import { Transition } from 'd3-transition';
import { easeCubicOut } from 'd3-ease';
import { Size } from '../core/utility/size';
import {
  SeriesConfigTooltips,
  seriesConfigTooltipsData,
  seriesConfigTooltipsHandleEvents,
} from '../tooltip';
import toPX from 'to-px';

export interface Bar extends Rect {
  category: string;
  styleClass: string;
  value: number;
  key: string;
}

export interface SeriesBar extends SeriesConfigTooltips<SVGRectElement, Bar> {
  categories: any[];
  categoryScale: ScaleBand<any>;
  values: number[];
  valueScale: ScaleContinuousNumeric<number, number>;
  keys: string[];
  styleClasses: string | string[];
  flipped: boolean;
  bounds: Size;
}

export function seriesBarData(data: Partial<SeriesBar>): SeriesBar {
  const categories = data.categories || [];
  return {
    bounds: data.bounds || { width: 600, height: 400 },
    categories: categories,
    styleClasses: data.styleClasses || 'categorical-0',
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
  const { categories, categoryScale, values, valueScale, keys, styleClasses, flipped, bounds } =
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
        styleClass: arrayIs(styleClasses) ? styleClasses[i] : styleClasses,
        ...(flipped ? flippedRect : rect),
      };
    data.push(bar);
  }
  return data;
}

export function seriesBar(selection: Selection<Element, SeriesBar>): void {
  selection
    .classed('series-bar', true)
    .attr('data-ignore-layout-children', true)
    .each((d, i, g) => {
      const seriesS = select<Element, SeriesBar>(g[i]);
      const bounds = seriesS.bounds();
      if (!bounds) return;
      d.bounds = bounds;
      seriesS
        .selectAll<SVGRectElement, Bar>('rect')
        .data(seriesBarCreateBars(d), (d) => d.key)
        .call((s) => seriesBarJoin(seriesS, s));
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
          .each((d, i, g) => rectToAttrs(select(g[i]), rectMinimized(d)))
          .call((s) => seriesSelection.dispatch('enter', { detail: { selection: s } })),
      undefined,
      (exit) =>
        exit
          .classed('exiting', true)
          .each((d, i, g) =>
            select(g[i])
              .transition('minimize')
              .duration(250)
              .call((t) => rectToAttrs(t, rectMinimized(d)))
              .remove()
          )
          .call((s) => seriesSelection.dispatch('exit', { detail: { selection: s } }))
    )
    .each((d, i, g) =>
      select(g[i])
        .transition('position')
        .duration(250)
        .ease(easeCubicOut)
        .call((t) => rectToAttrs(t, rectFitStroke(d, toPX(select(g[i]).style('stroke-width'))!)))
    )
    .attr('data-style', (d) => d.styleClass)
    .attr('data-category', (d) => d.category)
    .attr('data-key', (d) => d.key)
    .call((s) => seriesSelection.dispatch('update', { detail: { selection: s } }));
}
