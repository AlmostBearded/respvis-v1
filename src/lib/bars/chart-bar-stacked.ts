import { BaseType, select, Selection } from 'd3-selection';
import { arrayFlat, debug, nodeToString, rectRound } from '../core';
import {
  chartCartesian,
  chartCartesianAxes,
  chartCartesianData,
  ChartCartesian,
} from '../core/chart-cartesian';
import { Legend, legendData, legend, LegendPosition, LegendItem } from '../legend';
import { Bar } from './series-bar';
import { BarGrouped } from './series-bar-grouped';
import { SeriesBarStacked, seriesBarStackedData, seriesBarStacked } from './series-bar-stacked';
import { SeriesLabelBar, seriesLabelBarData, seriesLabelBar } from './series-label-bar';

export interface ChartBarStacked extends Omit<SeriesBarStacked, 'styleClasses'>, ChartCartesian {
  styleClasses: string[];
  legend: Partial<Legend>;
  labelsEnabled: boolean;
  labels: Partial<SeriesLabelBar>;
}

export function chartBarStackedData(data: Partial<ChartBarStacked>): ChartBarStacked {
  const seriesData = seriesBarStackedData(data);
  return {
    ...seriesData,
    ...chartCartesianData(data),
    styleClasses: data.styleClasses || seriesData.subcategories.map((c, i) => `categorical-${i}`),
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
    .call((s) => chartCartesian(s))
    .classed('chart-bar-stacked', true)
    .attr('data-legend-position', LegendPosition.Right)
    .each((chartD, i, g) => {
      const {
        subcategories,
        styleClasses,
        xAxis,
        yAxis,
        categoryScale,
        valueScale,
        labelsEnabled,
        legend: legendD,
        labels: labelsD,
      } = chartD;
      const chartS = <ChartBarStackedSelection>select(g[i]);
      const drawAreaS = chartS.selectAll('.draw-area');

      const barSeriesS = drawAreaS
        .selectAll<SVGGElement, SeriesBarStacked>('.series-bar-stacked')
        .data([chartD])
        .join('g')
        .call((s) => seriesBarStacked(s))
        .on('mouseover.chartbarstackedhighlight mouseout.chartbarstackedhighlight', (e) =>
          chartBarStackedHoverBar(chartS, select(e.target), e.type.endsWith('over'))
        );

      drawAreaS
        .selectAll<Element, SeriesLabelBar>('.series-label-bar')
        .data(
          labelsEnabled
            ? [
                seriesLabelBarData({
                  barContainer: barSeriesS,
                  ...labelsD,
                }),
              ]
            : []
        )
        .join('g')
        .call((s) => seriesLabelBar(s));

      chartS
        .selectAll<SVGGElement, Legend>('.legend')
        .data([
          legendData({
            labels: subcategories,
            styleClasses: styleClasses,
            ...legendD,
            keys: subcategories,
          }),
        ])
        .join('g')
        .call((s) => legend(s))
        .on('mouseover.chartbarstackedhighlight mouseout.chartbarstackedhighlight', (e) => {
          chartBarStackedHoverLegendItem(
            chartS,
            select(e.target.closest('.legend-item')),
            e.type.endsWith('over')
          );
        });

      xAxis.scale = categoryScale;
      yAxis.scale = valueScale;
      chartCartesianAxes(chartS);

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
  legendItem: Selection<Element, LegendItem>,
  hover: boolean
): void {
  legendItem.each((_, i, g) => {
    const subcategory = g[i].getAttribute('data-key')!;
    chart
      .selectAll<any, Bar>(`.bar[data-subcategory="${subcategory}"]`)
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
      .selectAll<any, Bar>(`.bar[data-category="${category}"]`)
      .classed('highlight', hover)
      .each((d) => chart.selectAll(`.label[data-key="${d.key}"]`).classed('highlight', hover));
  });
}
