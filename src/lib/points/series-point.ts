import { easeCubicOut } from 'd3-ease';
import { scaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
import { COLORS_CATEGORICAL, debug, nodeToString, Position, ScaleAny } from '../core';
import { Size } from '../core/utils';

export interface DataPoint extends Position {
  radius: number;
  index: number;
  key: string;
}

export interface DataSeriesPoint {
  xValues: any[];
  xScale: ScaleAny<any, number, number>;
  yValues: any[];
  yScale: ScaleAny<any, number, number>;
  radiuses: number[] | number;
  keys?: string[];
  bounds: Size;
}

export function dataSeriesPoint(data: Partial<DataSeriesPoint>): DataSeriesPoint {
  return {
    xValues: data.xValues || [],
    xScale: data.xScale || scaleLinear().domain([0, 1]),
    yValues: data.yValues || [],
    yScale: data.yScale || scaleLinear().domain([0, 1]),
    radiuses: data.radiuses || 5,
    keys: data.keys,
    bounds: data.bounds || { width: 600, height: 400 },
  };
}

export function seriesPointCreatePoints(seriesData: DataSeriesPoint): DataPoint[] {
  const { xScale, yScale, xValues, yValues, radiuses, bounds, keys } = seriesData;

  xScale.range([0, bounds.width]);
  yScale.range([bounds.height, 0]);

  const data: DataPoint[] = [];

  for (let i = 0; i < xValues.length; ++i) {
    const x = xValues[i],
      y = yValues[i],
      r = Array.isArray(radiuses) ? radiuses[i] : radiuses;
    data.push({
      index: i,
      key: keys?.[i] || i.toString(),
      x: xScale(x)!,
      y: yScale(y)!,
      radius: r,
    });
  }

  return data;
}

export function seriesPoint(selection: Selection<Element, DataSeriesPoint>): void {
  selection
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
      debug(`render point series on ${nodeToString(this)}`);
      const series = select<Element, DataSeriesPoint>(this);
      d.bounds = series.bounds()!;
      series
        .selectAll<SVGCircleElement, DataPoint>('circle')
        .data(seriesPointCreatePoints(d), (d) => d.key)
        .call((s) => seriesPointJoin(series, s));
    });
}

export function seriesPointJoin(
  seriesSelection: Selection,
  joinSelection: Selection<Element, DataPoint>
): void {
  joinSelection
    .join(
      (enter) =>
        enter
          .append('circle')
          .classed('point', true)
          .attr('cx', (d) => d.x)
          .attr('cy', (d) => d.y)
          .attr('r', 0)
          .call((s) => seriesSelection.dispatch('enter', { detail: { selection: s } })),
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
          .call((s) => seriesSelection.dispatch('exit', { detail: { selection: s } }))
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
    .call((s) => seriesSelection.dispatch('update', { detail: { selection: s } }));
}
