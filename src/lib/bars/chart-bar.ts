import { BaseType, select, selectAll, Selection } from 'd3-selection';
import { debug, nodeToString } from '../core';
import {
  chartCartesian,
  chartCartesianUpdateAxes,
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
    .call((s) => chartCartesian(s, false))
    .classed('chart-bar', true)
    .each((chartData, i, g) => {
      const chart = <ChartBarSelection>select(g[i]);
      const drawArea = chart.selectAll('.draw-area');

      drawArea
        .append('g')
        .datum<SeriesBar>(chartData)
        .call((s) => seriesBar(s))
        .on('mouseover.chartbarhighlight', (e) => chartBarHoverBar(chart, select(e.target), true))
        .on('mouseout.chartbarhighlight', (e) => chartBarHoverBar(chart, select(e.target), false));
    })
    .on('datachange.debuglog', function () {
      debug(`data change on ${nodeToString(this)}`);
    })
    .on('datachange.chartbar', function (e, chartData) {
      chartBarDataChange(<ChartBarSelection>select(this));
    })
    .call((s) => chartBarDataChange(s));
}

export function chartBarDataChange(
  selection: Selection<SVGSVGElement | SVGGElement, ChartBar>
): void {
  selection.each(function (chartD, i, g) {
    const chartS = <ChartBarSelection>select(g[i]);
    const barSeriesS = chartS.selectAll<Element, SeriesBar>('.series-bar').datum((d) => d);

    const labelSeriesD = seriesLabelBarData({
      barContainer: barSeriesS,
      ...chartD.labels,
    });
    chartS
      .selectAll('.draw-area')
      .selectAll<Element, SeriesLabelBar>('.series-label-bar')
      .data(chartD.labelsEnabled ? [labelSeriesD] : [])
      .join((enter) => enter.append('g').call((s) => seriesLabelBar(s)));

    chartD.xAxis.scale = chartD.categoryScale;
    chartD.yAxis.scale = chartD.valueScale;
    chartCartesianUpdateAxes(chartS);
  });
}

export function chartBarHoverBar(chart: Selection, bar: Selection<Element, Bar>, hover: boolean) {
  bar.each((barD) => {
    chart.selectAll(`.label[data-key="${barD.key}"]`).classed('highlight', hover);
    chart.selectAll(`.axis-x .tick[data-key="${barD.category}"]`).classed('highlight', hover);
  });
}
