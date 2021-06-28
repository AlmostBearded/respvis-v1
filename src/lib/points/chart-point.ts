import { BaseType, select, Selection } from 'd3-selection';
import { debug, nodeToString } from '../core';
import {
  chartCartesian,
  chartCartesianUpdateAxes,
  dataChartCartesian,
  DataChartCartesian,
} from '../core/chart-cartesian';
import { DataSeriesPoint, dataSeriesPoint, seriesPoint } from './series-point';

export interface DataChartPoint extends DataSeriesPoint, DataChartCartesian {}

export function dataChartPoint(data: Partial<DataChartPoint>): DataChartPoint {
  return {
    ...dataSeriesPoint(data),
    ...dataChartCartesian(data),
  };
}

export function chartPoint<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataChartPoint,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .call((s) => chartCartesian(s, false))
    .classed('chart-point', true)
    .each((d, i, g) => {
      const drawArea = select<GElement, Datum>(g[i])
        .selectAll('.draw-area')
        .attr('overflow', 'hidden');

      drawArea
        .append('rect')
        .classed('background', true)
        .layout('grid-area', '1 / 1')
        .attr('opacity', 0);

      drawArea
        .append('g')
        .layout('grid-area', '1 / 1')
        .datum(d)
        .call((s) => seriesPoint(s));
    })
    .on('datachange.debuglog', function () {
      debug(`data change on ${nodeToString(this)}`);
    })
    .on('datachange.chartpoint', function (e, chartData) {
      chartPointDataChange(select<GElement, Datum>(this));
    })
    .call((s) => chartPointDataChange(s));
}

export function chartPointDataChange<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataChartPoint,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.each(function (chartData, i, g) {
    const s = select<GElement, Datum>(g[i]);

    s.selectAll('.series-point').dispatch('datachange');

    chartData.flipped = false;
    chartData.mainAxis.scale = chartData.mainScale;
    chartData.crossAxis.scale = chartData.crossScale;

    chartCartesianUpdateAxes(s);
  });
}
