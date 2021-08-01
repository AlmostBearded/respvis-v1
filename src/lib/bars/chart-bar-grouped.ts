import { BaseType, select, Selection } from 'd3-selection';
import { axisTickFindByIndex, axisTickHighlight } from '../axis';
import {
  arrayFlat,
  arrayIs2D,
  debug,
  nodeToString,
  siblingIndex,
  siblingIndexSameClasses,
} from '../core';
import {
  chartCartesian,
  chartCartesianUpdateAxes,
  chartCartesianData,
  ChartCartesian as ChartCartesian,
} from '../core/chart-cartesian';
import {
  LegendSquares as LegendSquares,
  legendSquaresData,
  LegendSquaresItem,
  legendItemFindByIndex,
  legendItemHighlight,
  legendSquares,
} from '../legend';
import { barFindByCategory } from './series-bar';
import {
  barGroupedFindBySubcategory,
  barGroupedHighlight,
  BarGrouped,
  SeriesBarGrouped,
  seriesBarGroupedData,
  seriesBarGrouped,
} from './series-bar-grouped';
import { labelFind, labelFindByFilter, labelHighlight, seriesLabel } from './series-label';
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
    .layout('flex-direction', 'column-reverse')
    .each((chartData, i, g) => {
      const chart = <ChartBarGroupedSelection>select(g[i]);
      const drawArea = chart.selectAll('.draw-area');

      drawArea
        .append('g')
        .layout('grid-area', '1 / 1')
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
        .layout('margin', '0.5rem')
        .layout('justify-content', 'flex-end')
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
        colors,
        strokes,
        strokeWidths,
        subcategories,
        xAxis,
        yAxis,
        categoryScale,
        valueScale,
      } = chartD,
      chartS = <ChartBarGroupedSelection>select(g[i]),
      barSeriesS = chartS.selectAll<Element, SeriesBarGrouped>('.series-bar-grouped'),
      legendS = chartS.selectAll<Element, LegendSquares>('.legend');

    barSeriesS.datum((d) => d);

    const labelSeriesD = seriesLabelBarData({
      barContainer: barSeriesS,
      labels: arrayFlat(chartD.values).map((v) => v.toString()),
      ...chartD.labels,
    });
    chartS
      .selectAll('.draw-area')
      .selectAll<Element, SeriesLabelBar>('.series-label-bar')
      .data(chartD.labelsEnabled ? [labelSeriesD] : [])
      .join((enter) =>
        enter
          .append('g')
          .layout('grid-area', '1 / 1')
          .call((s) => seriesLabelBar(s))
      );

    legendS.datum((d) =>
      Object.assign<LegendSquares, Partial<LegendSquares>, Partial<LegendSquares>>(
        d,
        {
          colors: arrayIs2D(colors) ? colors[0] : colors,
          strokes: arrayIs2D(strokes) ? strokes[0] : strokes,
          strokeWidths: arrayIs2D(strokeWidths) ? strokeWidths[0] : strokeWidths,
          labels: subcategories,
        },
        chartD.legend
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
    const categoryIndex = chartD.categories.indexOf(barD.category),
      subcategoryIndex = chartD.subcategories.indexOf(barD.subcategory),
      labelS = labelFind(chart, barD.key),
      tickS = axisTickFindByIndex(chart.selectAll('.axis-x'), categoryIndex),
      legendItemS = legendItemFindByIndex(chart, subcategoryIndex);

    labelHighlight(labelS, hover);
    axisTickHighlight(tickS, hover);
    legendItemHighlight(legendItemS, hover);
  });
}

export function chartBarGroupedHoverLegendItem(
  chart: Selection<Element, ChartBarGrouped>,
  legendItem: Selection<Element, LegendSquaresItem>,
  hover: boolean
): void {
  const legendItemCount = chart.selectAll('.legend-item').size();
  legendItem.each((_, i, g) => {
    const legendItemI = siblingIndex(g[i], '.legend-item'),
      subcategory = chart.datum().subcategories[legendItemI],
      barS = barGroupedFindBySubcategory(chart, subcategory),
      labelS = labelFindByFilter(
        chart.selectAll('.series-label-bar'),
        (_, i) => i % legendItemCount === legendItemI
      );

    barGroupedHighlight(barS, hover);
    labelHighlight(labelS, hover);
  });
}

export function chartBarGroupedHoverAxisTick(
  chart: Selection<Element, ChartBarGrouped>,
  tick: Selection<Element>,
  hover: boolean
): void {
  const legendItemCount = chart.selectAll('.legend-item').size();
  tick.each((_, i, g) => {
    const tickI = siblingIndexSameClasses(g[i]),
      category = chart.datum().categories[tickI],
      barS = barFindByCategory(chart, category),
      labelS = labelFindByFilter(
        chart.selectAll('.series-label-bar'),
        (_, i) => Math.floor(i / legendItemCount) === tickI
      );
    barGroupedHighlight(barS, hover);
    labelHighlight(labelS, hover);
  });
  axisTickHighlight(tick, hover);
}
