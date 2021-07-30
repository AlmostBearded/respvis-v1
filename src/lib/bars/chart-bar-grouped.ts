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
  dataChartCartesian,
  DataChartCartesian,
} from '../core/chart-cartesian';
import {
  DataLegendSquares,
  dataLegendSquares,
  DataLegendSquaresItem,
  legendItemFindByIndex,
  legendItemHighlight,
  legendSquares,
} from '../legend';
import { barFindByCategory } from './series-bar';
import {
  barGroupedFindBySubcategory,
  barGroupedHighlight,
  DataBarGrouped,
  DataSeriesBarGrouped,
  dataSeriesBarGrouped,
  seriesBarGrouped,
} from './series-bar-grouped';
import { labelFind, labelFindByFilter, labelHighlight, seriesLabel } from './series-label';
import { DataSeriesLabelBar, dataSeriesLabelBar, seriesLabelBar } from './series-label-bar';

export interface DataChartBarGrouped extends DataSeriesBarGrouped, DataChartCartesian {
  legend: Partial<DataLegendSquares>;
  labels: Partial<DataSeriesLabelBar>;
}

export function dataChartBarGrouped(data: Partial<DataChartBarGrouped>): DataChartBarGrouped {
  const seriesData = dataSeriesBarGrouped(data);
  return {
    ...seriesData,
    ...dataChartCartesian(data),
    legend: data.legend || {},
    labels: data.labels || {},
  };
}

export function chartBarGrouped<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataChartBarGrouped,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .call((s) => chartCartesian(s, false))
    .classed('chart-bar-grouped', true)
    .layout('flex-direction', 'column-reverse')
    .each((chartData, i, g) => {
      const chart = select<GElement, Datum>(g[i]);
      const drawArea = chart.selectAll('.draw-area');

      const barSeries = drawArea
        .append('g')
        .layout('grid-area', '1 / 1')
        .datum(chartData)
        .call((s) => seriesBarGrouped(s))
        .on('mouseover.chartbargroupedhighlight mouseout.chartbargroupedhighlight', (e) =>
          chartBarGroupedHoverBar(chart, select(e.target), e.type.endsWith('over'))
        );

      drawArea
        .append('g')
        .layout('grid-area', '1 / 1')
        .datum(dataSeriesLabelBar({ barContainer: barSeries }))
        .call((s) => seriesLabelBar(s));

      chart
        .append('g')
        .classed('legend', true)
        .datum(dataLegendSquares(chartData.legend))
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
      chartBarGroupedDataChange(select<GElement, Datum>(this));
    })
    .call((s) => chartBarGroupedDataChange(s));
}

export function chartBarGroupedDataChange<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataChartBarGrouped,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.each(function (chartData, i, g) {
    const {
        colors,
        strokes,
        strokeWidths,
        subcategories,
        xAxis,
        yAxis,
        categoryScale,
        valueScale,
      } = chartData,
      s = select<GElement, Datum>(g[i]),
      barSeries = s.selectAll('.series-bar-grouped'),
      labelSeries = s.selectAll<Element, DataSeriesLabelBar>('.series-label-bar'),
      legend = s.selectAll<Element, DataLegendSquares>('.legend');

    barSeries.dispatch('datachange');

    legend.datum((d) =>
      Object.assign<DataLegendSquares, Partial<DataLegendSquares>, Partial<DataLegendSquares>>(
        d,
        {
          colors: arrayIs2D(colors) ? colors[0] : colors,
          strokes: arrayIs2D(strokes) ? strokes[0] : strokes,
          strokeWidths: arrayIs2D(strokeWidths) ? strokeWidths[0] : strokeWidths,
          labels: subcategories,
        },
        chartData.legend
      )
    );

    labelSeries.datum((d) =>
      Object.assign<DataSeriesLabelBar, Partial<DataSeriesLabelBar>, Partial<DataSeriesLabelBar>>(
        d,
        { labels: arrayFlat(chartData.values).map((v) => v.toString()) },
        chartData.labels
      )
    );

    xAxis.scale = categoryScale;
    yAxis.scale = valueScale;
    chartCartesianUpdateAxes(s);

    s.selectAll(`.axis-x .tick`).on(
      'mouseover.chartbargroupedhighlight mouseout.chartbargroupedhighlight',
      (e) => chartBarGroupedHoverAxisTick(s, select(e.currentTarget), e.type.endsWith('over'))
    );
  });
}

export function chartBarGroupedHoverBar(
  chart: Selection<Element, DataChartBarGrouped>,
  bar: Selection<SVGRectElement, DataBarGrouped>,
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
  chart: Selection<Element, DataChartBarGrouped>,
  legendItem: Selection<Element, DataLegendSquaresItem>,
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
  chart: Selection<Element, DataChartBarGrouped>,
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
