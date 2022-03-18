import { select, Selection } from 'd3';
import { Line, SeriesLine, seriesLineData, seriesLineRender } from './series-line';
import {
  ChartCartesian,
  chartCartesianAxesRender,
  chartCartesianData,
  chartCartesianRender,
  arrayIs,
} from '../core';
import { SeriesPoint, seriesPointRender, seriesPointData, Point } from '../points';
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

      const { styleClasses, keys, xValues, yValues, xScale, yScale } = chartD;
      drawAreaS
        .selectAll<SVGGElement, SeriesPoint>('.series-point')
        .data<SeriesPoint>(
          keys.map((k, lineI) =>
            seriesPointData({
              styleClasses: arrayIs(styleClasses) ? styleClasses[lineI] : styleClasses,
              keys: yValues[lineI].map((_, markerI) => `${k}-${markerI}`),
              xValues,
              yValues: yValues[lineI],
              xScale,
              yScale,
            })
          )
        )
        .join('g')
        .call((s) => seriesPointRender(s))
        .on('mouseover.chartlinehighlight', (e) =>
          chartLineHoverMarker(chartS, select(e.target), true)
        )
        .on('mouseout.chartlinehighlight', (e) =>
          chartLineHoverMarker(chartS, select(e.target), false)
        );

      const { legend: legendD } = chartD;
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
    chartS.selectAll(`.point[data-key^="${lineD.key}"]`).classed('highlight', hover);
    // chartS.selectAll(`.label[data-key="${barD.key}"]`).classed('highlight', hover);
    // chartS.selectAll(`.axis-x .tick[data-key="${barD.category}"]`).classed('highlight', hover);
  });
}

export function chartLineHoverMarker(
  chartS: Selection,
  markerS: Selection<Element, Point>,
  hover: boolean
) {
  markerS.each((pointD) => {
    const lineKey = pointD.key.replace(/-[0-9]+$/, '');
    chartS.selectAll(`.legend-item[data-key="${lineKey}"]`).classed('highlight', hover);
    chartS.selectAll(`.line[data-key^="${lineKey}"]`).classed('highlight', hover);
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
    chartS.selectAll(`.point[data-key^="${key}"]`).classed('highlight', hover);
    // .each((d) => chartS.selectAll(`.label[data-key="${d.key}"]`).classed('highlight', hover));
  });
}
