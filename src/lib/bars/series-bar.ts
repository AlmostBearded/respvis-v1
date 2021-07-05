import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { BaseType, select, selection, Selection } from 'd3-selection';
import {
  COLORS_CATEGORICAL,
  DataSeriesGenerator,
  debug,
  findByDataProperty,
  findByKey,
  nodeToString,
} from '../core';
import { Rect, rectMinimized, rectToAttrs } from '../core/utility/rect';
import { Transition } from 'd3-transition';
import { easeCubicOut } from 'd3-ease';
import { filterBrightness } from '../filters';

export interface DataBar extends Rect {
  index: number;
  key: string;
}

export interface DataSeriesBar extends DataSeriesGenerator<DataBar> {
  mainValues: any[];
  mainScale: ScaleBand<any>;
  crossValues: number[];
  crossScale: ScaleContinuousNumeric<number, number>;
  keys?: string[];
  flipped: boolean;
}

export function dataSeriesBar(data: Partial<DataSeriesBar>): DataSeriesBar {
  return {
    mainValues: data.mainValues || [],
    mainScale:
      data.mainScale ||
      scaleBand()
        .domain(data.mainValues || [])
        .padding(0.1),
    crossValues: data.crossValues || [],
    crossScale:
      data.crossScale ||
      scaleLinear()
        .domain([0, Math.max(...(data.crossValues || []))])
        .nice(),
    flipped: data.flipped || false,
    keys: data.keys,
    dataGenerator: data.dataGenerator || dataBarGenerator,
  };
}

export function dataBarGenerator(selection: Selection<Element, DataSeriesBar>): DataBar[] {
  const seriesDatum = selection.datum(),
    bounds = selection.bounds()!;
  if (!seriesDatum.flipped) {
    seriesDatum.mainScale.range([0, bounds.width]);
    seriesDatum.crossScale.range([bounds.height, 0]);
  } else {
    seriesDatum.mainScale.range([0, bounds.height]);
    seriesDatum.crossScale.range([0, bounds.width]);
  }

  const data: DataBar[] = [];

  for (let i = 0; i < seriesDatum.crossValues.length; ++i) {
    const mv = seriesDatum.mainValues[i];
    const cv = seriesDatum.crossValues[i];

    if (!seriesDatum.flipped) {
      data.push({
        index: i,
        key: seriesDatum.keys?.[i] || i.toString(),
        x: seriesDatum.mainScale(mv)!,
        y: Math.min(seriesDatum.crossScale(0)!, seriesDatum.crossScale(cv)!),
        width: seriesDatum.mainScale.bandwidth(),
        height: Math.abs(seriesDatum.crossScale(0)! - seriesDatum.crossScale(cv)!),
      });
    } else {
      data.push({
        index: i,
        key: seriesDatum.keys?.[i] || i.toString(),
        x: Math.min(seriesDatum.crossScale(0)!, seriesDatum.crossScale(cv)!),
        y: seriesDatum.mainScale(mv)!,
        width: Math.abs(seriesDatum.crossScale(0)! - seriesDatum.crossScale(cv)!),
        height: seriesDatum.mainScale.bandwidth(),
      });
    }
  }
  return data;
}

export function seriesBar<
  GElement extends Element,
  Datum extends DataSeriesGenerator<DataBar>,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .classed('series-bar', true)
    .attr('fill', COLORS_CATEGORICAL[0])
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
      seriesBarRender(select<GElement, Datum>(this));
    })
    .on('mouseover.seriesbarhighlight mouseout.seriesbarhighlight', (e) =>
      barHighlight(select(e.target), e.type.endsWith('over'))
    );
}

export interface JoinEvent<GElement extends Element, Datum>
  extends CustomEvent<{ selection: Selection<GElement, Datum> }> {}

export interface JoinTransitionEvent<GElement extends Element, Datum>
  extends CustomEvent<{ transition: Transition<GElement, Datum> }> {}

export function seriesBarRender<
  GElement extends Element,
  Datum extends DataSeriesGenerator<DataBar>,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.each((d, i, g) => {
    debug(`render bar series on ${nodeToString(g[i])}`);
    const series = select<GElement, Datum>(g[i]);
    series
      .selectAll<SVGRectElement, DataBar>('rect')
      .data(d.dataGenerator(series), (d) => d.key)
      .join(
        (enter) =>
          enter
            .append('rect')
            .classed('bar', true)
            .call((s) => rectToAttrs(s, (d) => rectMinimized(d)))
            .call((s) => selection.dispatch('barenter', { detail: { selection: s } })),
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
            .call((s) => selection.dispatch('barexit', { detail: { selection: s } }))
      )
      .call((s) =>
        s
          .transition('position')
          .duration(250)
          .ease(easeCubicOut)
          .call((t) => rectToAttrs(t, (d) => d))
      )
      .call((s) => selection.dispatch('barupdate', { detail: { selection: s } }));
  });
}

export function barHighlight(bar: Selection, highlight: boolean): void {
  if (highlight)
    bar.attr(
      'filter',
      `url(#${bar.closest('.series-bar').selectAll('.filter-brightness').attr('id')})`
    );
  else bar.attr('filter', null);
}

export function barFind<Data extends DataBar>(
  container: Selection,
  key: string
): Selection<SVGRectElement, Data> {
  return findByKey<SVGRectElement, Data>(container, '.bar', key);
}

export function barFindByIndex<Data extends DataBar>(
  container: Selection,
  index: number
): Selection<SVGRectElement, Data> {
  return findByDataProperty<SVGRectElement, Data>(container, '.bar', 'index', index);
}
