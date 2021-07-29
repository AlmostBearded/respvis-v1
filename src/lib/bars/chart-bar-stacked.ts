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
  DataLegendItem,
  DataLegendSquares,
  dataLegendSquares,
  legend,
  legendItemFindByIndex,
  legendItemFindByLabel,
  legendItemHighlight,
} from '../legend';
import { barFindByCategory, barHighlight } from './series-bar';
import { DataBarGrouped } from './series-bar-grouped';
import {
  barStackedFindBySubcategory,
  DataSeriesBarStacked,
  dataSeriesBarStacked,
  seriesBarStacked,
} from './series-bar-stacked';
import { labelFind, labelFindByFilter, labelHighlight, seriesLabel } from './series-label';
import { dataSeriesLabelBar } from './series-label-bar';

export interface DataChartBarStacked extends DataSeriesBarStacked, DataChartCartesian {
  legend: Partial<DataLegendSquares>;
  subcategories: string[];
}

export function dataChartBarStacked(data: Partial<DataChartBarStacked>): DataChartBarStacked {
  const seriesData = dataSeriesBarStacked(data);
  return {
    ...seriesData,
    ...dataChartCartesian(data),
    legend: data.legend || {},
    subcategories: data.subcategories || (seriesData.values[0] || []).map((d, i) => i.toString()),
  };
}

// todo: unify the code for normal, grouped and stacked bar charts?

export function chartBarStacked<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataChartBarStacked,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .call((s) => chartCartesian(s, false))
    .classed('chart-bar-stacked', true)
    .layout('flex-direction', 'column-reverse')
    .each((chartData, i, g) => {
      const chart = select<GElement, Datum>(g[i]);
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
        .datum(dataSeriesLabelBar({ barContainer: barSeries }))
        .call((s) => seriesLabel(s));

      chart
        .append('g')
        .classed('legend', true)
        .datum(dataLegendSquares(chartData.legend))
        .call((s) => legend(s))
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
      chartBarStackedDataChange(select<GElement, Datum>(this));
    })
    .call((s) => chartBarStackedDataChange(s));
}

export function chartBarStackedDataChange<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataChartBarStacked,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.each(function (chartData, i, g) {
    const s = select<GElement, Datum>(g[i]),
      barSeries = s.selectAll('.series-bar-stacked'),
      legend = s.selectAll<Element, DataLegendSquares>('.legend');

    barSeries.dispatch('datachange');
    legend.datum((d) =>
      Object.assign<DataLegendSquares, Partial<DataLegendSquares>, Partial<DataLegendSquares>>(
        d,
        {
          colors: arrayIs2D(chartData.colors) ? chartData.colors[0] : chartData.colors,
          labels: chartData.subcategories,
        },
        chartData.legend
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
  chart: Selection<Element, DataChartBarStacked>,
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

export function chartBarStackedHoverLegendItem(
  chart: Selection<Element, DataChartBarStacked>,
  legendItem: Selection<Element, DataLegendItem>,
  hover: boolean
): void {
  const legendItemCount = chart.selectAll('.legend-item').size();
  legendItem.each((_, i, g) => {
    const legendItemI = siblingIndex(g[i], '.legend-item'),
      subcategory = chart.datum().subcategories[legendItemI],
      barS = barStackedFindBySubcategory(chart, subcategory),
      labelS = labelFindByFilter(
        chart.selectAll('.series-label'),
        (_, i) => i % legendItemCount === legendItemI
      );

    barHighlight(barS, hover);
    labelHighlight(labelS, hover);
  });
}

export function chartBarStackedHoverAxisTick(
  chart: Selection<Element, DataChartBarStacked>,
  tick: Selection<Element>,
  hover: boolean
): void {
  const legendItemCount = chart.selectAll('.legend-item').size();
  tick.each((_, i, g) => {
    const tickI = siblingIndex(g[i], '.tick'),
      category = chart.datum().categories[tickI],
      barS = barFindByCategory(chart, category),
      labelS = labelFindByFilter(
        chart.selectAll('.series-label'),
        (_, i) => Math.floor(i / legendItemCount) === tickI
      );
    barHighlight(barS, hover);
    labelHighlight(labelS, hover);
  });
  axisTickHighlight(tick, hover);
}
