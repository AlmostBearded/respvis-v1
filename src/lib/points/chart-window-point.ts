import { select, Selection } from 'd3';
import {
  chartWindowRender,
  ToolFilterNominal,
  toolFilterNominalData,
  toolDownloadSVGRender,
  toolFilterNominalRender,
  layouterCompute,
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
    .call((s) => chartWindowRender(s))
    .each((chartWindowD, i, g) => {
      const chartWindowS = select<HTMLDivElement, ChartWindowPoint>(g[i]),
        menuItemsS = chartWindowS.selectAll('.menu-tools > .items'),
        layouterS = chartWindowS.selectAll<HTMLDivElement, any>('.layouter');

      // download svg
      menuItemsS
        .selectAll<HTMLLIElement, any>('.tool-download-svg')
        .data([null])
        .join('li')
        .call((s) => toolDownloadSVGRender(s));

      // chart
      const chartS = layouterS
        .selectAll<SVGSVGElement, ChartPoint>('svg.chart-point')
        .data([chartPointData(chartWindowD)])
        .join('svg')
        .call((s) => chartPoint(s));

      layouterS
        .on('boundschange.chartwindowpoint', () => chartPoint(chartS))
        .call((s) => layouterCompute(s));
    });
}

export function chartWindowPointAutoResize(selection: ChartWindowPointSelection): void {
  selection.on('resize', function () {
    select<HTMLDivElement, ChartWindowPoint>(this).call((s) => chartWindowPoint(s));
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
