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
import { chartPointRender, ChartPoint, chartPointData } from './chart-point';

export interface ChartWindowPoint extends ChartPoint {}

export function chartWindowPointData(data: Partial<ChartWindowPoint>): ChartWindowPoint {
  const chartData = chartPointData(data);

  return {
    ...chartData,
  };
}

export type ChartWindowPointSelection = Selection<HTMLDivElement, ChartWindowPoint>;

export function chartWindowPointRender(selection: ChartWindowPointSelection): void {
  selection
    .classed('chart-window-point', true)
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
        .call((s) => chartPointRender(s));

      layouterS
        .on('boundschange.chartwindowpoint', () => chartPointRender(chartS))
        .call((s) => layouterCompute(s));
    });
}

export function chartWindowPointAutoResize(selection: ChartWindowPointSelection): void {
  selection.on('resize', function () {
    select<HTMLDivElement, ChartWindowPoint>(this).call((s) => chartWindowPointRender(s));
  });
}
