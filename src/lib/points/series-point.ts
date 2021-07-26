import { easeCubicOut } from 'd3-ease';
import { scaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
import {
  COLORS_CATEGORICAL,
  DataSeriesGenerator,
  debug,
  nodeToString,
  Position,
  ScaleAny,
} from '../core';

export interface DataPoint extends Position {
  radius: number;
  index: number;
  key: string;
}

export interface DataSeriesPoint extends DataSeriesGenerator<DataPoint> {
  xValues: any[];
  xScale: ScaleAny<any, number, number>;
  yValues: any[];
  yScale: ScaleAny<any, number, number>;
  radiuses: number[] | number;
  keys?: string[];
}

export function dataSeriesPoint(data: Partial<DataSeriesPoint>): DataSeriesPoint {
  return {
    xValues: data.xValues || [],
    xScale: data.xScale || scaleLinear().domain([0, 1]),
    yValues: data.yValues || [],
    yScale: data.yScale || scaleLinear().domain([0, 1]),
    radiuses: data.radiuses || 5,
    keys: data.keys,
    dataGenerator: data.dataGenerator || dataPointGenerator,
  };
}

export function dataPointGenerator(selection: Selection<Element, DataSeriesPoint>): DataPoint[] {
  const seriesDatum = selection.datum(),
    bounds = selection.bounds()!;
  seriesDatum.xScale.range([0, bounds.width]);
  seriesDatum.yScale.range([bounds.height, 0]);

  const data: DataPoint[] = [];

  for (let i = 0; i < seriesDatum.xValues.length; ++i) {
    const x = seriesDatum.xValues[i],
      y = seriesDatum.yValues[i],
      r = Array.isArray(seriesDatum.radiuses) ? seriesDatum.radiuses[i] : seriesDatum.radiuses;
    data.push({
      index: i,
      key: seriesDatum.keys?.[i] || i.toString(),
      x: seriesDatum.xScale(x)!,
      y: seriesDatum.yScale(y)!,
      radius: r,
    });
  }

  return data;
}

export function seriesPoint<
  GElement extends Element,
  Datum extends DataSeriesPoint,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .classed('series-point', true)
    .attr('fill', COLORS_CATEGORICAL[0])
    .on(
      'render.seriespoint-initial',
      function () {
        debug(`render on data change on ${nodeToString(this)}`);
        select(this).on('datachange.seriespoint', function () {
          debug(`data change on ${nodeToString(this)}`);
          select(this).dispatch('render');
        });
      },
      { once: true }
    )
    .on('render.seriespoint', function (e, d) {
      seriesPointRender(select<GElement, Datum>(this));
    });
}

export function seriesPointRender<
  GElement extends Element,
  Datum extends DataSeriesPoint,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.each((d, i, g) => {
    debug(`render point series on ${nodeToString(g[i])}`);
    const series = select<GElement, Datum>(g[i]);
    series
      .selectAll<SVGCircleElement, DataPoint>('circle')
      .data(d.dataGenerator(series), (d) => d.key)
      .join(
        (enter) =>
          enter
            .append('circle')
            .classed('point', true)
            .attr('cx', (d) => d.x)
            .attr('cy', (d) => d.y)
            .attr('r', 0)
            .call((s) => selection.dispatch('enter', { detail: { selection: s } })),
        undefined,
        (exit) =>
          exit
            .classed('exiting', true)
            .call((s) =>
              s
                .transition('exit')
                .duration(250)
                .attr('cx', (d) => d.x)
                .attr('cy', (d) => d.y)
                .attr('r', 0)
                .remove()
            )
            .call((s) => selection.dispatch('exit', { detail: { selection: s } }))
      )
      .call((s) =>
        s
          .transition('update')
          .duration(250)
          .ease(easeCubicOut)
          .attr('cx', (d) => d.x)
          .attr('cy', (d) => d.y)
          .attr('r', (d) => d.radius)
      )
      .call((s) => selection.dispatch('update', { detail: { selection: s } }));
  });
}
