import { select, Selection } from 'd3';
import {
  chartCartesianRender,
  chartCartesianAxesRender,
  chartCartesianData,
  ChartCartesian as ChartCartesian,
} from '../core/chart-cartesian';
import { Legend, legendData, legendRender } from '../legend';
import {
  chartBarStackedHoverAxisTick,
  chartBarStackedHoverBar,
  chartBarStackedHoverLegendItem,
} from './chart-bar-stacked';
import {
  BarGrouped,
  SeriesBarGrouped,
  seriesBarGroupedData,
  seriesBarGroupedRender,
} from './series-bar-grouped';
import { SeriesLabelBar, seriesLabelBarData, seriesLabelBar } from './series-label-bar';

export interface ChartBarGrouped extends Omit<SeriesBarGrouped, 'styleClasses'>, ChartCartesian {
  styleClasses: string[];
  legend: Partial<Legend>;
  labelsEnabled: boolean;
  labels: Partial<SeriesLabelBar>;
}

export function chartBarGroupedData(data: Partial<ChartBarGrouped>): ChartBarGrouped {
  const seriesData = seriesBarGroupedData(data);
  return {
    ...seriesData,
    ...chartCartesianData(data),
    styleClasses: data.styleClasses || seriesData.subcategories.map((c, i) => `categorical-${i}`),
    legend: data.legend || {},
    labelsEnabled: data.labelsEnabled ?? true,
    labels: data.labels || {},
  };
}

export type ChartBarGroupedSelection = Selection<SVGSVGElement | SVGGElement, ChartBarGrouped>;

export function chartBarGroupedRender(selection: ChartBarGroupedSelection): void {
  selection
    .call((s) => chartCartesianRender(s))
    .classed('chart-bar-grouped', true)
    .each((chartD, i, g) => {
      const {
        subcategories,
        xAxis,
        yAxis,
        categoryScale,
        valueScale,
        styleClasses,
        labelsEnabled,
        labels: labelsD,
        legend: legendD,
        values,
      } = chartD;
      const chartS = <ChartBarGroupedSelection>select(g[i]);
      const drawAreaS = chartS.selectAll('.draw-area');

      const barSeriesS = drawAreaS
        .selectAll<SVGGElement, SeriesBarGrouped>('.series-bar-grouped')
        .data([chartD])
        .join('g')
        .call((s) => seriesBarGroupedRender(s))
        .on('pointerover.chartbargroupedhighlight pointerout.chartbargroupedhighlight', (e) =>
          chartBarGroupedHoverBar(chartS, select(e.target), e.type.endsWith('over'))
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
          legendData({ labels: subcategories, styleClasses, ...legendD, keys: subcategories }),
        ])
        .join('g')
        .call((s) => legendRender(s))
        .on('pointerover.chartbargroupedhighlight pointerout.chartbargroupedhighlight', (e) => {
          chartBarGroupedHoverLegendItem(
            chartS,
            select(e.target.closest('.legend-item')),
            e.type.endsWith('over')
          );
        });

      xAxis.scale = categoryScale;
      yAxis.scale = valueScale;
      chartCartesianAxesRender(chartS);

      chartS
        .selectAll(`.axis-x .tick`)
        .on('pointerover.chartbargroupedhighlight pointerout.chartbargroupedhighlight', (e) =>
          chartBarGroupedHoverAxisTick(chartS, select(e.currentTarget), e.type.endsWith('over'))
        );
    });
}

export const chartBarGroupedHoverBar = chartBarStackedHoverBar;

export const chartBarGroupedHoverLegendItem = chartBarStackedHoverLegendItem;

export const chartBarGroupedHoverAxisTick = chartBarStackedHoverAxisTick;
