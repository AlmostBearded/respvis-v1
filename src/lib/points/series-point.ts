import { easeCubicOut, extent as d3Extent, scalePoint } from 'd3';
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
  flipped: boolean;
}

export function seriesPointData(data: Partial<SeriesPoint>): SeriesPoint {
  const xValues = data.xValues || [];
  const yValues = data.yValues || [];

  let xScale = data.xScale || scaleLinear().domain([0, 1]);
  if (!data.xScale && xValues.length > 0) {
    if (typeof xValues[0] === 'number') {
      const extent = [Math.min(...xValues), Math.max(...xValues)];
      const range = extent[1] - extent[0];
      const domain = [extent[0] - range * 0.05, extent[1] + range * 0.05];
      xScale = scaleLinear().domain(domain).nice();
    } else {
      xScale = scalePoint().domain(xValues);
    }
  }

  let yScale = data.yScale || scaleLinear().domain([0, 1]);
  if (!data.yScale && yValues.length > 0) {
    if (typeof yValues[0] === 'number') {
      const extent = [Math.min(...yValues), Math.max(...yValues)];
      const range = extent[1] - extent[0];
      const domain = [extent[0] - range * 0.05, extent[1] + range * 0.05];
      yScale = scaleLinear().domain(domain).nice();
    } else {
      yScale = scalePoint().domain(yValues);
    }
  }

  return {
    xValues,
    xScale,
    yValues,
    yScale,
    radiuses: data.radiuses || 5,
    styleClasses: data.styleClasses || 'categorical-0',
    keys: data.keys,
    bounds: data.bounds || { width: 600, height: 400 },
    flipped: data.flipped || false,
  };
}

export function seriesPointCreatePoints(seriesData: SeriesPoint): Point[] {
  const { xScale, yScale, xValues, yValues, radiuses, bounds, keys, styleClasses, flipped } =
    seriesData;

  const data: Point[] = [];

  for (let i = 0; i < xValues.length; ++i) {
    const x = xValues[i],
      y = yValues[i],
      r = Array.isArray(radiuses) ? radiuses[i] : radiuses;
    data.push({
      styleClass: arrayIs(styleClasses) ? styleClasses[i] : styleClasses,
      key: keys?.[i] || i.toString(),
      center: {
        x: flipped ? yScale(y)! : xScale(x)!,
        y: flipped ? xScale(x)! : yScale(y)!,
      },
      radius: r,
      xValue: x,
      yValue: y,
    });
  }

  return data;
}

export function seriesPointRender(selection: Selection<Element, SeriesPoint>): void {
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
    .attr('data-key', (d) => d.key)
    .call((s) => seriesSelection.dispatch('update', { detail: { selection: s } }));
}
