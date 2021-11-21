import { select, Selection } from 'd3-selection';
import {
  chartWindow,
  ToolFilterNominal,
  toolFilterNominalData,
  toolDownloadSVG,
  toolFilterNominal,
} from '../core';
import { arrayIs } from '../core';
import { chartPoint, ChartPoint, chartPointData } from './chart-point';

export interface ChartWindowPoint extends ChartPoint {}

export function chartWindowPointData(data: Partial<ChartWindowPoint>): ChartWindowPoint {
  const chartData = chartPointData(data);

  return {
    ...chartData,
  };
}

export type ChartWindowPointSelection = Selection<HTMLDivElement, ChartWindowPoint>;

export function chartWindowPoint(selection: ChartWindowPointSelection): void {
  selection
    .classed('chart-window-point', true)
    .on('resize.chartwindowpoint', function (e, d) {
      chartWindowPointDispatchDensityChange(select(this));
    })
    .call((s) => chartWindow(s))
    .each((chartWindowD, i, g) => {
      const chartWindow = select<HTMLDivElement, ChartWindowPoint>(g[i]),
        menuItems = chartWindow.selectAll('.menu-tools .items'),
        layouter = chartWindow.selectAll('.layouter');

      // download svg
      menuItems.append('li').call((s) => toolDownloadSVG(s));

      // chart
      layouter
        .append('svg')
        .datum(chartPointData(chartWindowD))
        .call((s) => chartPoint(s));
    })
    .on('datachange.chartwindowbar', function (e, chartWindowD) {
      const chartWindowS = <ChartWindowPointSelection>select(this);
      chartWindowS.selectAll<Element, ChartPoint>('svg.chart-point').datum((d) => d);
    });
}

export function chartWindowPointDispatchDensityChange(selection: ChartWindowPointSelection): void {
  selection.each((d, i, g) => {
    const { width, height } = g[i].getBoundingClientRect();
    const { xValues } = select(g[i]).selectAll<Element, ChartPoint>('.chart-point').datum();
    select(g[i]).dispatch('densitychange', {
      detail: { density: { x: xValues.length / width, y: xValues.length / height } },
    });
  });
}
