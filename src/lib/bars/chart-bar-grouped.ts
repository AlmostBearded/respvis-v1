import { BaseType, select, Selection } from 'd3-selection';
import { axisTickFindByIndex, axisTickHighlight } from '../axis';
import { COLORS_CATEGORICAL, debug, nodeToString, siblingIndex } from '../core';
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
import { barFind, barFindByIndex, barHighlight, DataBar, JoinEvent, seriesBar } from './series-bar';
import {
  DataBarGrouped,
  DataSeriesBarGrouped,
  dataSeriesBarGrouped,
  seriesBarGrouped,
} from './series-bar-grouped';
import {
  labelFind,
  labelFindByFilter,
  labelFindByIndex,
  labelHighlight,
  seriesLabel,
} from './series-label';
import { dataSeriesLabelBar } from './series-label-bar';

export interface DataChartBarGrouped extends DataSeriesBarGrouped, DataChartCartesian {
  legend: Partial<DataLegendSquares>;
  colors: string[];
}

export function dataChartBarGrouped(data: Partial<DataChartBarGrouped>): DataChartBarGrouped {
  return {
    ...dataSeriesBarGrouped(data),
    ...dataChartCartesian(data),
    legend: data.legend || {},
    colors: data.colors || COLORS_CATEGORICAL,
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
        .on('barupdate', (e: JoinEvent<SVGRectElement, DataBar>) =>
          e.detail.selection.attr('fill', (d) => chartData.colors[d.index])
        )
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
    const s = select<GElement, Datum>(g[i]);

    s.selectAll('.series-bar-grouped').dispatch('datachange');

    s.selectAll<Element, DataLegendSquares>('.legend').datum((d) => {
      d.colors = chartData.colors;
      return d;
    });

    chartData.mainAxis.scale = chartData.mainScale;
    chartData.crossAxis.scale = chartData.crossScale;
    chartCartesianUpdateAxes(s);
  });
}

export function chartBarGroupedHoverBar(
  chart: Selection,
  bar: Selection<SVGRectElement, DataBarGrouped>,
  hover: boolean
) {
  bar.each((barD, i, g) => {
    const labelS = labelFind(chart, barD.key),
      tickS = axisTickFindByIndex(chart.selectAll('.axis-main'), barD.groupIndex),
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
) {
  const legendItemCount = chart.selectAll('.legend-item').size();
  legendItem.each((_, i, g) => {
    const legendItemS = select<Element, DataLegendItem>(g[i]),
      legendItemI = siblingIndex(g[i], '.legend-item'),
      barS = barFindByIndex<DataBarGrouped>(chart, legendItemI),
      labelS = labelFindByFilter(
        chart.selectAll('.series-label .label'),
        (_, i) => i % legendItemCount === legendItemI
      );

    barHighlight(barS, hover);
    labelHighlight(labelS, hover);
  });
}
