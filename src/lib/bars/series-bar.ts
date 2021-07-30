import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { BaseType, pointer, select, Selection, ValueFn } from 'd3-selection';
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

export interface Bar extends Rect {
  category: string;
  value: number;
  key: string;
  color: string;
  strokeWidth: number;
  stroke: string;
}

export interface SeriesBar {
  categories: any[];
  categoryScale: ScaleBand<any>;
  values: number[];
  valueScale: ScaleContinuousNumeric<number, number>;
  keys: string[];
  colors: string | string[];
  strokeWidths: number | number[];
  strokes: string | string[];
  flipped: boolean;
  bounds: Size;
}

export function seriesBarData(data: Partial<SeriesBar>): SeriesBar {
  const categories = data.categories || [];
  return {
    bounds: data.bounds || { width: 600, height: 400 },
    categories: categories,
    categoryScale: data.categoryScale || scaleBand().domain(categories).padding(0.1),
    values: data.values || [],
    valueScale:
      data.valueScale ||
      scaleLinear()
        .domain([0, Math.max(...(data.values || []))])
        .nice(),
    colors: data.colors || COLORS_CATEGORICAL[0],
    strokeWidths: data.strokeWidths || 1,
    strokes: data.strokes || '#000',
    flipped: data.flipped || false,
    keys: data.keys || categories,
  };
}

export function seriesBarCreateBars(seriesData: SeriesBar): Bar[] {
  const {
    categories,
    categoryScale,
    values,
    valueScale,
    keys,
    flipped,
    colors,
    strokeWidths,
    strokes,
    bounds,
  } = seriesData;

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
      sw = arrayIs(strokeWidths) ? strokeWidths[i] : strokeWidths,
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
        color: arrayIs(colors) ? colors[i] : colors,
        strokeWidth: sw,
        stroke: arrayIs(strokes) ? strokes[i] : strokes,
        ...(flipped ? flippedRect : rect),
      };
    data.push(bar);
  }
  return data;
}

export function seriesBar(selection: Selection<Element, SeriesBar>): void {
  selection
    .classed('series-bar', true)
    .call((s) =>
      s
        .append('defs')
        .append('filter')
        .call((s) => filterBrightness(s, 1.3))
    )
    .on(
      'render.seriesbar-initial',
      function () {
        debug(`render on data change on ${nodeToString(this)}`);
        select(this).on('datachange.seriesbar', function () {
          debug(`data change on ${nodeToString(this)}`);
          select(this).dispatch('render');
        });
      },
      { once: true }
    )
    .on('render.seriesbar', function (e, d) {
      debug(`render bar series on ${nodeToString(this)}`);
      const series = select<Element, SeriesBar>(this);
      d.bounds = series.bounds()!;
      series
        .selectAll<SVGRectElement, Bar>('rect')
        .data(seriesBarCreateBars(d), (d) => d.key)
        .call((s) => seriesBarJoin(series, s));
    })
    .on('mouseover.seriesbarhighlight mouseout.seriesbarhighlight', (e) =>
      barHighlight(select(e.target), e.type.endsWith('over'))
    );
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
        .call((t) => rectToAttrs(t, (d) => rectFitStroke(d, d.strokeWidth)))
    )
    .attr('fill', (d, i, g) => d.color)
    .attr('stroke-width', (d) => d.strokeWidth)
    .attr('stroke', (d) => d.stroke)
    .call((s) => seriesSelection.dispatch('update', { detail: { selection: s } }));
}

export function barHighlight(bar: Selection<Element>, highlight: boolean): void {
  bar.each((_, i, g) => {
    if (highlight)
      g[i].setAttribute(
        'filter',
        `url(#${select(g[i].closest('.series-bar')!).selectAll('.filter-brightness').attr('id')})`
      );
    else g[i].removeAttribute('filter');
  });
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
