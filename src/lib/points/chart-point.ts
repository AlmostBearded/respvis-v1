import { select, Selection } from 'd3';
import { rectFromString } from '../core';
import {
  chartCartesianRender,
  chartCartesianAxesRender,
  chartCartesianData,
  ChartCartesian,
} from '../core/chart-cartesian';
import { SeriesPoint, seriesPointData, seriesPointRender } from './series-point';

export interface ChartPoint extends SeriesPoint, ChartCartesian {}

export function chartPointData(data: Partial<ChartPoint>): ChartPoint {
  return {
    ...seriesPointData(data),
    ...chartCartesianData(data),
  };
}

export type ChartPointSelection = Selection<SVGSVGElement | SVGGElement, ChartPoint>;

export function chartPointRender(selection: ChartPointSelection): void {
  selection
    .call((s) => chartCartesianRender(s))
    .classed('chart-point', true)
    .each((chartD, i, g) => {
      const drawAreaS = select(g[i]).selectAll('.draw-area');
      const drawAreaBounds = rectFromString(drawAreaS.attr('bounds') || '0, 0, 600, 400');
      const { xScale, yScale, flipped } = chartD;

      xScale.range(flipped ? [drawAreaBounds.height, 0] : [0, drawAreaBounds.width]);
      yScale.range(flipped ? [0, drawAreaBounds.width] : [drawAreaBounds.height, 0]);

      drawAreaS
        .selectAll<SVGSVGElement, SeriesPoint>('.series-point')
        .data([chartD])
        .join('svg')
        .call((s) => seriesPointRender(s));

      chartD.xAxis.scale = chartD.xScale;
      chartD.yAxis.scale = chartD.yScale;
    })
    .call((s) => chartCartesianAxesRender(s));
}
