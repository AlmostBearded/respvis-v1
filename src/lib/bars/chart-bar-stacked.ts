import { BaseType, select, Selection } from 'd3-selection';
import { arrayIs2D, debug, nodeToString } from '../core';
import {
  chartCartesian,
  chartCartesianUpdateAxes,
  dataChartCartesian,
  DataChartCartesian,
} from '../core/chart-cartesian';
import { DataLegendSquares, dataLegendSquares, legend } from '../legend';
import { DataSeriesBarStacked, dataSeriesBarStacked, seriesBarStacked } from './series-bar-stacked';
import { seriesLabel } from './series-label';
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
        .call((s) => seriesBarStacked(s));

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
  });
}
