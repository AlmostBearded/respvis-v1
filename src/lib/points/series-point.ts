import { easeCubicOut } from 'd3';
import { scaleLinear } from 'd3';
import { select, Selection } from 'd3';
import { arrayIs, Circle, circleMinimized, circleToAttrs, rectFromString, ScaleAny } from '../core';
import { Size } from '../core/utility/size';

export interface Point extends Circle {
  xValue: any;
  yValue: any;
  styleClass: string;
  key: string;
}

export interface SeriesPoint {
  xValues: any[];
  xScale: ScaleAny<any, number, number>;
  yValues: any[];
  yScale: ScaleAny<any, number, number>;
  radiuses: number[] | number;
  styleClasses: string | string[];
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
    styleClasses: data.styleClasses || 'categorical-0',
    keys: data.keys,
    bounds: data.bounds || { width: 600, height: 400 },
  };
}

export function seriesPointCreatePoints(seriesData: SeriesPoint): Point[] {
  const { xScale, yScale, xValues, yValues, radiuses, bounds, keys, styleClasses } = seriesData;

  xScale.range([0, bounds.width]);
  yScale.range([bounds.height, 0]);

  const data: Point[] = [];

  for (let i = 0; i < xValues.length; ++i) {
    const x = xValues[i],
      y = yValues[i],
      r = Array.isArray(radiuses) ? radiuses[i] : radiuses;
    data.push({
      styleClass: arrayIs(styleClasses) ? styleClasses[i] : styleClasses,
      key: keys?.[i] || i.toString(),
      center: {
        x: xScale(x)!,
        y: yScale(y)!,
      },
      radius: r,
      xValue: x,
      yValue: y,
    });
  }

  return data;
}

export function seriesPoint(selection: Selection<Element, SeriesPoint>): void {
  selection
    .classed('series-point', true)
    .attr('data-ignore-layout-children', true)
    .each((d, i, g) => {
      const seriesS = select<Element, SeriesPoint>(g[i]);
      const boundsAttr = seriesS.attr('bounds');
      if (!boundsAttr) return;
      d.bounds = rectFromString(boundsAttr);
      seriesS
        .selectAll<SVGCircleElement, Point>('.point')
        .data(seriesPointCreatePoints(d), (d) => d.key)
        .call((s) => seriesPointJoin(seriesS, s));
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
          .each((d, i, g) => circleToAttrs(select(g[i]), circleMinimized(d)))
          .call((s) => seriesSelection.dispatch('enter', { detail: { selection: s } })),
      undefined,
      (exit) =>
        exit
          .classed('exiting', true)
          .call((s) =>
            s
              .transition('exit')
              .duration(250)
              .each((d, i, g) => circleToAttrs(select(g[i]), circleMinimized(d)))
              .remove()
          )
          .call((s) => seriesSelection.dispatch('exit', { detail: { selection: s } }))
    )
    .call((s) =>
      s
        .transition('update')
        .duration(250)
        .ease(easeCubicOut)
        .each((d, i, g) => circleToAttrs(select(g[i]), d))
    )
    .attr('data-style', (d) => d.styleClass)
    .call((s) => seriesSelection.dispatch('update', { detail: { selection: s } }));
}
