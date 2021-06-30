import { BaseType, select, Selection } from 'd3-selection';
import { COLORS_CATEGORICAL, debug, nodeToString } from '../core';
import {
  chartCartesian,
  chartCartesianUpdateAxes,
  dataChartCartesian,
  DataChartCartesian,
} from '../core/chart-cartesian';
import { DataLegendSquares, dataLegendSquares, legend } from '../legend';
import { DataBar, JoinEvent, seriesBar } from './series-bar';
import { DataSeriesBarGrouped, dataSeriesBarGrouped, seriesBarGrouped } from './series-bar-grouped';
import { seriesLabel } from './series-label';
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
        .layout('justify-content', 'flex-end');
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
