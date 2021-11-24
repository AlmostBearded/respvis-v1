import { BaseType, select, Selection } from 'd3-selection';
import { arrayFlat, debug, nodeToString, rectRound } from '../core';
import {
  chartCartesian,
  chartCartesianUpdateAxes,
  chartCartesianData,
  ChartCartesian,
} from '../core/chart-cartesian';
import {
  LegendSquares,
  legendSquaresData,
  legendSquares,
  LegendPosition,
  LegendSquaresItem,
} from '../legend';
import { Bar } from './series-bar';
import { BarGrouped } from './series-bar-grouped';
import { SeriesBarStacked, seriesBarStackedData, seriesBarStacked } from './series-bar-stacked';
import { SeriesLabelBar, seriesLabelBarData, seriesLabelBar } from './series-label-bar';

export interface ChartBarStacked extends SeriesBarStacked, ChartCartesian {
  legend: Partial<LegendSquares>;
  labelsEnabled: boolean;
  labels: Partial<SeriesLabelBar>;
}

export function chartBarStackedData(data: Partial<ChartBarStacked>): ChartBarStacked {
  const seriesData = seriesBarStackedData(data);
  return {
    ...seriesData,
    ...chartCartesianData(data),
    legend: data.legend || {},
    labelsEnabled: data.labelsEnabled ?? true,
    labels: {
      labels: (bar) => (bar.height > 10 && bar.width > 7 ? Math.round(bar.value).toString() : ''),
      ...data.labels,
    },
  };
}

// todo: unify the code for normal, grouped and stacked bar charts?

export type ChartBarStackedSelection = Selection<SVGSVGElement | SVGGElement, ChartBarStacked>;

export function chartBarStacked(selection: ChartBarStackedSelection): void {
  selection
    .call((s) => chartCartesian(s, false))
    .classed('chart-bar-stacked', true)
    .classed(LegendPosition.Right, true)
    .each((chartData, i, g) => {
      const chart = <ChartBarStackedSelection>select(g[i]);
      const drawArea = chart.selectAll('.draw-area');

      drawArea
        .append('g')
        .datum(chartData)
        .call((s) => seriesBarStacked(s))
        .on('mouseover.chartbarstackedhighlight mouseout.chartbarstackedhighlight', (e) =>
          chartBarStackedHoverBar(chart, select(e.target), e.type.endsWith('over'))
        );

      chart
        .append('g')
        .classed('legend', true)
        .datum(legendSquaresData(chartData.legend))
        .call((s) => legendSquares(s))
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
      chartBarStackedDataChange(<ChartBarStackedSelection>select(this));
    })
    .call((s) => chartBarStackedDataChange(s));
}

export function chartBarStackedDataChange(selection: ChartBarStackedSelection): void {
  selection.each(function (chartD, i, g) {
    const {
        subcategories,
        subcategoryIndices,
        xAxis,
        yAxis,
        categoryScale,
        valueScale,
        labelsEnabled,
        legend,
        labels,
      } = chartD,
      chartS = <ChartBarStackedSelection>select(g[i]),
      barSeriesS = chartS.selectAll<Element, SeriesBarStacked>('.series-bar-stacked'),
      legendS = chartS.selectAll<Element, LegendSquares>('.legend');

    barSeriesS.datum((d) => d);

    const labelSeriesD = seriesLabelBarData({
      barContainer: barSeriesS,
      ...labels,
    });
    chartS
      .selectAll('.draw-area')
      .selectAll<Element, SeriesLabelBar>('.series-label-bar')
      .data(labelsEnabled ? [labelSeriesD] : [])
      .join((enter) => enter.append('g').call((s) => seriesLabelBar(s)));

    legendS.datum((d) =>
      Object.assign(
        d,
        {
          labels: subcategories,
          indices: subcategoryIndices,
        },
        legend,
        { keys: subcategories }
      )
    );

    xAxis.scale = categoryScale;
    yAxis.scale = valueScale;
    chartCartesianUpdateAxes(chartS);

    chartS
      .selectAll(`.axis-x .tick`)
      .on('mouseover.chartbarstackedhighlight mouseout.chartbarstackedhighlight', (e) =>
        chartBarStackedHoverAxisTick(chartS, select(e.currentTarget), e.type.endsWith('over'))
      );
  });
}

export function chartBarStackedHoverBar(
  chart: Selection<Element, ChartBarStacked>,
  bar: Selection<SVGRectElement, BarGrouped>,
  hover: boolean
): void {
  bar.each((barD, i, g) => {
    chart.selectAll(`.label[data-key="${barD.key}"]`).classed('highlight', hover);
    chart.selectAll(`.axis-x .tick[data-key="${barD.category}"]`).classed('highlight', hover);
    chart.selectAll(`.legend-item[data-key="${barD.subcategory}"]`).classed('highlight', hover);
  });
}

export function chartBarStackedHoverLegendItem(
  chart: Selection<Element, ChartBarStacked>,
  legendItem: Selection<Element, LegendSquaresItem>,
  hover: boolean
): void {
  legendItem.each((_, i, g) => {
    const subcategory = g[i].getAttribute('data-key')!;
    chart
      .selectAll<any, Bar>(`.bar[subcategory="${subcategory}"]`)
      .classed('highlight', hover)
      .each((d) => chart.selectAll(`.label[data-key="${d.key}"]`).classed('highlight', hover));
  });
}

export function chartBarStackedHoverAxisTick(
  chart: Selection<Element, ChartBarStacked>,
  tick: Selection<Element>,
  hover: boolean
): void {
  tick.classed('highlight', hover).each((_, i, g) => {
    const category = g[i].getAttribute('data-key')!;
    chart
      .selectAll<any, Bar>(`.bar[category="${category}"]`)
      .classed('highlight', hover)
      .each((d) => chart.selectAll(`.label[data-key="${d.key}"]`).classed('highlight', hover));
  });
}
