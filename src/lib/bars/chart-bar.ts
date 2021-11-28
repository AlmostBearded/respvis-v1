import { select, Selection } from 'd3-selection';
import {
  chartCartesian,
  chartCartesianAxes,
  chartCartesianData,
  ChartCartesian as ChartCartesian,
} from '../core/chart-cartesian';
import { seriesBar, seriesBarData, SeriesBar, Bar } from './series-bar';
import {
  SeriesLabelBar as SeriesLabelBar,
  seriesLabelBarData as seriesLabelBarData,
  seriesLabelBar,
} from './series-label-bar';

export interface ChartBar extends SeriesBar, ChartCartesian {
  labelsEnabled: boolean;
  labels: Partial<SeriesLabelBar>;
}

export function chartBarData(data: Partial<ChartBar>): ChartBar {
  return {
    ...seriesBarData(data),
    ...chartCartesianData(data),
    labelsEnabled: data.labelsEnabled ?? true,
    labels: data.labels || {},
  };
}

export type ChartBarSelection = Selection<SVGSVGElement | SVGGElement, ChartBar>;

export function chartBar(selection: ChartBarSelection): void {
  selection
    .call((s) => chartCartesian(s))
    .classed('chart-bar', true)
    .each((chartD, i, g) => {
      const chartS = <ChartBarSelection>select(g[i]);
      const drawAreaS = chartS.selectAll('.draw-area');

      const barSeriesS = drawAreaS
        .selectAll<SVGGElement, SeriesBar>('.series-bar')
        .data([chartD])
        .join('g')
        .call((s) => seriesBar(s))
        .on('mouseover.chartbarhighlight', (e) => chartBarHoverBar(chartS, select(e.target), true))
        .on('mouseout.chartbarhighlight', (e) => chartBarHoverBar(chartS, select(e.target), false));

      drawAreaS
        .selectAll<Element, SeriesLabelBar>('.series-label-bar')
        .data(
          chartD.labelsEnabled
            ? [
                seriesLabelBarData({
                  barContainer: barSeriesS,
                  ...chartD.labels,
                }),
              ]
            : []
        )
        .join('g')
        .call((s) => seriesLabelBar(s));

      chartD.xAxis.scale = chartD.categoryScale;
      chartD.yAxis.scale = chartD.valueScale;
      chartCartesianAxes(chartS);
    });
}

export function chartBarHoverBar(chart: Selection, bar: Selection<Element, Bar>, hover: boolean) {
  bar.each((barD) => {
    chart.selectAll(`.label[data-key="${barD.key}"]`).classed('highlight', hover);
    chart.selectAll(`.axis-x .tick[data-key="${barD.category}"]`).classed('highlight', hover);
  });
}
