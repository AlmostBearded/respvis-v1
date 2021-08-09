import { select, Selection } from 'd3-selection';
import { axisTickFindByIndex } from '../axis';
import {
  debug,
  nodeToString,
  siblingIndex,
  classOneOfEnum,
  siblingIndexSameClasses,
} from '../core';
import {
  chartCartesian,
  chartCartesianUpdateAxes,
  chartCartesianData,
  ChartCartesian as ChartCartesian,
} from '../core/chart-cartesian';
import {
  LegendSquares,
  legendSquaresData,
  LegendSquaresItem,
  legendItemFindByIndex,
  legendSquares,
  LegendOrientation,
  LegendPosition,
} from '../legend';
import { barFindByCategory } from './series-bar';
import {
  barGroupedFindBySubcategory,
  BarGrouped,
  SeriesBarGrouped,
  seriesBarGroupedData,
  seriesBarGrouped,
} from './series-bar-grouped';
import { labelFind, labelFindByFilter } from './series-label';
import { SeriesLabelBar, seriesLabelBarData, seriesLabelBar } from './series-label-bar';

export interface ChartBarGrouped extends SeriesBarGrouped, ChartCartesian {
  legend: Partial<LegendSquares>;
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
        .datum(legendSquaresData(chartData.legend))
        .call((s) => legendSquares(s))
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
      legendS = chartS.selectAll<Element, LegendSquares>('.legend');

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
      Object.assign<LegendSquares, Partial<LegendSquares>, Partial<LegendSquares>>(
        d,
        {
          labels: subcategories,
          indices: subcategoryIndices,
        },
        legend
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

export function chartBarGroupedHoverBar(
  chart: Selection<Element, ChartBarGrouped>,
  bar: Selection<SVGRectElement, BarGrouped>,
  hover: boolean
): void {
  const chartD = chart.datum();
  bar.each((barD, i, g) => {
    const categoryIndex = chartD.categories.indexOf(barD.category);
    const subcategoryIndex = chartD.subcategories.indexOf(barD.subcategory);
    labelFind(chart, barD.key).classed('highlight', hover);
    axisTickFindByIndex(chart.selectAll('.axis-x'), categoryIndex).classed('highlight', hover);
    legendItemFindByIndex(chart, subcategoryIndex).classed('highlight', hover);
  });
}

export function chartBarGroupedHoverLegendItem(
  chart: Selection<Element, ChartBarGrouped>,
  legendItem: Selection<Element, LegendSquaresItem>,
  hover: boolean
): void {
  const legendItemCount = chart.selectAll('.legend-item').size();
  legendItem.each((_, i, g) => {
    const legendItemI = siblingIndex(g[i], '.legend-item');
    const subcategory = chart.datum().subcategories[legendItemI];

    barGroupedFindBySubcategory(chart, subcategory).classed('highlight', hover);
    labelFindByFilter(
      chart.selectAll('.series-label-bar'),
      (_, i) => i % legendItemCount === legendItemI
    ).classed('highlight', hover);
  });
}

export function chartBarGroupedHoverAxisTick(
  chart: Selection<Element, ChartBarGrouped>,
  tick: Selection<Element>,
  hover: boolean
): void {
  const legendItemCount = chart.selectAll('.legend-item').size();
  tick.each((_, i, g) => {
    const tickI = siblingIndex(g[i], '.tick');
    const category = chart.datum().categories[tickI];
    barFindByCategory(chart, category).classed('highlight', hover);
    labelFindByFilter(
      chart.selectAll('.series-label-bar'),
      (_, i) => Math.floor(i / legendItemCount) === tickI
    ).classed('highlight', hover);
  });
  tick.classed('highlight', hover);
}
