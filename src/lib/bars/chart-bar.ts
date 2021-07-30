import { BaseType, select, Selection } from 'd3-selection';
import { axisTickFindByIndex, axisTickHighlight } from '../axis';
import { debug, nodeToString, siblingIndexSameClasses } from '../core';
import {
  chartCartesian,
  chartCartesianUpdateAxes,
  dataChartCartesian,
  DataChartCartesian,
} from '../core/chart-cartesian';
import { seriesBar, dataSeriesBar, DataSeriesBar, DataBar, barFind } from './series-bar';
import { labelHighlight, labelFind } from './series-label';
import { DataSeriesLabelBar, dataSeriesLabelBar, seriesLabelBar } from './series-label-bar';

export interface DataChartBar extends DataSeriesBar, DataChartCartesian {
  labels: Partial<DataSeriesLabelBar>;
}

export function dataChartBar(data: Partial<DataChartBar>): DataChartBar {
  return {
    ...dataSeriesBar(data),
    ...dataChartCartesian(data),
    labels: data.labels || {},
  };
}

export function chartBar<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataChartBar,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .call((s) => chartCartesian(s, false))
    .classed('chart-bar', true)
    .each((chartData, i, g) => {
      const chart = select<GElement, Datum>(g[i]);
      const drawArea = chart.selectAll('.draw-area');

      const barSeries = drawArea
        .append('g')
        .layout('grid-area', '1 / 1')
        .datum<DataSeriesBar>(chartData)
        .call((s) => seriesBar(s))
        .on('mouseover.chartbarhighlight', (e) => chartBarHoverBar(chart, select(e.target), true))
        .on('mouseout.chartbarhighlight', (e) => chartBarHoverBar(chart, select(e.target), false));

      drawArea
        .append('g')
        .layout('grid-area', '1 / 1')
        .datum(dataSeriesLabelBar({ barContainer: barSeries }))
        .call((s) => seriesLabelBar(s));
    })
    .on('datachange.debuglog', function () {
      debug(`data change on ${nodeToString(this)}`);
    })
    .on('datachange.chartbar', function (e, chartData) {
      chartBarDataChange(select<GElement, Datum>(this));
    })
    .call((s) => chartBarDataChange(s));
}

export function chartBarDataChange<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataChartBar,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.each(function (chartData, i, g) {
    const s = select<GElement, Datum>(g[i]),
      labelSeries = s.selectAll<Element, DataSeriesLabelBar>('.series-label-bar');

    s.selectAll('.series-bar').dispatch('datachange');

    labelSeries.datum((d) =>
      Object.assign<DataSeriesLabelBar, Partial<DataSeriesLabelBar>, Partial<DataSeriesLabelBar>>(
        d,
        { labels: chartData.values.map((v) => v.toString()) },
        chartData.labels
      )
    );

    chartData.xAxis.scale = chartData.categoryScale;
    chartData.yAxis.scale = chartData.valueScale;

    chartCartesianUpdateAxes(s);
  });
}

export function chartBarHoverBar(
  chart: Selection,
  bar: Selection<Element, DataBar>,
  hover: boolean
) {
  bar.each((barD, i, g) => {
    const categoryIndex = siblingIndexSameClasses(g[i]),
      labelS = labelFind(chart, barD.key),
      tickS = axisTickFindByIndex(chart.selectAll('.axis-x'), categoryIndex);

    labelHighlight(labelS, hover);
    axisTickHighlight(tickS, hover);
  });
}
