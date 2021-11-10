import { easeCubicOut } from 'd3-ease';
import { scaleLinear } from 'd3-scale';
import { select, Selection } from 'd3-selection';
import { debug, nodeToString, Position, ScaleAny } from '../core';
import { Size } from '../core/utility/size';

export interface Point extends Position {
  xValue: any;
  yValue: any;
  radius: number;
  index: number;
  key: string;
}

export interface SeriesPoint {
  xValues: any[];
  xScale: ScaleAny<any, number, number>;
  yValues: any[];
  yScale: ScaleAny<any, number, number>;
  radiuses: number[] | number;
  indices?: number[];
  keys?: string[];
  bounds: Size;
}

export function seriesPointData(data: Partial<SeriesPoint>): SeriesPoint {
  return {
    xValues: data.xValues || [],
    xScale: data.xScale || scaleLinear().domain([0, 1]),
    yValues: data.yValues || [],
    yScale: data.yScale || scaleLinear().domain([0, 1]),
    radiuses: data.radiuses || 5,
    indices: data.indices,
    keys: data.keys,
    bounds: data.bounds || { width: 600, height: 400 },
  };
}

export function seriesPointCreatePoints(seriesData: SeriesPoint): Point[] {
  const { xScale, yScale, xValues, yValues, radiuses, bounds, keys, indices } = seriesData;

  xScale.range([0, bounds.width]);
  yScale.range([bounds.height, 0]);

  const data: Point[] = [];

  for (let i = 0; i < xValues.length; ++i) {
    const x = xValues[i],
      y = yValues[i],
      r = Array.isArray(radiuses) ? radiuses[i] : radiuses;
    data.push({
      index: indices === undefined ? i : indices[i],
      key: keys?.[i] || i.toString(),
      x: xScale(x)!,
      y: yScale(y)!,
      xValue: x,
      yValue: y,
      radius: r,
    });
  }

  return data;
}

export function seriesPoint(selection: Selection<Element, SeriesPoint>): void {
  selection
    .classed('series-point', true)
    .attr('ignore-layout-children', true)
    .on('datachange.seriespoint', function () {
      debug(`data change on ${nodeToString(this)}`);
      select(this).dispatch('render');
    })
    .on('render.seriespoint', function (e, d) {
      const series = select<Element, SeriesPoint>(this);
      const bounds = series.bounds();
      if (!bounds) return;
      debug(`render point series on ${nodeToString(this)}`);
      d.bounds = bounds;
      series
        .selectAll<SVGCircleElement, Point>('circle')
        .data(seriesPointCreatePoints(d), (d) => d.key)
        .call((s) => seriesPointJoin(series, s));
    })
    .on('mouseover.seriespointhighlight mouseout.seriespointhighlight', (e: MouseEvent) =>
      (<Element>e.target).classList.toggle('highlight', e.type.endsWith('over'))
    );
}

export function seriesPointJoin(
  seriesSelection: Selection,
  joinSelection: Selection<Element, Point>
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
    .attr('index', (d) => d.index)
    .call((s) => seriesSelection.dispatch('update', { detail: { selection: s } }));
}
