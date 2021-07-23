import { BaseType, select, Selection } from 'd3-selection';
import { axisTickFindByIndex, axisTickHighlight } from '../axis';
import { arrayIs2D, COLORS_CATEGORICAL, debug, nodeToString, siblingIndex } from '../core';
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
  legendItemHighlight,
} from '../legend';
import { barFindByIndex, barHighlight, DataBar, JoinEvent } from './series-bar';
import {
  barGroupedFindByGroupIndex,
  DataBarGrouped,
  DataSeriesBarGrouped,
  dataSeriesBarGrouped,
  seriesBarGrouped,
} from './series-bar-grouped';
import { labelFind, labelFindByFilter, labelHighlight, seriesLabel } from './series-label';
import { dataSeriesLabelBar } from './series-label-bar';

export interface DataChartBarGrouped extends DataSeriesBarGrouped, DataChartCartesian {
  legend: Partial<DataLegendSquares>;
  subcategories: string[];
}

export function dataChartBarGrouped(data: Partial<DataChartBarGrouped>): DataChartBarGrouped {
  const seriesData = dataSeriesBarGrouped(data);
  return {
    ...seriesData,
    ...dataChartCartesian(data),
    legend: data.legend || {},
    subcategories: data.subcategories || (seriesData.values[0] || []).map((d, i) => i.toString()),
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
        .call((s) => seriesLabel(s));

      chart
        .append('g')
        .classed('legend', true)
        .datum(dataLegendSquares(chartData.legend))
        .call((s) => legend(s))
        .layout('margin', '0.5rem')
        .layout('justify-content', 'flex-end')
        .on('legenditementer.chartbargrouped', (e: JoinEvent<SVGGElement, DataLegendItem>) => {
          e.detail.selection.on(
            'mouseover.chartbargroupedhighlight mouseout.chartbargroupedhighlight',
            (e) => {
              chartBarGroupedHoverLegendItem(
                chart,
                select(e.currentTarget),
                e.type.endsWith('over')
              );
            }
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
    const s = select<GElement, Datum>(g[i]),
      barSeries = s.selectAll('.series-bar-grouped'),
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

    s.selectAll(`.axis-x .tick`).on('mouseover mouseout', (e) =>
      chartBarGroupedHoverAxisTick(s, select(e.currentTarget), e.type.endsWith('over'))
    );
  });
}

export function chartBarGroupedHoverBar(
  chart: Selection,
  bar: Selection<SVGRectElement, DataBarGrouped>,
  hover: boolean
): void {
  bar.each((barD, i, g) => {
    const labelS = labelFind(chart, barD.key),
      tickS = axisTickFindByIndex(chart.selectAll('.axis-x'), barD.groupIndex),
      legendItemS = legendItemFindByIndex(chart, barD.index);

    labelHighlight(labelS, hover);
    axisTickHighlight(tickS, hover);
    legendItemHighlight(legendItemS, hover);
  });
}

export function chartBarGroupedHoverLegendItem(
  chart: Selection,
  legendItem: Selection<Element, DataLegendItem>,
  hover: boolean
): void {
  const legendItemCount = chart.selectAll('.legend-item').size();
  legendItem.each((_, i, g) => {
    const legendItemI = siblingIndex(g[i], '.legend-item'),
      barS = barFindByIndex<DataBarGrouped>(chart, legendItemI),
      labelS = labelFindByFilter(
        chart.selectAll('.series-label'),
        (_, i) => i % legendItemCount === legendItemI
      );

    barHighlight(barS, hover);
    labelHighlight(labelS, hover);
  });
}

export function chartBarGroupedHoverAxisTick(
  chart: Selection,
  tick: Selection<Element>,
  hover: boolean
): void {
  const legendItemCount = chart.selectAll('.legend-item').size();
  tick.each((_, i, g) => {
    const tickI = siblingIndex(g[i], '.tick'),
      barS = barGroupedFindByGroupIndex(chart, tickI),
      labelS = labelFindByFilter(
        chart.selectAll('.series-label'),
        (_, i) => Math.floor(i / legendItemCount) === tickI
      );
    barHighlight(barS, hover);
    labelHighlight(labelS, hover);
  });
  axisTickHighlight(tick, hover);
}
