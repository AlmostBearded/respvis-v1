import { format } from 'd3-format';
import { BaseType, select, Selection } from 'd3-selection';
import { axisTickFindByIndex, axisTickHighlight } from '../axis';
import { arrayFlat, arrayIs2D, debug, nodeToString, siblingIndex } from '../core';
import {
  chartCartesian,
  chartCartesianUpdateAxes,
  chartCartesianData,
  ChartCartesian,
} from '../core/chart-cartesian';
import {
  LegendSquares,
  legendSquaresData,
  LegendSquaresItem,
  legendItemFindByIndex,
  legendItemFindByLabel,
  legendItemHighlight,
  legendSquares,
} from '../legend';
import { barFindByCategory } from './series-bar';
import { BarGrouped } from './series-bar-grouped';
import {
  barStackedFindBySubcategory,
  SeriesBarStacked,
  seriesBarStackedData,
  seriesBarStacked,
} from './series-bar-stacked';
import { labelFind, labelFindByFilter, labelHighlight, seriesLabel } from './series-label';
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
      labels: (bar) => (bar.height > 10 ? Math.round(bar.value).toString() : ''),
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
    .layout('flex-direction', 'column-reverse')
    .each((chartData, i, g) => {
      const chart = <ChartBarStackedSelection>select(g[i]);
      const drawArea = chart.selectAll('.draw-area');

      drawArea
        .append('g')
        .layout('grid-area', '1 / 1')
        .datum(chartData)
        .call((s) => seriesBarStacked(s))
        .on('mouseover.chartbarstackedhighlight mouseout.chartbarstackedhighlight', (e) =>
          chartBarStackedHoverBar(chart, select(e.target), e.type.endsWith('over'))
        );

      // chart
      //   .append('g')
      //   .classed('legend', true)
      //   .datum(legendSquaresData(chartData.legend))
      //   .call((s) => legendSquares(s))
      //   .layout('margin', '0.5rem')
      //   .layout('justify-content', 'flex-end')
      //   .on('mouseover.chartbarstackedhighlight mouseout.chartbarstackedhighlight', (e) => {
      //     chartBarStackedHoverLegendItem(
      //       chart,
      //       select(e.target.closest('.legend-item')),
      //       e.type.endsWith('over')
      //     );
      //   });
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
    const chartS = <ChartBarStackedSelection>select(g[i]),
      barSeriesS = chartS.selectAll<Element, SeriesBarStacked>('.series-bar-stacked'),
      legend = chartS.selectAll<Element, LegendSquares>('.legend');

    barSeriesS.datum((d) => d);

    const labelSeriesD = seriesLabelBarData({
      barContainer: barSeriesS,
      labels: arrayFlat(chartD.values).map((v) => {
        v = Math.round(v);
        return v > 0 ? v.toString() : '';
      }),
      ...chartD.labels,
    });
    chartS
      .selectAll('.draw-area')
      .selectAll<Element, SeriesLabelBar>('.series-label-bar')
      .data(chartD.labelsEnabled ? [labelSeriesD] : [])
      .join((enter) =>
        enter
          .append('g')
          .layout('grid-area', '1 / 1')
          .call((s) => seriesLabelBar(s))
      );

    // legend.datum((d) =>
    //   Object.assign<LegendSquares, Partial<LegendSquares>, Partial<LegendSquares>>(
    //     d,
    //     {
    //       colors: arrayIs2D(chartD.colors) ? chartD.colors[0] : chartD.colors,
    //       labels: chartD.subcategories,
    //     },
    //     chartD.legend
    //   )
    // );

    chartD.xAxis.scale = chartD.categoryScale;
    chartD.yAxis.scale = chartD.valueScale;

    chartCartesianUpdateAxes(chartS);

    // chartS
    //   .selectAll(`.axis-x .tick`)
    //   .on('mouseover.chartbarstackedhighlight mouseout.chartbarstackedhighlight', (e) =>
    //     chartBarStackedHoverAxisTick(chartS, select(e.currentTarget), e.type.endsWith('over'))
    //   );
  });
}

export function chartBarStackedHoverBar(
  chart: Selection<Element, ChartBarStacked>,
  bar: Selection<SVGRectElement, BarGrouped>,
  hover: boolean
): void {
  const chartD = chart.datum();
  bar.each((barD, i, g) => {
    const categoryIndex = chartD.categories.indexOf(barD.category),
      subcategoryIndex = chartD.subcategories.indexOf(barD.subcategory),
      labelS = labelFind(chart, barD.key),
      tickS = axisTickFindByIndex(chart.selectAll('.axis-x'), categoryIndex),
      legendItemS = legendItemFindByIndex(chart, subcategoryIndex);

    labelHighlight(labelS, hover);
    axisTickHighlight(tickS, hover);
    // legendItemHighlight(legendItemS, hover);
  });
}

// export function chartBarStackedHoverLegendItem(
//   chart: Selection<Element, ChartBarStacked>,
//   legendItem: Selection<Element, LegendSquaresItem>,
//   hover: boolean
// ): void {
//   const legendItemCount = chart.selectAll('.legend-item').size();
//   legendItem.each((_, i, g) => {
//     const legendItemI = siblingIndex(g[i], '.legend-item'),
//       subcategory = chart.datum().subcategories[legendItemI],
//       barS = barStackedFindBySubcategory(chart, subcategory),
//       labelS = labelFindByFilter(
//         chart.selectAll('.series-label-bar'),
//         (_, i) => i % legendItemCount === legendItemI
//       );

//     barStackedHighlight(barS, hover);
//     labelHighlight(labelS, hover);
//   });
// }

// export function chartBarStackedHoverAxisTick(
//   chart: Selection<Element, ChartBarStacked>,
//   tick: Selection<Element>,
//   hover: boolean
// ): void {
//   const legendItemCount = chart.selectAll('.legend-item').size();
//   tick.each((_, i, g) => {
//     const tickI = siblingIndex(g[i], '.tick'),
//       category = chart.datum().categories[tickI],
//       barS = barFindByCategory(chart, category),
//       labelS = labelFindByFilter(
//         chart.selectAll('.series-label-bar'),
//         (_, i) => Math.floor(i / legendItemCount) === tickI
//       );
//     barStackedHighlight(barS, hover);
//     labelHighlight(labelS, hover);
//   });
//   axisTickHighlight(tick, hover);
// }
