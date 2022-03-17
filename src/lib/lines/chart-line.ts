import { select, Selection } from 'd3';
import { Line, SeriesLine, seriesLineData, seriesLineRender } from './series-line';
import {
  ChartCartesian,
  chartCartesianAxesRender,
  chartCartesianData,
  chartCartesianRender,
} from '../core';

export interface ChartLine extends SeriesLine, ChartCartesian {}

export function chartLineData(data: Partial<ChartLine>): ChartLine {
  const seriesD = seriesLineData(data);
  const chartCartesianD = chartCartesianData(data);
  return { ...seriesD, ...chartCartesianD };
}

export function chartLineRender(
  selection: Selection<SVGSVGElement | SVGGElement, ChartLine>
): void {
  selection
    .call((s) => chartCartesianRender(s))
    .classed('chart-line', true)
    .each((chartD, i, g) => {
      const chartS = select<SVGSVGElement | SVGGElement, ChartLine>(g[i]);
      const drawAreaS = chartS.selectAll('.draw-area');

      const lineSeriesS = drawAreaS
        .selectAll<SVGGElement, SeriesLine>('.series-line')
        .data([chartD])
        .join('g')
        .call((s) => seriesLineRender(s))
        .on('mouseover.chartlinehighlight', (e) =>
          chartLineHoverLine(chartS, select(e.target), true)
        )
        .on('mouseout.chartlinehighlight', (e) =>
          chartLineHoverLine(chartS, select(e.target), false)
        );

      // todo: labels?

      chartD.xAxis.scale = chartD.xScale;
      chartD.yAxis.scale = chartD.yScale;
      chartCartesianAxesRender(chartS);
    });
}

export function chartLineHoverLine(
  chartS: Selection,
  lineS: Selection<Element, Line>,
  hover: boolean
) {
  lineS.each((lineD) => {
    // chartS.selectAll(`.label[data-key="${barD.key}"]`).classed('highlight', hover);
    // chartS.selectAll(`.axis-x .tick[data-key="${barD.category}"]`).classed('highlight', hover);
  });
}
