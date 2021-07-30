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
  ChartCartesian,
} from '../core/chart-cartesian';
import {
  LegendSquares,
  legendSquaresData,
  LegendSquaresItem,
  legendItemFindByIndex,
  legendItemFindByLabel,
  legendItemHighlight,
  legendSquares,
} from '../legend';
import { barFindByCategory } from './series-bar';
import { BarGrouped } from './series-bar-grouped';
import {
  barStackedFindBySubcategory,
  barStackedHighlight,
  SeriesBarStacked,
  seriesBarStackedData,
  seriesBarStacked,
} from './series-bar-stacked';
import { labelFind, labelFindByFilter, labelHighlight, seriesLabel } from './series-label';
import { SeriesLabelBar, seriesLabelBarData, seriesLabelBar } from './series-label-bar';

export interface ChartBarStacked extends SeriesBarStacked, ChartCartesian {
  legend: Partial<LegendSquares>;
  labels: Partial<SeriesLabelBar>;
}

export function chartBarStackedData(data: Partial<ChartBarStacked>): ChartBarStacked {
  const seriesData = seriesBarStackedData(data);
  return {
    ...seriesData,
    ...chartCartesianData(data),
    legend: data.legend || {},
    labels: data.labels || {},
  };
}

// todo: unify the code for normal, grouped and stacked bar charts?

export type ChartBarStackedSelection = Selection<SVGSVGElement | SVGGElement, ChartBarStacked>;

export function chartBarStacked(selection: ChartBarStackedSelection): void {
  selection
    .call((s) => chartCartesian(s, false))
    .classed('chart-bar-stacked', true)
    .layout('flex-direction', 'column-reverse')
    .each((chartData, i, g) => {
      const chart = <ChartBarStackedSelection>select(g[i]);
      const drawArea = chart.selectAll('.draw-area');

      const barSeries = drawArea
        .append('g')
        .layout('grid-area', '1 / 1')
        .datum(chartData)
        .call((s) => seriesBarStacked(s))
        .on('mouseover.chartbarstackedhighlight mouseout.chartbarstackedhighlight', (e) =>
          chartBarStackedHoverBar(chart, select(e.target), e.type.endsWith('over'))
        );

      drawArea
        .append('g')
        .layout('grid-area', '1 / 1')
        .datum(seriesLabelBarData({ barContainer: barSeries }))
        .call((s) => seriesLabelBar(s));

      chart
        .append('g')
        .classed('legend', true)
        .datum(legendSquaresData(chartData.legend))
        .call((s) => legendSquares(s))
        .layout('margin', '0.5rem')
        .layout('justify-content', 'flex-end')
        .on('mouseover.chartbarstackedhighlight mouseout.chartbarstackedhighlight', (e) => {
          chartBarStackedHoverLegendItem(
            chart,
            select(e.target.closest('.legend-item')),
            e.type.endsWith('over')
          );
        });
    })
    .on('datachange.debuglog', function () {
      debug(`data change on ${nodeToString(this)}`);
    })
    .on('datachange.chartbarstacked', function (e, chartData) {
      chartBarStackedDataChange(<ChartBarStackedSelection>select(this));
    })
    .call((s) => chartBarStackedDataChange(s));
}

export function chartBarStackedDataChange(selection: ChartBarStackedSelection): void {
  selection.each(function (chartData, i, g) {
    const s = <ChartBarStackedSelection>select(g[i]),
      barSeries = s.selectAll('.series-bar-stacked'),
      labelSeries = s.selectAll<Element, SeriesLabelBar>('.series-label-bar'),
      legend = s.selectAll<Element, LegendSquares>('.legend');

    barSeries.dispatch('datachange');
    legend.datum((d) =>
      Object.assign<LegendSquares, Partial<LegendSquares>, Partial<LegendSquares>>(
        d,
        {
          colors: arrayIs2D(chartData.colors) ? chartData.colors[0] : chartData.colors,
          labels: chartData.subcategories,
        },
        chartData.legend
      )
    );

    labelSeries.datum((d) =>
      Object.assign<SeriesLabelBar, Partial<SeriesLabelBar>, Partial<SeriesLabelBar>>(
        d,
        { labels: arrayFlat(chartData.values).map((v) => v.toString()) },
        chartData.labels
      )
    );

    chartData.xAxis.scale = chartData.categoryScale;
    chartData.yAxis.scale = chartData.valueScale;

    chartCartesianUpdateAxes(s);

    s.selectAll(`.axis-x .tick`).on(
      'mouseover.chartbarstackedhighlight mouseout.chartbarstackedhighlight',
      (e) => chartBarStackedHoverAxisTick(s, select(e.currentTarget), e.type.endsWith('over'))
    );
  });
}

export function chartBarStackedHoverBar(
  chart: Selection<Element, ChartBarStacked>,
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

export function chartBarStackedHoverLegendItem(
  chart: Selection<Element, ChartBarStacked>,
  legendItem: Selection<Element, LegendSquaresItem>,
  hover: boolean
): void {
  const legendItemCount = chart.selectAll('.legend-item').size();
  legendItem.each((_, i, g) => {
    const legendItemI = siblingIndex(g[i], '.legend-item'),
      subcategory = chart.datum().subcategories[legendItemI],
      barS = barStackedFindBySubcategory(chart, subcategory),
      labelS = labelFindByFilter(
        chart.selectAll('.series-label-bar'),
        (_, i) => i % legendItemCount === legendItemI
      );

    barStackedHighlight(barS, hover);
    labelHighlight(labelS, hover);
  });
}

export function chartBarStackedHoverAxisTick(
  chart: Selection<Element, ChartBarStacked>,
  tick: Selection<Element>,
  hover: boolean
): void {
  const legendItemCount = chart.selectAll('.legend-item').size();
  tick.each((_, i, g) => {
    const tickI = siblingIndex(g[i], '.tick'),
      category = chart.datum().categories[tickI],
      barS = barFindByCategory(chart, category),
      labelS = labelFindByFilter(
        chart.selectAll('.series-label-bar'),
        (_, i) => Math.floor(i / legendItemCount) === tickI
      );
    barStackedHighlight(barS, hover);
    labelHighlight(labelS, hover);
  });
  axisTickHighlight(tick, hover);
}
