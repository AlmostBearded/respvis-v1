import { BaseType, select, Selection } from 'd3-selection';
import { debug, nodeToString } from '../core';
import {
  chartCartesian,
  chartCartesianUpdateAxes,
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
    .call((s) => chartCartesian(s, false))
    .classed('chart-point', true)
    .each((d, i, g) => {
      const drawArea = select(g[i]).selectAll('.draw-area');

      drawArea
        .append('svg')
        .datum(d)
        .call((s) => seriesPoint(s));
    })
    .on('datachange.debuglog', function () {
      debug(`data change on ${nodeToString(this)}`);
    })
    .on('datachange.chartpoint', function (e, chartData) {
      chartPointDataChange(<ChartPointSelection>select(this));
    })
    .call((s) => chartPointDataChange(s));
}

export function chartPointDataChange(selection: ChartPointSelection): void {
  selection.each(function (chartData, i, g) {
    const s = <ChartPointSelection>select(g[i]);

    s.selectAll('.series-point').dispatch('datachange');

    chartData.flipped = false;
    chartData.xAxis.scale = chartData.xScale;
    chartData.yAxis.scale = chartData.yScale;

    chartCartesianUpdateAxes(s);
  });
}
