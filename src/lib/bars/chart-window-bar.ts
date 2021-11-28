import { select, Selection } from 'd3-selection';
import {
  chartWindow,
  ToolFilterNominal,
  toolFilterNominalData,
  toolDownloadSVG,
  toolFilterNominal,
  Checkbox,
  layouterCompute,
} from '../core';
import { arrayIs, arrayIs2D, Position } from '../core';
import { chartBar, chartBarData, ChartBar } from './chart-bar';
import { ChartBarGrouped } from './chart-bar-grouped';
import { SeriesLabelBar } from './series-label-bar';

export interface ChartWindowBar extends ChartBar {
  categoryEntity: string;
  valueEntity: string;
  valueDomain: number[] | ((values: number[]) => number[]);
}

export function chartWindowBarData(data: Partial<ChartWindowBar>): ChartWindowBar {
  const chartData = chartBarData(data),
    valueDomain = data.valueDomain || ((values) => [0, Math.max(...values) * 1.05]);

  chartData.valueScale.domain(
    valueDomain instanceof Function ? valueDomain(chartData.values) : valueDomain
  );

  return {
    ...chartData,
    categoryEntity: data.categoryEntity || 'Categories',
    valueEntity: data.valueEntity || 'Values',
    valueDomain: valueDomain,
  };
}

export type ChartWindowBarSelection = Selection<HTMLDivElement, ChartWindowBar>;

export function chartWindowBar(selection: ChartWindowBarSelection): void {
  selection
    .classed('chart-window-bar', true)
    .on('resize.chartwindowbar', function (e, d) {
      chartWindowBarDispatchDensityChange(select(this));
    })
    .call((s) => chartWindow(s))
    .each((chartWindowD, i, g) => {
      const {
        categories,
        categoryScale,
        values,
        valueScale,
        styleClasses,
        keys,
        valueDomain,
        labels: { labels: labels },
      } = chartWindowD;
      const chartWindowS = select<HTMLDivElement, ChartWindowBar>(g[i]),
        menuItemsS = chartWindowS.selectAll('.menu-tools > .items'),
        layouterS = chartWindowS.selectAll<HTMLDivElement, any>('.layouter');

      // category filter
      const categoryFilterS = menuItemsS
        .selectAll<HTMLLIElement, ToolFilterNominal>('.tool-filter-categories')
        .data([
          toolFilterNominalData({
            text: chartWindowD.categoryEntity,
            options: chartWindowD.categories,
            keys: chartWindowD.categories,
          }),
        ])
        .join('li')
        .classed('tool-filter-categories', true)
        .call((s) => toolFilterNominal(s));

      // download svg
      menuItemsS
        .selectAll<HTMLLIElement, any>('.tool-save-svg')
        .data([null])
        .join('li')
        .call((s) => toolDownloadSVG(s));

      const filterCat = (v: any, i: number) =>
        categoryFilterS
          .selectAll(`.checkbox[data-key="${categories[i]}"] input`)
          .property('checked');

      const filteredCategories = categories.filter(filterCat);
      const filteredValues = values.filter(filterCat);
      const filteredStyleClasses = arrayIs(styleClasses)
        ? styleClasses.filter(filterCat)
        : styleClasses;
      const filteredKeys = keys?.filter(filterCat);
      const filteredLabels = arrayIs(labels) ? labels.filter(filterCat) : labels;
      const filteredValueDomain =
        valueDomain instanceof Function ? valueDomain(filteredValues) : valueDomain;

      categoryScale.domain(filteredCategories);
      valueScale.domain(filteredValueDomain);

      // chart
      const chartS = layouterS
        .selectAll<SVGSVGElement, ChartBar>('svg.chart-bar')
        .data([
          chartBarData({
            ...chartWindowD,
            categories: filteredCategories,
            values: filteredValues,
            keys: filteredKeys,
            styleClasses: filteredStyleClasses,
            labels: { ...chartWindowD.labels, labels: filteredLabels },
          }),
        ])
        .join('svg')
        .call((s) => chartBar(s));

      layouterS
        .on('boundschange.chartwindowbar', () => chartBar(chartS))
        .call((s) => layouterCompute(s));

      chartWindowS.on('change.chartwindowbar', function () {
        (<ChartWindowBarSelection>select(this)).call((s) => chartWindowBar(s));
      });

      // chartWindowBarApplyFilters(chartWindowS);
    });
}

// export function chartWindowBarApplyFilters(selection: ChartWindowBarSelection): void {
//   selection.each((chartWindowD, i, g) => {
//     const {
//       categories,
//       values,
//       styleClasses,
//       keys,
//       valueDomain,
//       labels: { labels: labels },
//     } = chartWindowD;
//     const chartWindowS = <ChartWindowBarSelection>select(g[i]);
//     const chartS = chartWindowS.selectAll<Element, ChartBarGrouped>('svg.chart-bar');
//     const catFilterS = chartWindowS.selectAll('.tool-filter-categories');
//     const filterCat = (v: any, i: number) =>
//       catFilterS.selectAll(`.checkbox[data-key="${categories[i]}"] input`).property('checked');

//     const filteredCats = categories.filter(filterCat);
//     const filteredValues = values.filter(filterCat);
//     const filteredStyleClasses = arrayIs(styleClasses)
//       ? styleClasses.filter(filterCat)
//       : styleClasses;
//     const filteredKeys = keys?.filter(filterCat);
//     const filteredLabels = arrayIs(labels) ? labels.filter(filterCat) : labels;
//     const filteredValueDomain =
//       valueDomain instanceof Function ? valueDomain(filteredValues) : valueDomain;

//     chartS.datum(
//       (d) => (
//         d.categoryScale.domain(filteredCats),
//         d.valueScale.domain(filteredValueDomain).nice(),
//         Object.assign(d, chartBarData(chartWindowD), {
//           categories: filteredCats,
//           values: filteredValues,
//           keys: filteredKeys,
//           labels: {
//             ...chartWindowD.labels,
//             labels: filteredLabels,
//           },
//         })
//       )
//     );
//   });
// }

export function chartWindowBarDispatchDensityChange(selection: ChartWindowBarSelection): void {
  selection.each((d, i, g) => {
    const { width, height } = g[i].getBoundingClientRect();
    const { values } = select(g[i]).selectAll<Element, ChartBar>('.chart-bar').datum();
    select(g[i]).dispatch('densitychange', {
      detail: { density: { x: values.length / width, y: values.length / height } },
    });
  });
}
