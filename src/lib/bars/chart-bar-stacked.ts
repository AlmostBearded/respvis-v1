import { BaseType, select, Selection } from 'd3-selection';
import { debug, nodeToString } from '../core';
import {
  chartCartesian,
  chartCartesianUpdateAxes,
  dataChartCartesian,
  DataChartCartesian,
} from '../core/cartesian-chart';
import {
  dataBarsStackedCreation,
  DataBarsStackedCreation,
  DataSeriesBarStacked,
  dataSeriesBarStacked,
  seriesBarStacked,
} from './series-bar-stacked';
import { seriesLabel } from './series-label';
import { dataLabelsBarCreation, dataSeriesLabelBar } from './series-label-bar';

export interface DataChartBarStacked extends DataBarsStackedCreation, DataChartCartesian {}

export function dataChartBarStacked(data?: Partial<DataChartBarStacked>): DataChartBarStacked {
  return {
    ...dataBarsStackedCreation(data),
    ...dataChartCartesian(data),
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
    .each((d, i, g) => {
      const drawArea = select<GElement, Datum>(g[i]).selectAll('.draw-area');

      const barSeries = drawArea
        .append('g')
        .layout('grid-area', '1 / 1')
        .datum(dataSeriesBarStacked(d))
        .call((s) => seriesBarStacked(s));

      drawArea
        .append('g')
        .layout('grid-area', '1 / 1')
        .datum(dataSeriesLabelBar(dataLabelsBarCreation({ barContainer: barSeries })))
        .call((s) => seriesLabel(s));
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
    const s = select<GElement, Datum>(g[i]);

    s.selectAll<SVGElement, DataSeriesBarStacked>('.series-bar-stacked').datum((d) =>
      Object.assign(d, { creation: chartData })
    );

    chartData.mainAxis.scale = chartData.mainScale;
    chartData.crossAxis.scale = chartData.crossScale;

    chartCartesianUpdateAxes(s);
  });
}
