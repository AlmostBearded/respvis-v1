import { BaseType, select, Selection } from 'd3-selection';
import {
  chartCartesian,
  chartCartesianAxes,
  chartCartesianData,
  ChartCartesian,
} from '../core/chart-cartesian';
import { SeriesPoint, seriesPointData, seriesPoint } from './series-point';

export interface ChartPoint extends SeriesPoint, ChartCartesian {}

export function chartPointData(data: Partial<ChartPoint>): ChartPoint {
  return {
    ...seriesPointData(data),
    ...chartCartesianData(data),
  };
}

export type ChartPointSelection = Selection<SVGSVGElement | SVGGElement, ChartPoint>;

export function chartPoint(selection: ChartPointSelection): void {
  selection
    .call((s) => chartCartesian(s))
    .classed('chart-point', true)
    .each((chartD, i, g) => {
      const drawAreaS = select(g[i]).selectAll('.draw-area');

      drawAreaS
        .selectAll<SVGSVGElement, SeriesPoint>('.series-point')
        .data([chartD])
        .join('svg')
        .call((s) => seriesPoint(s));

      chartD.flipped = false;
      chartD.xAxis.scale = chartD.xScale;
      chartD.yAxis.scale = chartD.yScale;
    })
    .call((s) => chartCartesianAxes(s));
}
