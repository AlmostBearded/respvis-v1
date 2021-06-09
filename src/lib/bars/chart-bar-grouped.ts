import { BaseType, select, Selection } from 'd3-selection';
import { axisBottom, axisLeft, DataAxis, dataAxis } from '../axis';
import { chart, debug, nodeToString } from '../core';
import {
  chartCartesian,
  chartCartesianUpdateAxes,
  dataChartCartesian,
  DataChartCartesian,
} from '../core/chart-cartesian';
import { seriesBar } from './series-bar';
import {
  dataBarsGroupedCreation,
  DataBarsGroupedCreation,
  DataSeriesBarGrouped,
  dataSeriesBarGrouped,
  seriesBarGrouped,
} from './series-bar-grouped';
import { seriesLabel } from './series-label';
import { dataLabelsBarCreation, dataSeriesLabelBar } from './series-label-bar';

export interface DataChartBarGrouped extends DataBarsGroupedCreation, DataChartCartesian {}

export function dataChartBarGrouped(data?: Partial<DataChartBarGrouped>): DataChartBarGrouped {
  return {
    ...dataBarsGroupedCreation(data),
    ...dataChartCartesian(data),
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
    .each((d, i, g) => {
      const drawArea = select<GElement, Datum>(g[i]).selectAll('.draw-area');

      const barSeries = drawArea
        .append('g')
        .layout('grid-area', '1 / 1')
        .datum(dataSeriesBarGrouped(d))
        .call((s) => seriesBarGrouped(s));

      drawArea
        .append('g')
        .layout('grid-area', '1 / 1')
        .datum(dataSeriesLabelBar(dataLabelsBarCreation({ barContainer: barSeries })))
        .call((s) => seriesLabel(s));
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

    s.selectAll<SVGElement, DataSeriesBarGrouped>('.series-bar-grouped').datum((d) =>
      Object.assign(d, { creation: chartData })
    );

    chartData.mainAxis.scale = chartData.mainScale;
    chartData.crossAxis.scale = chartData.crossScale;

    chartCartesianUpdateAxes(s);
  });
}
