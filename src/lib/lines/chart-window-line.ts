import { select, Selection } from 'd3';
import { ChartLine, chartLineData, chartLineRender } from './chart-line';
import { chartWindowRender, layouterCompute, toolDownloadSVGRender } from '../core';

export interface ChartWindowLine extends ChartLine {}

export function chartWindowLineData(data: Partial<ChartWindowLine>): ChartWindowLine {
  const chartD = chartLineData(data);
  return { ...chartD };
}

export function chartWindowLineRender(selection: Selection<HTMLDivElement, ChartWindowLine>): void {
  selection
    .call((s) => chartWindowRender(s))
    .classed('chart-window-line', true)
    .each((chartWindowD, i, g) => {
      const chartWindowS = select<HTMLDivElement, ChartWindowLine>(g[i]);
      const menuItemsS = chartWindowS.selectAll('.menu-tools > .items');
      const layouterS = chartWindowS.selectAll<HTMLDivElement, any>('.layouter');

      // todo: more tools?

      // download svg
      menuItemsS
        .selectAll<HTMLLIElement, any>('.tool-download-svg')
        .data([null])
        .join('li')
        .call((s) => toolDownloadSVGRender(s));

      const chartS = layouterS
        .selectAll<SVGSVGElement, ChartLine>('svg.chart-line')
        .data([chartWindowD])
        .join('svg')
        .call((s) => chartLineRender(s));

      layouterS
        .on('boundschange.chartwindowline', () => chartLineRender(chartS))
        .call((s) => layouterCompute(s));
    });
}

export function chartWindowLineAutoResize(
  selection: Selection<HTMLDivElement, ChartWindowLine>
): void {
  selection.on('resize', function () {
    select<HTMLDivElement, ChartWindowLine>(this).call((s) => chartWindowLineRender(s));
  });
}
