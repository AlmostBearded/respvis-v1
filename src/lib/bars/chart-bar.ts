import { BaseType, select, Selection } from 'd3-selection';
import { axisTickFindByIndex, axisTickHighlight } from '../axis';
import { debug, nodeToString, siblingIndexSameClasses } from '../core';
import {
  chartCartesian,
  chartCartesianUpdateAxes,
  chartCartesianData,
  ChartCartesian as ChartCartesian,
} from '../core/chart-cartesian';
import { seriesBar, seriesBarData, SeriesBar, Bar, barFind } from './series-bar';
import { labelHighlight, labelFind } from './series-label';
import {
  SeriesLabelBar as SeriesLabelBar,
  seriesLabelBarData as seriesLabelBarData,
  seriesLabelBar,
} from './series-label-bar';

export interface ChartBar extends SeriesBar, ChartCartesian {
  labels: Partial<SeriesLabelBar>;
}

export function chartBarData(data: Partial<ChartBar>): ChartBar {
  return {
    ...seriesBarData(data),
    ...chartCartesianData(data),
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

      const barSeries = drawArea
        .append('g')
        .layout('grid-area', '1 / 1')
        .datum<SeriesBar>(chartData)
        .call((s) => seriesBar(s))
        .on('mouseover.chartbarhighlight', (e) => chartBarHoverBar(chart, select(e.target), true))
        .on('mouseout.chartbarhighlight', (e) => chartBarHoverBar(chart, select(e.target), false));

      drawArea
        .append('g')
        .layout('grid-area', '1 / 1')
        .datum(seriesLabelBarData({ barContainer: barSeries }))
        .call((s) => seriesLabelBar(s));
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
  selection.each(function (chartData, i, g) {
    const s = <ChartBarSelection>select(g[i]),
      labelSeries = s.selectAll<Element, SeriesLabelBar>('.series-label-bar');

    s.selectAll('.series-bar').dispatch('datachange');

    labelSeries.datum((d) =>
      Object.assign<SeriesLabelBar, Partial<SeriesLabelBar>, Partial<SeriesLabelBar>>(
        d,
        { labels: chartData.values.map((v) => v.toString()) },
        chartData.labels
      )
    );

    chartData.xAxis.scale = chartData.categoryScale;
    chartData.yAxis.scale = chartData.valueScale;

    chartCartesianUpdateAxes(s);
  });
}

export function chartBarHoverBar(chart: Selection, bar: Selection<Element, Bar>, hover: boolean) {
  bar.each((barD, i, g) => {
    const categoryIndex = siblingIndexSameClasses(g[i]),
      labelS = labelFind(chart, barD.key),
      tickS = axisTickFindByIndex(chart.selectAll('.axis-x'), categoryIndex);

    labelHighlight(labelS, hover);
    axisTickHighlight(tickS, hover);
  });
}
