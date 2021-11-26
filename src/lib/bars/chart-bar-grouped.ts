import { select, Selection } from 'd3-selection';
import { debug, nodeToString } from '../core';
import {
  chartCartesian,
  chartCartesianUpdateAxes,
  chartCartesianData,
  ChartCartesian as ChartCartesian,
} from '../core/chart-cartesian';
import {
  Legend,
  legendData,
  LegendItem,
  legend,
  LegendOrientation,
  LegendPosition,
} from '../legend';
import {
  chartBarStackedHoverAxisTick,
  chartBarStackedHoverBar,
  chartBarStackedHoverLegendItem,
} from './chart-bar-stacked';
import {
  BarGrouped,
  SeriesBarGrouped,
  seriesBarGroupedData,
  seriesBarGrouped,
} from './series-bar-grouped';
import { SeriesLabelBar, seriesLabelBarData, seriesLabelBar } from './series-label-bar';

export interface ChartBarGrouped extends SeriesBarGrouped, ChartCartesian {
  legend: Partial<Legend>;
  labelsEnabled: boolean;
  labels: Partial<SeriesLabelBar>;
}

export function chartBarGroupedData(data: Partial<ChartBarGrouped>): ChartBarGrouped {
  const seriesData = seriesBarGroupedData(data);
  return {
    ...seriesData,
    ...chartCartesianData(data),
    legend: data.legend || {},
    labelsEnabled: data.labelsEnabled ?? true,
    labels: data.labels || {},
  };
}

export type ChartBarGroupedSelection = Selection<SVGSVGElement | SVGGElement, ChartBarGrouped>;

export function chartBarGrouped(selection: ChartBarGroupedSelection): void {
  selection
    .call((s) => chartCartesian(s, false))
    .classed('chart-bar-grouped', true)
    .classed(LegendPosition.Right, true)
    .each((chartData, i, g) => {
      const chart = <ChartBarGroupedSelection>select(g[i]);
      const drawArea = chart.selectAll('.draw-area');

      drawArea
        .append('g')
        .datum(chartData)
        .call((s) => seriesBarGrouped(s))
        .on('mouseover.chartbargroupedhighlight mouseout.chartbargroupedhighlight', (e) =>
          chartBarGroupedHoverBar(chart, select(e.target), e.type.endsWith('over'))
        );

      chart
        .append('g')
        .classed('legend', true)
        .datum(legendData(chartData.legend))
        .call((s) => legend(s))
        .on('mouseover.chartbargroupedhighlight mouseout.chartbargroupedhighlight', (e) => {
          chartBarGroupedHoverLegendItem(
            chart,
            select(e.target.closest('.legend-item')),
            e.type.endsWith('over')
          );
        });
    })
    .on('datachange.debuglog', function () {
      debug(`data change on ${nodeToString(this)}`);
    })
    .on('datachange.chartbargrouped', function (e, chartData) {
      chartBarGroupedDataChange(<ChartBarGroupedSelection>select(this));
    })
    .call((s) => chartBarGroupedDataChange(s));
}

export function chartBarGroupedDataChange(selection: ChartBarGroupedSelection): void {
  selection.each(function (chartD, i, g) {
    const {
        subcategories,
        xAxis,
        yAxis,
        categoryScale,
        valueScale,
        subcategoryIndices,
        labelsEnabled,
        labels,
        legend,
        values,
      } = chartD,
      chartS = <ChartBarGroupedSelection>select(g[i]),
      barSeriesS = chartS.selectAll<Element, SeriesBarGrouped>('.series-bar-grouped'),
      legendS = chartS.selectAll<Element, Legend>('.legend');

    barSeriesS.datum((d) => d);

    const labelSeriesD = seriesLabelBarData({
      barContainer: barSeriesS,
      ...labels,
    });
    chartS
      .selectAll('.draw-area')
      .selectAll<Element, SeriesLabelBar>('.series-label-bar')
      .data(labelsEnabled ? [labelSeriesD] : [])
      .join((enter) => enter.append('g').call((s) => seriesLabelBar(s)));

    legendS.datum((d) =>
      Object.assign(
        d,
        {
          labels: subcategories,
          indices: subcategoryIndices,
        },
        legend,
        { keys: subcategories }
      )
    );

    xAxis.scale = categoryScale;
    yAxis.scale = valueScale;
    chartCartesianUpdateAxes(chartS);

    chartS
      .selectAll(`.axis-x .tick`)
      .on('mouseover.chartbargroupedhighlight mouseout.chartbargroupedhighlight', (e) =>
        chartBarGroupedHoverAxisTick(chartS, select(e.currentTarget), e.type.endsWith('over'))
      );
  });
}

export const chartBarGroupedHoverBar = chartBarStackedHoverBar;

export const chartBarGroupedHoverLegendItem = chartBarStackedHoverLegendItem;

export const chartBarGroupedHoverAxisTick = chartBarStackedHoverAxisTick;
