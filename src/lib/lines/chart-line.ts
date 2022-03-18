import { select, Selection } from 'd3';
import { Line, SeriesLine, seriesLineData, seriesLineRender } from './series-line';
import {
  ChartCartesian,
  chartCartesianAxesRender,
  chartCartesianData,
  chartCartesianRender,
  arrayIs,
} from '../core';
import { Legend, legendData, legendRender, LegendItem } from '../legend';

export interface ChartLine extends SeriesLine, ChartCartesian {
  legend: Partial<Legend>;
}

export function chartLineData(data: Partial<ChartLine>): ChartLine {
  const seriesD = seriesLineData(data);
  const chartCartesianD = chartCartesianData(data);
  return { ...seriesD, ...chartCartesianD, legend: data.legend || {} };
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

      const { legend: legendD, styleClasses, keys } = chartD;
      chartS
        .selectAll<SVGGElement, Legend>('.legend')
        .data(
          arrayIs(styleClasses) && styleClasses.length > 1
            ? [legendData({ styleClasses, labels: keys, ...legendD, keys })]
            : []
        )
        .join('g')
        .call((s) => legendRender(s))
        .on('mouseover.chartlinehighlight mouseout.chartlinehighlight', (e) => {
          chartLineHoverLegendItem(
            chartS,
            select(e.target.closest('.legend-item')),
            e.type.endsWith('over')
          );
        });

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
    chartS.selectAll(`.legend-item[data-key="${lineD.key}"]`).classed('highlight', hover);
    // chartS.selectAll(`.label[data-key="${barD.key}"]`).classed('highlight', hover);
    // chartS.selectAll(`.axis-x .tick[data-key="${barD.category}"]`).classed('highlight', hover);
  });
}

export function chartLineHoverLegendItem(
  chartS: Selection<Element, ChartLine>,
  legendItemS: Selection<Element, LegendItem>,
  hover: boolean
): void {
  legendItemS.each((_, i, g) => {
    const key = g[i].getAttribute('data-key')!;
    chartS.selectAll<any, Line>(`.line[data-key="${key}"]`).classed('highlight', hover);
    // .each((d) => chartS.selectAll(`.label[data-key="${d.key}"]`).classed('highlight', hover));
  });
}
